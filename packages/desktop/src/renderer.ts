import type { PetSessionSummary, PetSnapshot, PetState } from '@xy-deepseek-pet/protocol'
import type { LoadedTheme, ThemeAnimation } from './theme.js'
import { selectCompletionAnimation, selectErrorSequence } from './animation-policy.js'
import { animationFrameIndices, nextAnimationDeadline, pacedFrameDuration } from './animation-timing.js'
import { shouldSubmitComposer } from './composer-input.js'
import { preservesActiveAnimation, shouldDismissComposer } from './interaction-policy.js'
import { displaySessionTitle, formatSessionAge } from './session-display.js'

const canvas = document.querySelector<HTMLCanvasElement>('#pet-canvas')!
const context = canvas.getContext('2d', { alpha: true })!
const petStage = document.querySelector<HTMLButtonElement>('#pet-stage')!
const bubbleStack = document.querySelector<HTMLElement>('#bubble-stack')!
const attentionBadge = document.querySelector<HTMLElement>('#attention-badge')!
const pixelMenu = document.querySelector<HTMLElement>('#pixel-menu')!
const toast = document.querySelector<HTMLElement>('#toast')!

let theme: LoadedTheme
let snapshot: PetSnapshot
let reducedMotion = false
let bubbleVisible = true
let scale = 1
let activationGesture: 'doubleClick' | 'longPress' = 'longPress'
let serviceOwned = false
let walkingEnabled = true
let locale: 'zh-CN' | 'en' = 'zh-CN'
let menuActions: string[] = []
let menuExtensions: Array<{ id: string; label: { 'zh-CN': string; en: string }; invoke: 'open-client' | 'chat' | 'tap' | 'settings'; order?: number }> = []
let animationGeneration = 0
let dragging = false
let dragDistance = 0
let dragOrigin = { x: 0, y: 0 }
let dragFacing: 'left' | 'right' | undefined
let dragLastX = 0
let lastDragEndedAt = 0
let targetSessionId: string | undefined
let composerDraft = ''
let toastTimer: number | undefined
let composerSubmitting = false
let pressedPointerId: number | undefined
let pressGeneration: number | undefined
let pressReleased = true
let pressAnimationComplete = false
let longPressTimer: number | undefined
const imageCache = new Map<string, Promise<HTMLImageElement>>()
let activeErrorSequence: ReturnType<typeof selectErrorSequence> | undefined
let primedCompletion: { theme: LoadedTheme; animation: ThemeAnimation } | undefined
let activeCompletionGeneration: number | undefined
let completionPreloadTimer: number | undefined

const messages = {
  'zh-CN': {
    openClient: '打开 Harness', reply: '回复最近活跃消息', reaction: '播放互动动画', size: '大小', themesSettings: '打开设置',
    stopService: '关闭服务并退出...', quitPet: '关闭桌宠', latestSession: '最新会话', sent: '已发送', sendFailed: '发送失败',
    moreSessions: '个其他会话', acknowledge: '标记为已读', usingTool: '调用工具：', thinkingNow: '正在思考…', done: '已完成',
    disconnected: 'Harness 已断开，正在重连', reconnect: '重新连接', reconnecting: '正在检查 Harness 连接…',
    composerLabel: '回复 Harness 会话', messageLabel: '消息', messagePlaceholder: '输入回复，按 Enter 发送',
    waitingAnswer: '等待你回答问题', approvalRequired: '需要你审批：',
  },
  en: {
    openClient: 'Open Harness', reply: 'Reply to latest session', reaction: 'Play reaction', size: 'Size', themesSettings: 'Open settings',
    stopService: 'Stop service & quit...', quitPet: 'Quit pet', latestSession: 'Latest session', sent: 'Sent', sendFailed: 'Could not send',
    moreSessions: 'more sessions', acknowledge: 'Mark as read', usingTool: 'Using tool: ', thinkingNow: 'Thinking…', done: 'Done',
    disconnected: 'Harness disconnected. Reconnecting…', reconnect: 'Reconnect', reconnecting: 'Checking Harness connection…',
    composerLabel: 'Reply to Harness session', messageLabel: 'Message', messagePlaceholder: 'Type a reply and press Enter to send',
    waitingAnswer: 'Waiting for your answer', approvalRequired: 'Approval required: ',
  },
} as const

const stateMessages: Record<'zh-CN' | 'en', Record<PetState, string>> = {
  'zh-CN': { idle: '待机', sleep: '打瞌睡', walk: '走动', thinking: '思考中', working: '工作中', needsInput: '需要回复', complete: '已完成', error: '出错了', offline: '未连接' },
  en: { idle: 'Idle', sleep: 'Sleeping', walk: 'Walking', thinking: 'Thinking', working: 'Working', needsInput: 'Needs input', complete: 'Complete', error: 'Error', offline: 'Offline' },
}

function t(key: keyof typeof messages['zh-CN']): string {
  return messages[locale][key]
}

function applyLanguage(): void {
  document.documentElement.lang = locale
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n as keyof typeof messages['zh-CN']
    element.textContent = t(key)
  })
  renderMenuExtensions()
  renderBubbles()
}

function renderMenuExtensions(): void {
  pixelMenu.querySelectorAll('.extension-menu-action').forEach((element) => element.remove())
  const anchor = pixelMenu.querySelector('#menu-settings')
  for (const extension of menuExtensions) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'extension-menu-action'
    button.dataset.menuAction = extension.invoke
    button.dataset.extensionId = extension.id
    button.textContent = extension.label[locale]
    pixelMenu.insertBefore(button, anchor)
  }
}

function recordInteraction(): void {
  void window.harnessPet.recordInteraction()
}

function assetUrl(path: string): string {
  return new URL(path, theme.baseUrl).href
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url)
  if (cached) return cached
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (typeof image.decode !== 'function') return resolve(image)
      void image.decode().then(() => resolve(image), () => resolve(image))
    }
    image.onerror = () => reject(new Error(`Could not load theme asset ${url}`))
    image.src = url
  })
  imageCache.set(url, promise)
  return promise
}

function animationFiles(animation: ThemeAnimation): string[] {
  return animation.kind === 'frames' ? animation.files : [animation.file]
}

function preloadAnimation(animation: ThemeAnimation, loadedTheme: LoadedTheme): void {
  for (const file of animationFiles(animation)) {
    void loadImage(new URL(file, loadedTheme.baseUrl).href).catch(() => undefined)
  }
}

function primeNextCompletion(loadedTheme: LoadedTheme): void {
  if (theme !== loadedTheme) return
  const animation = selectCompletionAnimation(loadedTheme.manifest)
  primedCompletion = { theme: loadedTheme, animation }
  preloadAnimation(animation, loadedTheme)
}

function scheduleCompletionPreload(loadedTheme: LoadedTheme): void {
  if (completionPreloadTimer) window.clearTimeout(completionPreloadTimer)
  completionPreloadTimer = window.setTimeout(() => {
    completionPreloadTimer = undefined
    primeNextCompletion(loadedTheme)
  }, 500)
}

function frameDuration(animation: ThemeAnimation, index: number, count: number): number {
  const authoredDuration = animation.frameDurationsMs?.[index] ?? 1000 / (animation.fps ?? 8)
  return pacedFrameDuration(authoredDuration, index, count, animation.pacing)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function drawFrame(animation: ThemeAnimation, index: number, flipHorizontal: boolean): Promise<void> {
  if (animation.kind === 'frames') {
    const file = animation.files[index]
    if (!file) return
    const image = await loadImage(assetUrl(file))
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.save()
    if (flipHorizontal) {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    context.restore()
    return
  }
  const image = await loadImage(assetUrl(animation.file))
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.save()
  if (flipHorizontal) {
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
  }
  const sourceIndex = (animation.frameOffset ?? 0) + index
  const column = sourceIndex % animation.columns
  const row = Math.floor(sourceIndex / animation.columns)
  context.drawImage(
    image,
    column * animation.frameWidth,
    row * animation.frameHeight,
    animation.frameWidth,
    animation.frameHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  context.restore()
}

function animationFor(key: string, facing = snapshot.facing): { animation: ThemeAnimation; flip: boolean } | undefined {
  const directionalKey = key === 'walk' ? (facing === 'left' ? 'walkLeft' : 'walkRight') : undefined
  const directional = directionalKey ? theme.manifest.animations[directionalKey] : undefined
  const fallbackKey = (key === 'needsInput' || key === 'sleep') && !theme.manifest.animations[key] ? 'idle' : key
  const animation = directional ?? theme.manifest.animations[fallbackKey] ?? theme.manifest.animations.idle
  if (!animation) return undefined
  const flip = key === 'walk' && !directional && facing !== (theme.manifest.walkBaseFacing ?? 'right')
  return { animation, flip }
}

async function runAnimation(
  animation: ThemeAnimation,
  flip: boolean,
  generation: number,
  loop = animation.loop,
): Promise<void> {
  const count = animation.kind === 'frames' ? animation.files.length : animation.frameCount
  if (canvas.width !== theme.manifest.canvas.width) canvas.width = theme.manifest.canvas.width
  if (canvas.height !== theme.manifest.canvas.height) canvas.height = theme.manifest.canvas.height
  if (reducedMotion) return drawFrame(animation, loop ? 0 : count - 1, flip)
  do {
    let deadline = performance.now()
    for (const index of animationFrameIndices(count, animation.pacing)) {
      if (generation !== animationGeneration) return
      await drawFrame(animation, index, flip)
      const timing = nextAnimationDeadline(deadline, frameDuration(animation, index, count), performance.now())
      deadline = timing.deadline
      if (timing.delay > 0) await sleep(timing.delay)
    }
  } while (loop && generation === animationGeneration)
}

async function runFrameSequence(
  animation: ThemeAnimation,
  flip: boolean,
  generation: number,
  indices: number[],
): Promise<void> {
  const count = animation.kind === 'frames' ? animation.files.length : animation.frameCount
  if (canvas.width !== theme.manifest.canvas.width) canvas.width = theme.manifest.canvas.width
  if (canvas.height !== theme.manifest.canvas.height) canvas.height = theme.manifest.canvas.height
  if (indices.length === 0) return
  if (reducedMotion) return drawFrame(animation, indices.at(-1)!, flip)
  let deadline = performance.now()
  for (const index of indices) {
    if (generation !== animationGeneration) return
    await drawFrame(animation, index, flip)
    const timing = nextAnimationDeadline(deadline, frameDuration(animation, index, count), performance.now())
    deadline = timing.deadline
    if (timing.delay > 0) await sleep(timing.delay)
  }
}

function animationFlip(key: string): boolean {
  return key === 'walk' && snapshot.facing !== (theme.manifest.walkBaseFacing ?? 'right')
}

function playAnimation(key: string): void {
  const generation = ++animationGeneration
  const selected = animationFor(key)
  if (selected) void runAnimation(selected.animation, selected.flip, generation)
}

function playWalk(facing: 'left' | 'right'): void {
  const generation = ++animationGeneration
  const selected = animationFor('walk', facing)
  if (selected) void runAnimation(selected.animation, selected.flip, generation, true)
}

function playTransition(transition: ThemeAnimation, targetKey: string, target?: ThemeAnimation): void {
  const generation = ++animationGeneration
  void runAnimation(transition, false, generation, false).then(() => {
    if (generation !== animationGeneration || snapshot.state !== targetKey) return
    const selected = target ? { animation: target, flip: false } : animationFor(targetKey)
    if (selected) void runAnimation(selected.animation, selected.flip, generation, true)
  })
}

function playCompletion(): void {
  const loadedTheme = theme
  const animation = primedCompletion?.theme === loadedTheme
    ? primedCompletion.animation
    : selectCompletionAnimation(loadedTheme.manifest)
  primedCompletion = undefined
  const generation = ++animationGeneration
  activeCompletionGeneration = generation
  void runAnimation(animation, false, generation, false).then(() => {
    if (activeCompletionGeneration === generation) activeCompletionGeneration = undefined
    if (theme === loadedTheme) scheduleCompletionPreload(loadedTheme)
    if (generation === animationGeneration && snapshot.state !== 'complete') {
      playState(snapshot.state, 'complete')
    }
  })
}

function playErrorSequence(): void {
  activeErrorSequence = selectErrorSequence(theme.manifest)
  const generation = ++animationGeneration
  void runAnimation(activeErrorSequence.enter, false, generation, false).then(() => {
    if (generation !== animationGeneration || snapshot.state !== 'error' || !activeErrorSequence?.loop) return
    void runAnimation(activeErrorSequence.loop, false, generation, true)
  })
}

function playState(next: PetState, previous?: PetState): void {
  if (previous === 'error' && next !== 'error' && activeErrorSequence?.exit) {
    const exit = activeErrorSequence.exit
    activeErrorSequence = undefined
    playTransition(exit, next)
    return
  }
  if (next === 'error') {
    playErrorSequence()
    return
  }
  if (next === 'thinking' && previous !== 'thinking' && theme.manifest.animations.thinkingEnter) {
    playTransition(theme.manifest.animations.thinkingEnter, 'thinking')
    return
  }
  if (next === 'complete') {
    playCompletion()
    return
  }
  playAnimation(next)
}

function playPress(): void {
  if (preservesActiveAnimation(snapshot.state)) return
  const tap = theme.manifest.animations.tap ?? theme.manifest.animations.idle
  if (!tap) return
  const generation = ++animationGeneration
  const count = tap.kind === 'frames' ? tap.files.length : tap.frameCount
  const forward = animationFrameIndices(count, tap.pacing)
  pressGeneration = generation
  pressReleased = false
  pressAnimationComplete = false
  void runFrameSequence(tap, animationFlip('tap'), generation, forward).then(() => {
    if (generation !== animationGeneration) return
    pressAnimationComplete = true
    if (pressReleased) playPressRebound(tap, generation, forward)
  })
}

function handlePetTap(): void {
  playPress()
  releasePress()
}

function releasePress(): void {
  if (preservesActiveAnimation(snapshot.state)) return
  pressReleased = true
  if (pressGeneration !== animationGeneration || !pressAnimationComplete) return
  const tap = theme.manifest.animations.tap ?? theme.manifest.animations.idle
  if (!tap) return playState(snapshot.state, snapshot.state)
  const count = tap.kind === 'frames' ? tap.files.length : tap.frameCount
  playPressRebound(tap, pressGeneration, animationFrameIndices(count, tap.pacing))
}

function playPressRebound(tap: ThemeAnimation, generation: number, forward: number[]): void {
  pressAnimationComplete = false
  const reverse = forward.slice(0, -1).reverse()
  void runFrameSequence(tap, animationFlip('tap'), generation, reverse).then(() => {
    if (generation === animationGeneration) playState(snapshot.state, snapshot.state)
  })
}

function clearLongPressTimer(): void {
  if (longPressTimer !== undefined) window.clearTimeout(longPressTimer)
  longPressTimer = undefined
}

function stateLabel(state: PetState): string {
  return stateMessages[locale][state]
}

function sessionText(session: PetSessionSummary): string {
  if (session.state === 'thinking' && (!session.text || session.text === 'Thinking')) return t('thinkingNow')
  if (session.state === 'working' && session.text?.startsWith('Using ')) return `${t('usingTool')}${session.text.slice(6)}`
  if (session.state === 'complete' && session.text === 'Done') return t('done')
  if (session.text === 'Waiting for your answer') return t('waitingAnswer')
  if (session.text?.startsWith('Approval required: ')) return `${t('approvalRequired')}${session.text.slice(19)}`
  return session.text ?? ''
}

function qualifyingSessions(): PetSessionSummary[] {
  if (snapshot.sessions?.length) return snapshot.sessions
  if (!snapshot.sessionId || snapshot.state === 'idle' || snapshot.state === 'sleep' || snapshot.state === 'walk') return []
  return [{
    id: snapshot.sessionId,
    title: '',
    state: snapshot.state,
    unread: snapshot.state === 'complete' || snapshot.state === 'error' || snapshot.state === 'needsInput',
    updatedAt: snapshot.time,
    ...(snapshot.text ? { text: snapshot.text } : {}),
  }]
}

function renderBubbles(): void {
  const sessions = qualifyingSessions()
  bubbleStack.replaceChildren()
  if (!bubbleVisible || sessions.length === 0) {
    bubbleStack.classList.add('is-hidden')
    return
  }
  bubbleStack.classList.remove('is-hidden')
  const visible = sessions.length > 3 ? sessions.slice(0, 2) : sessions.slice(0, 3)
  for (const session of visible) {
    const bubble = document.createElement('div')
    bubble.className = `session-bubble state-${session.state}${session.unread ? ' is-unread' : ''}`
    bubble.dataset.sessionId = session.id
    bubble.title = session.text ?? session.title
    if (targetSessionId === session.id) {
      bubble.classList.add('is-composing')
      const form = document.createElement('form')
      form.className = 'session-composer'
      const heading = document.createElement('div')
      heading.className = 'session-heading'
      const title = document.createElement('span')
      title.className = 'session-title'
      title.textContent = displaySessionTitle(session.title, locale)
      const time = document.createElement('time')
      time.className = 'session-time'
      time.dateTime = new Date(session.updatedAt).toISOString()
      time.textContent = formatSessionAge(session.updatedAt, Date.now(), locale)
      heading.append(title, time)
      const input = document.createElement('textarea')
      input.className = 'session-composer-input'
      input.maxLength = 8000
      input.rows = 2
      input.value = composerDraft
      input.placeholder = t('messagePlaceholder')
      input.setAttribute('aria-label', `${t('composerLabel')}：${displaySessionTitle(session.title, locale)}`)
      input.addEventListener('input', () => { composerDraft = input.value })
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          closeComposer()
          return
        }
        if (!shouldSubmitComposer(event)) return
        event.preventDefault()
        void submitComposer(input)
      })
      const open = document.createElement('button')
      open.type = 'button'
      open.className = 'session-open-client'
      open.textContent = '↗'
      open.title = t('openClient')
      open.setAttribute('aria-label', `${t('openClient')}：${displaySessionTitle(session.title, locale)}`)
      open.addEventListener('click', () => {
        recordInteraction()
        closeComposer()
        void window.harnessPet.acknowledge(session.id)
        void window.harnessPet.openClient(session.id)
      })
      form.addEventListener('submit', (event) => { event.preventDefault(); void submitComposer(input) })
      form.append(heading, input, open)
      bubble.append(form)
      bubbleStack.append(bubble)
      queueMicrotask(() => input.focus())
      continue
    }
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'session-bubble-main'
    button.innerHTML = `<span class="session-heading"><span class="session-title"></span><time class="session-time"></time></span><span class="session-state"></span><span class="session-text"></span>`
    button.querySelector<HTMLElement>('.session-title')!.textContent = displaySessionTitle(session.title, locale)
    const time = button.querySelector<HTMLTimeElement>('.session-time')!
    time.dateTime = new Date(session.updatedAt).toISOString()
    time.textContent = formatSessionAge(session.updatedAt, Date.now(), locale)
    button.querySelector<HTMLElement>('.session-state')!.textContent = stateLabel(session.state)
    button.querySelector<HTMLElement>('.session-text')!.textContent = sessionText(session)
    button.addEventListener('click', () => {
      recordInteraction()
      openComposer(session)
    })
    bubble.append(button)
    if (session.unread) {
      const acknowledge = document.createElement('button')
      acknowledge.type = 'button'
      acknowledge.className = 'session-acknowledge'
      acknowledge.textContent = '✓'
      acknowledge.title = t('acknowledge')
      acknowledge.setAttribute('aria-label', `${t('acknowledge')}：${displaySessionTitle(session.title, locale)}`)
      acknowledge.addEventListener('click', (event) => {
        event.stopPropagation()
        recordInteraction()
        void window.harnessPet.acknowledge(session.id)
      })
      bubble.append(acknowledge)
    }
    bubbleStack.append(bubble)
  }
  if (sessions.length > 3) {
    const overflow = document.createElement('button')
    overflow.type = 'button'
    overflow.className = 'session-bubble overflow-bubble'
    overflow.textContent = `... +${sessions.length - 2}`
    overflow.title = `${sessions.length - 2} ${t('moreSessions')}`
    overflow.addEventListener('click', () => void window.harnessPet.openClient())
    bubbleStack.append(overflow)
  }
}

function renderStatus(): void {
  const disconnected = !snapshot.connected || snapshot.state === 'offline'
  const needsAttention = snapshot.state === 'needsInput'
  attentionBadge.classList.toggle('is-hidden', !disconnected && !needsAttention)
  attentionBadge.classList.toggle('is-disconnected', disconnected)
  const badgeLabel = disconnected ? t('disconnected') : stateLabel('needsInput')
  attentionBadge.title = badgeLabel
  attentionBadge.setAttribute('aria-label', badgeLabel)
  petStage.style.setProperty('--pet-scale', String(scale))
  bubbleStack.style.setProperty('--pet-scale', String(scale))
  pixelMenu.style.setProperty('--pet-scale', String(scale))
  pixelMenu.querySelector<HTMLElement>('[data-menu-action="stop-service"]')?.classList.toggle('is-hidden', !serviceOwned)
  pixelMenu.querySelector<HTMLElement>('[data-menu-action="reconnect"]')?.classList.toggle('is-hidden', !disconnected)
  pixelMenu.querySelectorAll<HTMLElement>('[data-menu-action]').forEach((element) => {
    const action = element.dataset.menuAction
    if (!action || action === 'quit' || action === 'reconnect') return
    const id = element.dataset.extensionId ?? (action === 'quit' ? 'quit-pet' : action)
    const hidden = !menuActions.includes(id) || (action === 'stop-service' && !serviceOwned)
    element.classList.toggle('is-hidden', hidden)
  })
  renderBubbles()
}

function applySnapshot(next: PetSnapshot): void {
  const previousState = snapshot?.state
  const stateChanged = !snapshot || next.state !== previousState
  snapshot = next
  renderStatus()
  const holdingPress = pressedPointerId !== undefined && dragDistance <= 4 && !preservesActiveAnimation(next.state)
  if (stateChanged && !holdingPress && !(previousState === 'complete' && activeCompletionGeneration !== undefined)) {
    playState(next.state, previousState)
  }
}

function applyTheme(next: LoadedTheme): void {
  theme = next
  imageCache.clear()
  primedCompletion = undefined
  playState(snapshot?.state ?? 'idle')
  scheduleCompletionPreload(next)
}

function openComposer(session?: PetSessionSummary): void {
  const selected = session ?? qualifyingSessions()[0]
  if (!selected) return
  targetSessionId = selected.id
  composerDraft = ''
  pixelMenu.classList.add('is-hidden')
  renderBubbles()
}

function closeComposer(): void {
  targetSessionId = undefined
  composerDraft = ''
  renderBubbles()
}

function showToast(message: string): void {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.textContent = message
  toast.classList.remove('is-hidden')
  toastTimer = window.setTimeout(() => toast.classList.add('is-hidden'), 2800)
}

petStage.addEventListener('contextmenu', (event) => {
  event.preventDefault()
  recordInteraction()
  pixelMenu.classList.toggle('is-hidden')
  pixelMenu.querySelector<HTMLButtonElement>('button')?.focus()
})

document.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return
  const target = event.target as Node
  if (!pixelMenu.classList.contains('is-hidden') && !pixelMenu.contains(target) && !petStage.contains(target)) {
    pixelMenu.classList.add('is-hidden')
  }
  const activeComposer = bubbleStack.querySelector('.session-bubble.is-composing')
  if (shouldDismissComposer(targetSessionId, Boolean(activeComposer?.contains(target)))) {
    const dismissedSessionId = targetSessionId
    window.requestAnimationFrame(() => {
      if (targetSessionId === dismissedSessionId) closeComposer()
    })
  }
})

petStage.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return
  recordInteraction()
  dragging = true
  dragDistance = 0
  dragFacing = undefined
  dragLastX = event.screenX
  dragOrigin = { x: event.screenX, y: event.screenY }
  pressedPointerId = event.pointerId
  clearLongPressTimer()
  petStage.setPointerCapture(event.pointerId)
  window.harnessPet.beginDrag({ x: event.screenX, y: event.screenY })
  if (!preservesActiveAnimation(snapshot.state)) playPress()
  if (activationGesture === 'longPress') {
    longPressTimer = window.setTimeout(() => {
      longPressTimer = undefined
      if (!dragging || dragDistance > 4 || pressedPointerId !== event.pointerId) return
      void window.harnessPet.openClient(snapshot.sessionId)
    }, 550)
  }
})

petStage.addEventListener('pointermove', (event) => {
  if (!dragging) return
  const horizontalDelta = event.screenX - dragOrigin.x
  const horizontalMovement = event.screenX - dragLastX
  dragLastX = event.screenX
  dragDistance = Math.max(dragDistance, Math.hypot(horizontalDelta, event.screenY - dragOrigin.y))
  if (dragDistance > 4) clearLongPressTimer()
  const nextFacing = horizontalMovement < -1 ? 'left' : horizontalMovement > 1 ? 'right' : dragFacing
  if (dragDistance > 4 && nextFacing && nextFacing !== dragFacing) {
    dragFacing = nextFacing
    if (!preservesActiveAnimation(snapshot.state)) playWalk(nextFacing)
  }
  window.harnessPet.dragTo({ x: event.screenX, y: event.screenY })
})

petStage.addEventListener('pointerup', (event) => {
  if (!dragging) return
  dragging = false
  pressedPointerId = undefined
  clearLongPressTimer()
  window.harnessPet.endDrag()
  if (dragDistance > 4) {
    lastDragEndedAt = Date.now()
    dragFacing = undefined
    if (!preservesActiveAnimation(snapshot.state)) playState(snapshot.state, snapshot.state)
    return
  }
  releasePress()
})

petStage.addEventListener('dblclick', () => {
  if (activationGesture !== 'doubleClick') return
  if (Date.now() - lastDragEndedAt < 500) return
  void window.harnessPet.openClient(snapshot.sessionId)
})

petStage.addEventListener('pointercancel', (event) => {
  if (pressedPointerId !== event.pointerId) return
  dragging = false
  pressedPointerId = undefined
  clearLongPressTimer()
  pressReleased = true
  window.harnessPet.endDrag()
  if (!preservesActiveAnimation(snapshot.state)) playState(snapshot.state, snapshot.state)
})

async function submitComposer(input: HTMLTextAreaElement): Promise<void> {
  if (composerSubmitting) return
  const text = composerDraft.trim()
  if (!text) return
  composerSubmitting = true
  input.disabled = true
  try {
    const result = await window.harnessPet.submitChat(text, targetSessionId)
    if (result.ok) {
      closeComposer()
      showToast(t('sent'))
    } else showToast(result.error ?? t('sendFailed'))
  } finally {
    composerSubmitting = false
    input.disabled = false
  }
}

pixelMenu.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button')
  if (!button) return
  recordInteraction()
  const selectedScale = Number(button.dataset.scale)
  if (Number.isFinite(selectedScale) && selectedScale >= 0.4 && selectedScale <= 2) {
    void window.harnessPet.setScale(selectedScale)
  }
  const action = button.dataset.menuAction
  if (action === 'open-client') void window.harnessPet.openClient(snapshot.sessionId)
  if (action === 'chat') openComposer()
  if (action === 'tap') handlePetTap()
  if (action === 'settings') void window.harnessPet.openClient()
  if (action === 'reconnect') {
    showToast(t('reconnecting'))
    void window.harnessPet.reconnect().then((result) => {
      if (!result.ok) showToast(result.error ?? t('sendFailed'))
    })
  }
  if (action === 'quit') void window.harnessPet.quit()
  if (action === 'stop-service') void window.harnessPet.stopService()
  pixelMenu.classList.add('is-hidden')
})
document.addEventListener('keydown', (event) => {
  recordInteraction()
  if (event.key === 'Escape') {
    if (targetSessionId) closeComposer()
    else pixelMenu.classList.add('is-hidden')
  }
})

window.harnessPet.onSnapshot(applySnapshot)
window.harnessPet.onTheme(applyTheme)
window.harnessPet.onOpenChat(() => openComposer())
window.harnessPet.onServiceOwned((owned) => {
  serviceOwned = owned
  renderStatus()
})
window.harnessPet.onPreferences((value) => {
  reducedMotion = value.reducedMotion
  bubbleVisible = value.bubbleVisible
  scale = value.scale
  activationGesture = value.activationGesture
  walkingEnabled = value.walkingEnabled
  locale = value.locale
  menuActions = value.menuActions
  menuExtensions = value.menuExtensions
  applyLanguage()
  renderStatus()
  if (!preservesActiveAnimation(snapshot.state)) playState(snapshot.state, snapshot.state)
})

const bootstrap = await window.harnessPet.getBootstrap()
theme = bootstrap.theme
snapshot = bootstrap.snapshot
reducedMotion = bootstrap.reducedMotion
bubbleVisible = bootstrap.bubbleVisible
scale = bootstrap.scale
activationGesture = bootstrap.activationGesture
serviceOwned = bootstrap.serviceOwned
walkingEnabled = bootstrap.preferences.walkingEnabled
locale = bootstrap.preferences.locale
menuActions = bootstrap.preferences.menuActions
menuExtensions = bootstrap.preferences.menuExtensions
applyLanguage()
renderStatus()
playState(snapshot.state)
scheduleCompletionPreload(theme)
window.setInterval(() => { if (!targetSessionId) renderBubbles() }, 60_000)
