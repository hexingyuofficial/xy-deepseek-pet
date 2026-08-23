import type { PetChatImage, PetQuestionAnswer, PetSessionActivity, PetSessionSummary, PetSnapshot, PetState } from '@xy-deepseek-pet/protocol'
import type { LoadedTheme, ThemeAnimation } from './theme.js'
import {
  completionFollowupState,
  isJackpotCompletionAnimation,
  selectCompletionAnimation,
  selectErrorSequence,
  shouldPlayStateChange,
  shouldSwitchWalkFacing,
  turnActivityDecision,
} from './animation-policy.js'
import { animationFrameIndices, nextAnimationDeadline, pacedFrameDuration, visibleAnimationFrameIndices } from './animation-timing.js'
import { bubbleDragLimits, bubbleSideForCenter, constrainBubbleOffset, petPlacementAdjusted, type BubbleSide } from './bubble-position.js'
import { shouldSubmitComposer } from './composer-input.js'
import { chatTextWithPaths, fileToBase64, imageMediaType, MAX_CHAT_IMAGE_BYTES, MAX_CHAT_IMAGES, mergeComposerPaths } from './composer-attachments.js'
import { canStartVoiceInput, preservesActiveAnimation, shouldDismissComposer, shouldPausePointerChase, shouldRecoverLostPointerRelease, VOICE_LONG_PRESS_MS } from './interaction-policy.js'
import { renderMarkdown, renderMarkdownInline } from './markdown.js'
import { shouldAutoSubmitChoices } from './question-policy.js'
import { displaySessionTitle, formatSessionAge } from './session-display.js'
import {
  bubbleSessions,
  recentReplyableSessions,
  replyableSessions,
  sessionActivitiesForPanel,
  sessionBubbleDismissal,
  shouldReleaseSessionBubbleDismissal,
  type SessionBubbleDismissal,
} from './session-selection.js'
import { resolveSubmenuPosition } from './submenu-position.js'
import { themeDisplayBox } from './theme-layout.js'
import { MAX_VOICE_SECONDS, mediaBlobToVoiceWav, VOICE_CUE_FILES } from './voice-audio.js'
import type { WindowDock } from './window-layout.js'

const canvas = document.querySelector<HTMLCanvasElement>('#pet-canvas')!
const context = canvas.getContext('2d', { alpha: true })!
const petStage = document.querySelector<HTMLButtonElement>('#pet-stage')!
const bubbleStack = document.querySelector<HTMLElement>('#bubble-stack')!
const attentionBadge = document.querySelector<HTMLElement>('#attention-badge')!
const pixelMenu = document.querySelector<HTMLElement>('#pixel-menu')!
const recentSessionMenu = document.querySelector<HTMLElement>('#recent-session-menu')!
const recentSessionTrigger = document.querySelector<HTMLButtonElement>('#menu-recent-chat')!

let theme: LoadedTheme
let snapshot: PetSnapshot
let reducedMotion = false
let bubbleVisible = true
let scale = 1
let doubleClickAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness' = 'openHarness'
let longPressAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness' = 'voice'
let voiceInputEnabled = true
let serviceOwned = false
let walkingEnabled = true
let mouseChaseEnabled = false
let locale: 'zh-CN' | 'en' = 'zh-CN'
let windowDock: WindowDock = 'center'
let petStageOffset = { x: 0, y: 0 }
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
const composerDrafts = new Map<string, string>()
interface ComposerAttachmentDraft {
  paths: string[]
  images: Array<PetChatImage & { bytes: number }>
}
const composerAttachments = new Map<string, ComposerAttachmentDraft>()
const questionDrafts = new Map<string, Map<string, { selected: Set<string>; custom: string }>>()
let focusComposerSessionId: string | undefined
let pendingComposePaths: string[] = []
const dismissedSessionIds = new Map<string, SessionBubbleDismissal>()
let composerSubmittingSessionId: string | undefined
let questionSubmittingRequestId: string | undefined
let pressedPointerId: number | undefined
let pressGeneration: number | undefined
let pressReleased = true
let pressAnimationComplete = false
let longPressTimer: number | undefined
let longPressTriggered = false
let voiceRequested = false
let voiceStartPromise: Promise<void> | undefined
let voiceFinishPromise: Promise<void> | undefined
let voiceStopMode: 'release' | 'toggle' | undefined
let voiceSessionId: string | undefined
let voiceStartedAt = 0
let voiceStatusTimer: number | undefined
let voiceComposerFeedback: { sessionId: string; message: string } | undefined
let voiceRecording: {
  recorder: MediaRecorder
  stream: MediaStream
  chunks: Blob[]
  mimeType: string
  sessionId: string
  timeout: number
  stopped: Promise<Blob>
} | undefined
const imageCache = new Map<string, Promise<HTMLImageElement>>()
const sheetFrameIndicesCache = new WeakMap<ThemeAnimation, Promise<number[]>>()
let activeErrorSequence: ReturnType<typeof selectErrorSequence> | undefined
let primedCompletion: { theme: LoadedTheme; animation: ThemeAnimation } | undefined
let activeCompletionGeneration: number | undefined
let completionPreloadTimer: number | undefined
const observedTurns = new Map<string, number>()
let bubbleClickTimer: number | undefined
let bubbleOffset = { x: 0, y: 0 }
let bubbleSide: BubbleSide | 'auto' = 'auto'
let bubbleLayoutAdjustmentPending = false
let bubbleDrag: {
  pointerId: number
  startClient: { x: number; y: number }
  startRect: { left: number; top: number; width: number; height: number }
  startOffset: { x: number; y: number }
  active: boolean
} | undefined
let suppressBubbleActivationUntil = 0
let menuRequestedOpen = false
let menuSwapTimer: number | undefined
let menuHideTimer: number | undefined
let menuOpenFrame: number | undefined
let recentMenuCloseTimer: number | undefined

const MENU_TRANSITION_MS = 90
const chasePauseRegions = [bubbleStack, pixelMenu, recentSessionMenu]
let ignoringWindowMouse = false
let lastWindowPointer: { x: number; y: number } | undefined
let textInputActive = false

function petPixelAt(clientX: number, clientY: number): boolean {
  if (document.elementFromPoint(clientX, clientY)?.closest('#attention-badge')) return true
  const rect = canvas.getBoundingClientRect()
  if (clientX < rect.left || clientX >= rect.right || clientY < rect.top || clientY >= rect.bottom) return false
  const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((clientX - rect.left) * canvas.width / rect.width)))
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((clientY - rect.top) * canvas.height / rect.height)))
  try {
    return context.getImageData(x, y, 1, 1).data[3]! > 8
  } catch {
    return true
  }
}

function interactiveSurfaceAt(clientX: number, clientY: number): boolean {
  const target = document.elementFromPoint(clientX, clientY)
  return chasePauseRegions.some((region) => target instanceof Node && region.contains(target)) || petPixelAt(clientX, clientY)
}

function syncWindowMousePassthrough(event: MouseEvent): void {
  if (dragging || bubbleDrag?.active) return
  lastWindowPointer = { x: event.clientX, y: event.clientY }
  const interactive = interactiveSurfaceAt(event.clientX, event.clientY)
  const ignored = !interactive
  if (ignored === ignoringWindowMouse) return
  ignoringWindowMouse = ignored
  window.harnessPet.setIgnoreMouseEvents(ignored)
}

function releaseMouseIfFrameMovedAway(): void {
  if (dragging || bubbleDrag?.active || ignoringWindowMouse || !lastWindowPointer) return
  if (interactiveSurfaceAt(lastWindowPointer.x, lastWindowPointer.y)) return
  ignoringWindowMouse = true
  window.harnessPet.setIgnoreMouseEvents(true)
}

function syncChasePause(): void {
  const active = document.activeElement
  const paused = chasePauseRegions.some((region) => shouldPausePointerChase(
    region.matches(':hover'),
    active instanceof Node && region.contains(active),
  ))
  window.harnessPet.setChasePaused(paused)
}

for (const region of chasePauseRegions) {
  region.addEventListener('pointerenter', syncChasePause)
  region.addEventListener('pointerleave', () => window.requestAnimationFrame(syncChasePause))
}
document.addEventListener('focusin', syncChasePause)
document.addEventListener('focusout', () => window.requestAnimationFrame(syncChasePause))
document.addEventListener('mousemove', syncWindowMousePassthrough)

function syncTextInputLayer(): void {
  const active = document.activeElement
  const next = active instanceof HTMLInputElement
    || active instanceof HTMLTextAreaElement
    || (active instanceof HTMLElement && active.isContentEditable)
  if (next === textInputActive) return
  textInputActive = next
  window.harnessPet.setTextInputActive(next)
}

document.addEventListener('focusin', syncTextInputLayer)
document.addEventListener('focusout', () => window.requestAnimationFrame(syncTextInputLayer))
window.addEventListener('blur', () => {
  if (!textInputActive) return
  textInputActive = false
  window.harnessPet.setTextInputActive(false)
})

const messages = {
  'zh-CN': {
    openClient: '打开 Harness', reply: '回复最近活跃消息', reaction: '播放互动动画', size: '大小', themesSettings: '打开设置',
    stopService: '关闭服务并退出...', quitPet: '关闭桌宠', latestSession: '最新会话',
    moreSessions: '个其他会话', acknowledge: '标记为已读', usingTool: '调用工具：', thinkingNow: '正在思考…', done: '已完成',
    disconnected: '与 Harness 的连接已断开。请右键选择“重新连接”；仍未恢复，请重启 Harness。', reconnect: '重新连接',
    composerLabel: '回复 Harness 会话', messageLabel: '消息', messagePlaceholder: '输入回复，按 Enter 发送',
    removeAttachment: '移除附件', imageTooLarge: '图片总大小不能超过 8 MiB', tooManyImages: '最多添加 4 张图片', unsupportedDrop: '这个文件没有可用的本地路径',
    waitingAnswer: '等待你回答问题', choiceRequired: '需要你选择', approvalRequired: '需要你审批：',
    allowOnce: '本次允许', reject: '拒绝',
    chooseOne: '请选择一项', chooseMultiple: '可选择多项', customAnswer: '其他答案', submitChoices: '确认选择', submittingChoices: '正在提交…',
    activity: '会话进度', pressEnter: '发送', openWeb: '网页', closeDetails: '关闭', bubbleHint: '详情', chaseMouse: '追逐鼠标',
    recordingVoice: '正在录音', recognizingVoice: '正在识别…', noSpeech: '没有听到语音，请再试一次',
  },
  en: {
    openClient: 'Open Harness', reply: 'Reply to latest session', reaction: 'Play reaction', size: 'Size', themesSettings: 'Open settings',
    stopService: 'Stop service & quit...', quitPet: 'Quit pet', latestSession: 'Latest session',
    moreSessions: 'more sessions', acknowledge: 'Mark as read', usingTool: 'Using tool: ', thinkingNow: 'Thinking…', done: 'Done',
    disconnected: 'Disconnected from Harness. Right-click and choose “Reconnect”; if it still fails, restart Harness.', reconnect: 'Reconnect',
    composerLabel: 'Reply to Harness session', messageLabel: 'Message', messagePlaceholder: 'Type a reply and press Enter to send',
    removeAttachment: 'Remove attachment', imageTooLarge: 'Images cannot exceed 8 MiB in total', tooManyImages: 'Attach up to 4 images', unsupportedDrop: 'This file has no usable local path',
    waitingAnswer: 'Waiting for your answer', choiceRequired: 'Choice required', approvalRequired: 'Approval required: ',
    allowOnce: 'Allow once', reject: 'Reject',
    chooseOne: 'Choose one', chooseMultiple: 'Choose any', customAnswer: 'Other answer', submitChoices: 'Submit choices', submittingChoices: 'Submitting…',
    activity: 'Session activity', pressEnter: 'Send', openWeb: 'Web', closeDetails: 'Close', bubbleHint: 'Details', chaseMouse: 'Chase pointer',
    recordingVoice: 'Recording', recognizingVoice: 'Recognizing…', noSpeech: 'No speech detected. Try again.',
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

function applyWindowDock(next: WindowDock): void {
  if (windowDock !== next) clearBubbleOffset()
  windowDock = next
  document.documentElement.dataset.windowDock = next
  queueMicrotask(clampBubbleOffset)
}

function applyPetStageOffset(offset: { x: number; y: number }): void {
  if (petPlacementAdjusted(petStageOffset, offset) && !bubbleLayoutAdjustmentPending) clearBubbleOffset()
  petStageOffset = offset
  const box = themeDisplayBox(theme.manifest.canvas)
  const width = box.width * scale
  const height = box.height * scale
  const availableHeight = Math.max(0, window.innerHeight - height)
  document.documentElement.style.setProperty('--pet-stage-x', `${offset.x}px`)
  document.documentElement.style.setProperty('--pet-stage-y', `${offset.y}px`)
  document.documentElement.style.setProperty('--pet-stage-center-x', `${offset.x + width / 2}px`)
  document.documentElement.style.setProperty('--pet-stage-center-y', `${offset.y + height / 2}px`)
  document.documentElement.style.setProperty('--pet-stage-right', `${offset.x + width}px`)
  document.documentElement.dataset.petVerticalDock = offset.y <= availableHeight / 2 ? 'top' : 'bottom'
  queueMicrotask(clampBubbleOffset)
}

function applyBubbleOffset(offset: { x: number; y: number }): void {
  bubbleOffset = offset
  bubbleStack.style.setProperty('--bubble-drag-x', `${offset.x}px`)
  bubbleStack.style.setProperty('--bubble-drag-y', `${offset.y}px`)
}

function clearBubbleOffset(): void {
  bubbleSide = 'auto'
  delete document.documentElement.dataset.bubbleSide
  applyBubbleOffset({ x: 0, y: 0 })
}

function applyBubbleSide(side: BubbleSide): void {
  if (bubbleSide === side) return
  bubbleSide = side
  document.documentElement.dataset.bubbleSide = side
  applyBubbleOffset({ x: 0, y: 0 })
}

function clampBubbleOffset(desired = bubbleOffset): void {
  if (bubbleStack.classList.contains('is-hidden')) return
  const rect = bubbleStack.getBoundingClientRect()
  const baseRect = {
    left: rect.left - bubbleOffset.x,
    top: rect.top - bubbleOffset.y,
    right: rect.right - bubbleOffset.x,
    bottom: rect.bottom - bubbleOffset.y,
  }
  const box = themeDisplayBox(theme.manifest.canvas)
  applyBubbleOffset(constrainBubbleOffset(
    desired,
    baseRect,
    { width: window.innerWidth, height: window.innerHeight },
    bubbleDragLimits({ width: box.width * scale, height: box.height * scale }),
  ))
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

function renderRecentSessionMenu(): void {
  recentSessionMenu.replaceChildren()
  for (const session of recentReplyableSessions(snapshot, 4)) {
    const button = document.createElement('button')
    button.type = 'button'
    button.role = 'menuitem'
    button.dataset.sessionId = session.id
    const title = document.createElement('span')
    title.className = 'recent-session-title'
    title.textContent = displaySessionTitle(session.title, locale)
    const time = document.createElement('span')
    time.className = 'recent-session-time'
    time.textContent = formatSessionAge(session.updatedAt, Date.now(), locale)
    button.append(title, time)
    recentSessionMenu.append(button)
  }
  recentSessionTrigger.toggleAttribute('disabled', recentSessionMenu.childElementCount === 0)
  if (recentSessionMenu.childElementCount === 0) setRecentSessionMenuOpen(false)
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

async function visibleSheetFrameIndices(animation: ThemeAnimation): Promise<number[]> {
  if (animation.kind !== 'sheet') return Array.from({ length: animation.files.length }, (_, index) => index)
  const cached = sheetFrameIndicesCache.get(animation)
  if (cached) return cached
  const pending = (async () => {
    const all = Array.from({ length: animation.frameCount }, (_, index) => index)
    try {
      const image = await loadImage(assetUrl(animation.file))
      const probe = document.createElement('canvas')
      probe.width = animation.frameWidth
      probe.height = animation.frameHeight
      const probeContext = probe.getContext('2d', { willReadFrequently: true })
      if (!probeContext) return all
      const visible: number[] = []
      for (const index of all) {
        const sourceIndex = (animation.frameOffset ?? 0) + index
        const column = sourceIndex % animation.columns
        const row = Math.floor(sourceIndex / animation.columns)
        probeContext.clearRect(0, 0, probe.width, probe.height)
        probeContext.drawImage(
          image,
          column * animation.frameWidth,
          row * animation.frameHeight,
          animation.frameWidth,
          animation.frameHeight,
          0,
          0,
          probe.width,
          probe.height,
        )
        const pixels = probeContext.getImageData(0, 0, probe.width, probe.height).data
        let hasAlpha = false
        for (let offset = 3; offset < pixels.length; offset += 4) {
          if (pixels[offset] !== 0) {
            hasAlpha = true
            break
          }
        }
        if (hasAlpha) visible.push(index)
      }
      return visible.length > 0 ? visible : all
    } catch {
      return all
    }
  })()
  sheetFrameIndicesCache.set(animation, pending)
  return pending
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
    releaseMouseIfFrameMovedAway()
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
  releaseMouseIfFrameMovedAway()
}

function animationFor(key: string, facing = snapshot.facing): { animation: ThemeAnimation; flip: boolean } | undefined {
  const visualKey = key === 'needsInput' ? 'thinking' : key
  const directionalKey = visualKey === 'walk' ? (facing === 'left' ? 'walkLeft' : 'walkRight') : undefined
  const directional = directionalKey ? theme.manifest.animations[directionalKey] : undefined
  const fallbackKey = visualKey === 'sleep' && !theme.manifest.animations[visualKey] ? 'idle' : visualKey
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
  const visibleIndices = await visibleSheetFrameIndices(animation)
  const playbackIndices = visibleAnimationFrameIndices(animationFrameIndices(count, animation.pacing), visibleIndices)
  const effectiveCount = playbackIndices.length || count
  if (canvas.width !== theme.manifest.canvas.width) canvas.width = theme.manifest.canvas.width
  if (canvas.height !== theme.manifest.canvas.height) canvas.height = theme.manifest.canvas.height
  if (reducedMotion) return drawFrame(animation, loop ? playbackIndices[0] ?? 0 : playbackIndices.at(-1) ?? count - 1, flip)
  do {
    let deadline = performance.now()
    for (const index of playbackIndices) {
      if (generation !== animationGeneration) return
      await drawFrame(animation, index, flip)
      const timing = nextAnimationDeadline(deadline, frameDuration(animation, index, effectiveCount), performance.now())
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
  const visibleIndices = await visibleSheetFrameIndices(animation)
  const playbackIndices = visibleAnimationFrameIndices(indices, visibleIndices)
  if (canvas.width !== theme.manifest.canvas.width) canvas.width = theme.manifest.canvas.width
  if (canvas.height !== theme.manifest.canvas.height) canvas.height = theme.manifest.canvas.height
  if (playbackIndices.length === 0) return
  if (reducedMotion) return drawFrame(animation, playbackIndices.at(-1)!, flip)
  let deadline = performance.now()
  for (const index of playbackIndices) {
    if (generation !== animationGeneration) return
    await drawFrame(animation, index, flip)
    const timing = nextAnimationDeadline(deadline, frameDuration(animation, index, playbackIndices.length || count), performance.now())
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
  if (isJackpotCompletionAnimation(loadedTheme.manifest, animation)) void window.harnessPet.recordTreasureFound()
  void runAnimation(animation, false, generation, false).then(() => {
    if (activeCompletionGeneration === generation) activeCompletionGeneration = undefined
    if (theme === loadedTheme) scheduleCompletionPreload(loadedTheme)
    const followup = completionFollowupState(snapshot.state, generation === animationGeneration)
    if (followup) playState(followup, 'complete')
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

function playState(next: PetState, previous?: PetState, skipThinkingEnter = false): void {
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
  if (next === 'thinking' && previous !== 'thinking' && !skipThinkingEnter && theme.manifest.animations.thinkingEnter) {
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

function playVoiceCue(kind: 'start' | 'stop'): Promise<void> {
  return new Promise((resolve) => {
    try {
    const audio = new Audio(new URL(`./resources/voice/${VOICE_CUE_FILES[kind]}`, window.location.href).toString())
    audio.preload = 'auto'
    audio.volume = 0.8
    audio.addEventListener('ended', () => resolve(), { once: true })
    audio.addEventListener('error', () => {
      console.warn(`Voice ${kind} cue could not be loaded.`)
      resolve()
    }, { once: true })
    void audio.play().catch((error) => {
      console.warn(`Voice ${kind} cue could not be played: ${error instanceof Error ? error.message : String(error)}`)
      resolve()
    })
    } catch (error) {
      console.warn(`Voice ${kind} cue could not be created: ${error instanceof Error ? error.message : String(error)}`)
      resolve()
    }
  })
}

function syncVoiceComposerStatus(): void {
  if (!voiceSessionId || targetSessionId !== voiceSessionId) return
  const input = bubbleStack.querySelector<HTMLTextAreaElement>(`.session-bubble[data-session-id="${CSS.escape(voiceSessionId)}"] .session-composer-input`)
  if (!input) return
  const seconds = Math.max(0, (Date.now() - voiceStartedAt) / 1_000).toFixed(1)
  input.placeholder = voiceRequested || voiceRecording || voiceStartPromise ? `${t('recordingVoice')} · ${seconds}s` : t('recognizingVoice')
  input.classList.add('is-recording')
}

async function beginVoiceRecording(stopMode: 'release' | 'toggle'): Promise<void> {
  if (voiceStartPromise || voiceRecording || voiceFinishPromise) return
  const session = recentReplyableSessions(snapshot, 1)[0]
  if (!session) {
    voiceRequested = false
    void window.harnessPet.showVoiceNotice('session')
    return
  }
  voiceStopMode = stopMode
  voiceComposerFeedback = undefined
  voiceSessionId = session.id
  voiceStartedAt = Date.now()
  voiceRequested = true
  openComposer(session, false)
  syncVoiceComposerStatus()
  voiceStartPromise = (async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Media recording is unavailable.')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { ideal: 'default' },
          channelCount: { ideal: 1 },
          // macOS already applies its own microphone processing. Chromium's
          // second pass can suppress quiet, close-range speech on some Macs.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      })
      if (!voiceRequested) {
        stream.getTracks().forEach((track) => track.stop())
        void window.harnessPet.showVoiceNotice('ready')
        return
      }
      const preferredType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : ''
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined)
      const chunks: Blob[] = []
      let resolveStopped!: (blob: Blob) => void
      let rejectStopped!: (error: Error) => void
      const stopped = new Promise<Blob>((resolve, reject) => { resolveStopped = resolve; rejectStopped = reject })
      recorder.addEventListener('dataavailable', (event) => { if (event.data.size > 0) chunks.push(event.data) })
      recorder.addEventListener('error', () => rejectStopped(new Error('Media recording failed.')), { once: true })
      recorder.addEventListener('stop', () => resolveStopped(new Blob(chunks, { type: recorder.mimeType || preferredType || 'audio/webm' })), { once: true })
      await playVoiceCue('start')
      if (!voiceRequested) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      recorder.start(200)
      voiceRecording = {
        recorder,
        stream,
        chunks,
        mimeType: recorder.mimeType,
        sessionId: session.id,
        timeout: window.setTimeout(() => void finishVoiceRecording(false), MAX_VOICE_SECONDS * 1000),
        stopped,
      }
      syncVoiceComposerStatus()
      if (voiceStatusTimer !== undefined) window.clearInterval(voiceStatusTimer)
      voiceStatusTimer = window.setInterval(syncVoiceComposerStatus, 100)
    } catch {
      voiceRequested = false
      voiceStopMode = undefined
      voiceSessionId = undefined
      renderBubbles()
      void window.harnessPet.showVoiceNotice('microphone')
    }
  })().finally(() => { voiceStartPromise = undefined })
  await voiceStartPromise
}

async function finishVoiceRecording(cancelled: boolean): Promise<void> {
  voiceRequested = false
  if (voiceFinishPromise) return voiceFinishPromise
  voiceFinishPromise = (async () => {
    if (voiceStartPromise) await voiceStartPromise
    const recording = voiceRecording
    voiceRecording = undefined
    if (!recording) return
    if (voiceStatusTimer !== undefined) window.clearInterval(voiceStatusTimer)
    voiceStatusTimer = undefined
    syncVoiceComposerStatus()
    window.clearTimeout(recording.timeout)
    try {
      if (recording.recorder.state !== 'inactive') {
        try { recording.recorder.requestData() } catch { /* stop still flushes the final recorder chunk */ }
        recording.recorder.stop()
        void playVoiceCue('stop')
      }
      const blob = await recording.stopped
      if (cancelled) return
      if (blob.size === 0) throw new Error('No audio was recorded.')
      const track = recording.stream.getAudioTracks()[0]
      const settings = track?.getSettings()
      const result = await window.harnessPet.transcribeVoice(await mediaBlobToVoiceWav(blob), track ? {
        label: track.label,
        muted: track.muted,
        enabled: track.enabled,
        readyState: track.readyState,
        sampleRate: settings?.sampleRate,
        channelCount: settings?.channelCount,
        autoGainControl: settings?.autoGainControl,
        echoCancellation: settings?.echoCancellation,
        noiseSuppression: settings?.noiseSuppression,
      } : undefined)
      if (!result.ok || !result.text) {
        if (result.code === 'noSpeech') {
          voiceComposerFeedback = { sessionId: recording.sessionId, message: t('noSpeech') }
          renderBubbles()
        } else {
          void window.harnessPet.showVoiceNotice('unavailable', result.detail)
        }
        return
      }
      const session = replyableSessions(snapshot).find((candidate) => candidate.id === recording.sessionId)
        ?? recentReplyableSessions(snapshot, 1)[0]
      if (!session) {
        void window.harnessPet.showVoiceNotice('session')
        return
      }
      const existing = composerDrafts.get(session.id)?.trim()
      composerDrafts.set(session.id, existing ? `${existing} ${result.text}` : result.text)
      openComposer(session)
    } catch (error) {
      if (!cancelled) void window.harnessPet.showVoiceNotice('unavailable', error instanceof Error ? error.message : String(error))
    } finally {
      recording.stream.getTracks().forEach((track) => track.stop())
    }
  })().finally(() => {
    voiceFinishPromise = undefined
    voiceStopMode = undefined
    voiceSessionId = undefined
    renderBubbles()
  })
  return voiceFinishPromise
}

function stateLabel(state: PetState): string {
  return stateMessages[locale][state]
}

function sessionText(session: PetSessionSummary): string {
  if (session.question || session.text === 'Choice required') return t('choiceRequired')
  if (session.state === 'thinking' && (!session.text || session.text === 'Thinking')) return t('thinkingNow')
  if (session.state === 'working' && session.text?.startsWith('Using ')) return `${t('usingTool')}${session.text.slice(6)}`
  if (session.state === 'complete' && session.text === 'Done') return t('done')
  if (session.text === 'Waiting for your answer') return t('waitingAnswer')
  if (session.text?.startsWith('Approval required: ')) return `${t('approvalRequired')}${session.text.slice(19)}`
  return session.text ?? ''
}

function qualifyingSessions(): PetSessionSummary[] {
  return bubbleSessions(snapshot, dismissedSessionIds, targetSessionId)
}

function activityText(activity: PetSessionActivity): string {
  if (activity.kind === 'thinking') return t('thinkingNow')
  if (activity.kind === 'tool' && activity.text.startsWith('Using ')) return `${t('usingTool')}${activity.text.slice(6)}`
  if (activity.kind === 'needsInput' && activity.text === 'Waiting for your answer') return t('waitingAnswer')
  if (activity.kind === 'needsInput' && activity.text === 'Choice required') return t('choiceRequired')
  if (activity.kind === 'needsInput' && activity.text.startsWith('Approval required: ')) return `${t('approvalRequired')}${activity.text.slice(19)}`
  if (activity.kind === 'complete' && activity.text === 'Done') return t('done')
  if (activity.kind === 'error' && activity.text === 'Something went wrong') return stateLabel('error')
  return activity.text
}

function visibleActivities(session: PetSessionSummary): PetSessionActivity[] {
  const activities = sessionActivitiesForPanel(session)
  if (activities) return activities
  return [{
    id: `current:${session.id}`,
    kind: session.state === 'working' ? 'tool'
      : session.state === 'needsInput' ? 'needsInput'
        : session.state === 'complete' ? 'complete'
          : session.state === 'error' ? 'error'
            : session.state === 'thinking' ? 'thinking' : 'assistant',
    text: session.text || stateLabel(session.state),
    time: session.updatedAt,
  }]
}

function resizeComposer(input: HTMLTextAreaElement): void {
  input.style.height = 'auto'
  input.style.height = `${Math.min(input.scrollHeight, 72)}px`
}

function createQuestionForm(session: PetSessionSummary): HTMLDivElement {
  const request = session.question!
  const drafts = questionDrafts.get(request.requestId) ?? new Map<string, { selected: Set<string>; custom: string }>()
  questionDrafts.set(request.requestId, drafts)
  const container = document.createElement('div')
  container.className = 'question-form'
  const answerControls: Array<HTMLInputElement | HTMLButtonElement> = []
  let submit: HTMLButtonElement
  let updateSubmitState = (): void => {}

  const submitAnswers = async (): Promise<void> => {
    if (questionSubmittingRequestId === request.requestId) return
    const answers: PetQuestionAnswer[] = request.questions.map((question) => {
      const draft = drafts.get(question.id)!
      return {
        id: question.id,
        selected: [...draft.selected],
        ...(draft.custom.trim() ? { custom: draft.custom.trim() } : {}),
      }
    })
    questionSubmittingRequestId = request.requestId
    answerControls.forEach((control) => { control.disabled = true })
    updateSubmitState()
    const result = await window.harnessPet.answerQuestion(session.id, request.requestId, answers)
    questionSubmittingRequestId = undefined
    if (result.ok) {
      questionDrafts.delete(request.requestId)
      renderBubbles()
    } else {
      answerControls.forEach((control) => { control.disabled = false })
      updateSubmitState()
    }
  }

  for (const question of request.questions) {
    const draft = drafts.get(question.id) ?? { selected: new Set<string>(), custom: '' }
    drafts.set(question.id, draft)
    const item = document.createElement('section')
    item.className = 'question-item'
    if (question.header) {
      const header = document.createElement('div')
      header.className = 'question-header'
      header.textContent = question.header
      item.append(header)
    }
    const text = document.createElement('div')
    text.className = 'question-text'
    text.textContent = question.question
    item.append(text)
    if (question.detail) {
      const detail = document.createElement('div')
      detail.className = 'question-detail'
      detail.textContent = question.detail
      item.append(detail)
    }
    if (question.options?.length) {
      const hint = document.createElement('div')
      hint.className = 'question-hint'
      hint.textContent = question.multiSelect ? t('chooseMultiple') : t('chooseOne')
      const options = document.createElement('div')
      options.className = 'question-options'
      item.append(hint, options)
      for (const option of question.options) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `question-option${draft.selected.has(option.label) ? ' is-selected' : ''}`
        button.setAttribute('aria-pressed', String(draft.selected.has(option.label)))
        const label = document.createElement('span')
        label.className = 'question-option-label'
        label.textContent = option.label
        button.append(label)
        if (option.description) {
          const description = document.createElement('span')
          description.className = 'question-option-description'
          description.textContent = option.description
          button.append(description)
        }
        button.addEventListener('click', () => {
          if (question.multiSelect) {
            if (draft.selected.has(option.label)) draft.selected.delete(option.label)
            else draft.selected.add(option.label)
          } else {
            draft.selected.clear()
            draft.selected.add(option.label)
            draft.custom = ''
          }
          const answeredQuestionIds = new Set(
            request.questions.filter((item) => {
              const answer = drafts.get(item.id)
              return answer && (answer.selected.size > 0 || Boolean(answer.custom.trim()))
            }).map((item) => item.id),
          )
          if (shouldAutoSubmitChoices(request.questions, answeredQuestionIds)) {
            item.querySelectorAll<HTMLButtonElement>('.question-option').forEach((control) => {
              const selected = control === button
              control.classList.toggle('is-selected', selected)
              control.setAttribute('aria-pressed', String(selected))
            })
            void submitAnswers()
          } else {
            renderBubbles()
          }
        })
        answerControls.push(button)
        options.append(button)
      }
    }
    const custom = document.createElement('input')
    custom.type = 'text'
    custom.className = 'question-custom'
    custom.maxLength = 2_000
    custom.placeholder = t('customAnswer')
    custom.value = draft.custom
    custom.setAttribute('aria-label', `${question.question}：${t('customAnswer')}`)
    custom.addEventListener('input', () => {
      draft.custom = custom.value
      if (!question.multiSelect && custom.value.trim()) {
        draft.selected.clear()
        item.querySelectorAll('.question-option').forEach((option) => {
          option.classList.remove('is-selected')
          option.setAttribute('aria-pressed', 'false')
        })
      }
      updateSubmitState()
    })
    custom.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.isComposing || !custom.value.trim()) return
      event.preventDefault()
      void submitAnswers()
    })
    answerControls.push(custom)
    item.append(custom)
    container.append(item)
  }

  submit = document.createElement('button')
  submit.type = 'button'
  submit.className = 'question-submit'
  updateSubmitState = (): void => {
    submit.disabled = questionSubmittingRequestId === request.requestId || request.questions.some((question) => {
      const draft = drafts.get(question.id)
      return !draft || (draft.selected.size === 0 && !draft.custom.trim())
    })
    submit.textContent = questionSubmittingRequestId === request.requestId ? t('submittingChoices') : t('submitChoices')
  }
  submit.addEventListener('click', () => { void submitAnswers() })
  updateSubmitState()
  container.append(submit)
  return container
}

function renderBubbles(): void {
  const sessions = qualifyingSessions()
  const previousTimeline = bubbleStack.querySelector<HTMLElement>('.session-timeline')
  const previousTimelineScrollTop = previousTimeline?.scrollTop ?? 0
  const previousTimelineAtEnd = previousTimeline
    ? previousTimeline.scrollHeight - previousTimeline.scrollTop - previousTimeline.clientHeight < 8
    : true
  const activeInput = document.activeElement instanceof HTMLTextAreaElement
    ? document.activeElement.closest<HTMLElement>('.session-bubble') : undefined
  const restoreFocusSessionId = activeInput?.dataset.sessionId
  const selectionStart = document.activeElement instanceof HTMLTextAreaElement ? document.activeElement.selectionStart : undefined
  const selectionEnd = document.activeElement instanceof HTMLTextAreaElement ? document.activeElement.selectionEnd : undefined
  bubbleStack.replaceChildren()
  if (!bubbleVisible || sessions.length === 0) {
    bubbleStack.classList.add('is-hidden')
    return
  }
  bubbleStack.classList.remove('is-hidden')
  const visible = sessions.length > 3 ? sessions.slice(0, 2) : sessions.slice(0, 3)
  for (const session of visible) {
    const bubble = document.createElement('div')
    bubble.className = `session-bubble state-${session.state}${session.unread ? ' is-unread' : ''}${session.approval ? ' has-approval' : ''}${session.question ? ' has-question' : ''}`
    bubble.dataset.sessionId = session.id
    bubble.addEventListener('dblclick', (event) => {
      if ((event.target as HTMLElement).closest('textarea, input, button, .approval-actions, .question-form')) return
      event.preventDefault()
      event.stopPropagation()
      if (bubbleClickTimer !== undefined) window.clearTimeout(bubbleClickTimer)
      bubbleClickTimer = undefined
      openSessionInHarness(session.id)
    })
    if (targetSessionId === session.id) {
      bubble.classList.add('is-expanded')
      const form = document.createElement('form')
      form.className = 'session-panel'
      form.addEventListener('submit', (event) => event.preventDefault())
      const heading = document.createElement('div')
      heading.className = 'session-heading'
      const title = document.createElement('span')
      title.className = 'session-title'
      title.textContent = displaySessionTitle(session.title, locale)
      const time = document.createElement('time')
      time.className = 'session-time'
      time.dateTime = new Date(session.updatedAt).toISOString()
      time.textContent = formatSessionAge(session.updatedAt, Date.now(), locale)
      const close = document.createElement('button')
      close.type = 'button'
      close.className = 'session-close'
      close.textContent = '×'
      close.dataset.tooltip = t('closeDetails')
      close.setAttribute('aria-label', t('closeDetails'))
      close.addEventListener('click', (event) => {
        event.stopPropagation()
        dismissSessionBubble(session.id)
      })
      heading.append(title, time, close)

      const timeline = document.createElement('div')
      timeline.className = 'session-timeline'
      timeline.setAttribute('role', 'log')
      timeline.setAttribute('aria-label', t('activity'))
      timeline.setAttribute('aria-live', 'polite')
      for (const activity of visibleActivities(session)) {
        const item = document.createElement('div')
        item.className = `session-activity kind-${activity.kind}`
        const marker = document.createElement('span')
        marker.className = 'session-activity-marker'
        marker.setAttribute('aria-hidden', 'true')
        const text = document.createElement('span')
        text.className = 'session-activity-text markdown-body'
        text.innerHTML = renderMarkdown(activityText(activity))
        item.append(marker, text)
        timeline.append(item)
      }

      if (session.approval) {
        const actions = createApprovalActions(session)
        form.append(heading, timeline, actions)
      } else if (session.question) {
        form.append(heading, timeline, createQuestionForm(session))
      } else {
        form.append(heading, timeline)
      }

      if (!session.question) {
        const composer = document.createElement('div')
        composer.className = 'session-composer'
        const input = document.createElement('textarea')
        input.className = 'session-composer-input'
        input.maxLength = 8000
        input.rows = 1
        input.value = composerDrafts.get(session.id) ?? ''
        input.placeholder = voiceSessionId === session.id
          ? (voiceRequested || voiceRecording || voiceStartPromise ? t('recordingVoice') : t('recognizingVoice'))
          : voiceComposerFeedback?.sessionId === session.id ? voiceComposerFeedback.message : t('messagePlaceholder')
        input.classList.toggle('is-recording', voiceSessionId === session.id)
        input.setAttribute('aria-label', `${t('composerLabel')}：${displaySessionTitle(session.title, locale)}`)
        input.disabled = composerSubmittingSessionId === session.id
        input.addEventListener('input', () => {
          if (voiceComposerFeedback?.sessionId === session.id) voiceComposerFeedback = undefined
          composerDrafts.set(session.id, input.value)
          resizeComposer(input)
        })
        input.addEventListener('paste', (event) => {
          const files = Array.from(event.clipboardData?.files ?? [])
          if (!files.length) return
          event.preventDefault()
          void addComposerFiles(session.id, files)
        })
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            closeComposer()
            return
          }
          if (!shouldSubmitComposer(event)) return
          event.preventDefault()
          void submitComposer(session.id, input)
        })
        const enterHint = document.createElement('button')
        enterHint.type = 'button'
        enterHint.className = 'session-enter-hint'
        enterHint.innerHTML = '<span class="session-action-icon">↵</span>'
        enterHint.dataset.tooltip = t('pressEnter')
        enterHint.setAttribute('aria-label', t('pressEnter'))
        enterHint.addEventListener('click', () => { void submitComposer(session.id, input) })
        const open = document.createElement('button')
        open.type = 'button'
        open.className = 'session-open-client'
        open.innerHTML = '<span class="session-action-icon">↗</span>'
        open.dataset.tooltip = t('openWeb')
        open.setAttribute('aria-label', `${t('openClient')}：${displaySessionTitle(session.title, locale)}`)
        open.addEventListener('click', () => {
          recordInteraction()
          void window.harnessPet.acknowledge(session.id)
          void window.harnessPet.openClient(session.id)
          closeComposer()
        })
        form.addEventListener('submit', (event) => { event.preventDefault(); void submitComposer(session.id, input) })
        let dragDepth = 0
        composer.addEventListener('dragenter', (event) => {
          if (!event.dataTransfer?.types.includes('Files')) return
          event.preventDefault()
          dragDepth += 1
          composer.classList.add('is-dragover')
          window.harnessPet.setChasePaused(true)
        })
        composer.addEventListener('dragover', (event) => {
          if (!event.dataTransfer?.types.includes('Files')) return
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        })
        composer.addEventListener('dragleave', () => {
          dragDepth = Math.max(0, dragDepth - 1)
          if (dragDepth === 0) {
            composer.classList.remove('is-dragover')
            window.harnessPet.setChasePaused(false)
          }
        })
        composer.addEventListener('drop', (event) => {
          if (!event.dataTransfer?.files.length) return
          event.preventDefault()
          dragDepth = 0
          composer.classList.remove('is-dragover')
          window.harnessPet.setChasePaused(false)
          void addComposerFiles(session.id, Array.from(event.dataTransfer.files))
        })
        composer.append(input, enterHint, open)
        const attachments = createComposerAttachments(session.id)
        if (attachments) form.append(attachments)
        form.append(composer)
      }
      bubble.append(form)
      bubbleStack.append(bubble)
      queueMicrotask(() => {
        const input = form.querySelector<HTMLTextAreaElement>('.session-composer-input')
        if (input) resizeComposer(input)
        timeline.scrollTop = previousTimelineAtEnd ? timeline.scrollHeight : previousTimelineScrollTop
        if (input && (focusComposerSessionId === session.id || restoreFocusSessionId === session.id)) {
          if (focusComposerSessionId === session.id) {
            void focusComposerInput(session.id, input)
          } else {
            input.focus()
            if (selectionStart !== undefined && selectionEnd !== undefined) input.setSelectionRange(selectionStart, selectionEnd)
          }
        }
        clampBubbleOffset()
      })
      continue
    }
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'session-bubble-main'
    button.dataset.tooltip = t('bubbleHint')
    button.innerHTML = `<span class="session-heading"><span class="session-title"></span><time class="session-time"></time></span><span class="session-state"></span><span class="session-text"></span>`
    button.querySelector<HTMLElement>('.session-title')!.textContent = displaySessionTitle(session.title, locale)
    const time = button.querySelector<HTMLTimeElement>('.session-time')!
    time.dateTime = new Date(session.updatedAt).toISOString()
    time.textContent = formatSessionAge(session.updatedAt, Date.now(), locale)
    button.querySelector<HTMLElement>('.session-state')!.textContent = session.question ? '' : stateLabel(session.state)
    button.querySelector<HTMLElement>('.session-text')!.innerHTML = renderMarkdownInline(sessionText(session))
    button.addEventListener('click', () => {
      recordInteraction()
      if (bubbleClickTimer !== undefined) window.clearTimeout(bubbleClickTimer)
      bubbleClickTimer = window.setTimeout(() => {
        bubbleClickTimer = undefined
        openComposer(session, false)
      }, 220)
    })
    bubble.append(button)
    if (session.approval) bubble.append(createApprovalActions(session))
    else if (session.unread && !session.question) {
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
  queueMicrotask(clampBubbleOffset)
}

async function focusComposerInput(sessionId: string, input?: HTMLTextAreaElement): Promise<void> {
  if (focusComposerSessionId !== sessionId || targetSessionId !== sessionId) return
  await window.harnessPet.activateForInput()
  if (focusComposerSessionId !== sessionId || targetSessionId !== sessionId) return
  const current = input?.isConnected
    ? input
    : bubbleStack.querySelector<HTMLTextAreaElement>(`.session-bubble[data-session-id="${CSS.escape(sessionId)}"] .session-composer-input`)
  if (!current) return
  current.focus({ preventScroll: true })
  current.setSelectionRange(current.value.length, current.value.length)
  if (document.hasFocus() && document.activeElement === current) focusComposerSessionId = undefined
}

window.addEventListener('focus', () => {
  if (!focusComposerSessionId) return
  void focusComposerInput(focusComposerSessionId)
})

function createApprovalActions(session: PetSessionSummary): HTMLDivElement {
  const actions = document.createElement('div')
  actions.className = 'approval-actions'
  const decide = async (outcome: 'allowed-once' | 'rejected'): Promise<void> => {
    recordInteraction()
    const controls = actions.querySelectorAll<HTMLButtonElement>('button')
    controls.forEach((control) => { control.disabled = true })
    const result = await window.harnessPet.decideApproval(session.id, session.approval!.requestId, outcome)
    if (!result.ok) {
      controls.forEach((control) => { control.disabled = false })
    }
  }
  const allow = document.createElement('button')
  allow.type = 'button'
  allow.className = 'approval-allow'
  allow.textContent = t('allowOnce')
  allow.addEventListener('click', (event) => { event.stopPropagation(); void decide('allowed-once') })
  const reject = document.createElement('button')
  reject.type = 'button'
  reject.className = 'approval-reject'
  reject.textContent = t('reject')
  reject.addEventListener('click', (event) => { event.stopPropagation(); void decide('rejected') })
  actions.append(allow, reject)
  return actions
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
  const chaseToggle = pixelMenu.querySelector<HTMLElement>('[data-menu-action="toggle-chase"]')
  chaseToggle?.setAttribute('aria-checked', String(mouseChaseEnabled))
  pixelMenu.querySelectorAll<HTMLElement>('[data-menu-action]').forEach((element) => {
    const action = element.dataset.menuAction
    if (!action || action === 'quit' || action === 'reconnect' || action === 'toggle-chase') return
    const id = element.dataset.extensionId ?? (action === 'quit' ? 'quit-pet' : action)
    const hidden = !menuActions.includes(id) || (action === 'stop-service' && !serviceOwned)
    element.classList.toggle('is-hidden', hidden)
  })
  renderRecentSessionMenu()
  renderBubbles()
}

function applySnapshot(next: PetSnapshot): void {
  if (targetSessionId) {
    const previousTarget = snapshot?.sessions?.find((session) => session.id === targetSessionId)
    const currentTarget = next.sessions?.find((session) => session.id === targetSessionId)
    if (previousTarget?.question && !currentTarget?.question) {
      questionDrafts.delete(previousTarget.question.requestId)
      focusComposerSessionId = undefined
    }
  }
  const liveQuestionIds = new Set(next.sessions?.flatMap((session) => session.question ? [session.question.requestId] : []) ?? [])
  for (const requestId of questionDrafts.keys()) {
    if (!liveQuestionIds.has(requestId) && requestId !== questionSubmittingRequestId) questionDrafts.delete(requestId)
  }
  for (const [sessionId, dismissal] of dismissedSessionIds) {
    const current = next.sessions?.find((session) => session.id === sessionId)
    if (shouldReleaseSessionBubbleDismissal(dismissal, current)) {
      dismissedSessionIds.delete(sessionId)
    }
  }
  const previousState = snapshot?.state
  const previousFacing = snapshot?.facing
  const stateChanged = !snapshot || next.state !== previousState
  const activity = turnActivityDecision(
    next.state,
    next.sessionId,
    next.turn,
    next.sessionId ? observedTurns.get(next.sessionId) : undefined,
  )
  if (activity.remember && next.sessionId && next.turn !== undefined) observedTurns.set(next.sessionId, next.turn)
  snapshot = next
  renderStatus()
  if (pendingComposePaths.length && replyableSessions(snapshot).length) openComposerWithFiles(pendingComposePaths)
  const holdingPress = pressedPointerId !== undefined && dragDistance <= 4 && !preservesActiveAnimation(next.state)
  const animationPreviousState = activity.enterThinking ? undefined : previousState
  if ((stateChanged || activity.enterThinking) && shouldPlayStateChange(
    animationPreviousState,
    next.state,
    holdingPress,
    activeCompletionGeneration !== undefined,
  )) {
    playState(next.state, animationPreviousState, next.state === 'thinking' && !activity.enterThinking)
  } else if (shouldSwitchWalkFacing(previousState, next.state, previousFacing, next.facing)) {
    playWalk(next.facing)
  }
}

function applyTheme(next: LoadedTheme): void {
  theme = next
  applyThemeLayout(next)
  applyPetStageOffset(petStageOffset)
  imageCache.clear()
  primedCompletion = undefined
  playState(snapshot?.state ?? 'idle')
  scheduleCompletionPreload(next)
}

function applyThemeLayout(next: LoadedTheme): void {
  const box = themeDisplayBox(next.manifest.canvas)
  for (const element of [petStage, bubbleStack, pixelMenu]) {
    element.style.setProperty('--pet-display-width', `${box.width}px`)
    element.style.setProperty('--pet-display-height', `${box.height}px`)
    element.style.setProperty('--pet-clearance', `${box.clearance}px`)
  }
}

function notifyMissingSession(): void {
  void window.harnessPet.showVoiceNotice('session')
}

function attachmentDraft(sessionId: string): ComposerAttachmentDraft {
  const existing = composerAttachments.get(sessionId)
  if (existing) return existing
  const created = { paths: [], images: [] }
  composerAttachments.set(sessionId, created)
  return created
}

function setComposerFeedback(sessionId: string, message: string): void {
  voiceComposerFeedback = { sessionId, message }
  renderBubbles()
}

async function addComposerFiles(sessionId: string, files: readonly File[]): Promise<void> {
  const draft = attachmentDraft(sessionId)
  const paths: string[] = []
  let imageBytes = draft.images.reduce((total, image) => total + image.bytes, 0)
  for (const file of files) {
    const mediaType = imageMediaType(file)
    if (mediaType) {
      if (draft.images.length >= MAX_CHAT_IMAGES) {
        setComposerFeedback(sessionId, t('tooManyImages'))
        return
      }
      if (imageBytes + file.size > MAX_CHAT_IMAGE_BYTES) {
        setComposerFeedback(sessionId, t('imageTooLarge'))
        return
      }
      const data = await fileToBase64(file)
      if (!draft.images.some((image) => image.name === file.name && image.bytes === file.size && image.data === data)) {
        draft.images.push({ name: file.name || `image-${draft.images.length + 1}`, mediaType, data, bytes: file.size })
        imageBytes += file.size
      }
      continue
    }
    let path = ''
    try {
      path = window.harnessPet.pathForFile(file)
    } catch {
      // Clipboard-created files may not have a native path.
    }
    if (path) paths.push(path)
  }
  draft.paths = mergeComposerPaths(draft.paths, paths)
  if (!draft.images.length && !draft.paths.length) {
    setComposerFeedback(sessionId, t('unsupportedDrop'))
    return
  }
  voiceComposerFeedback = undefined
  focusComposerSessionId = sessionId
  renderBubbles()
}

function createComposerAttachments(sessionId: string): HTMLElement | undefined {
  const draft = composerAttachments.get(sessionId)
  if (!draft || (!draft.paths.length && !draft.images.length)) return undefined
  const tray = document.createElement('div')
  tray.className = 'composer-attachments'
  const entries = [
    ...draft.images.map((image, index) => ({ kind: 'image' as const, index, label: image.name, image })),
    ...draft.paths.map((path, index) => ({ kind: 'path' as const, index, label: path.split(/[\\/]/).pop() || path })),
  ]
  for (const entry of entries) {
    const chip = document.createElement('span')
    chip.className = `composer-attachment kind-${entry.kind}`
    if (entry.kind === 'image') {
      const preview = document.createElement('img')
      preview.src = `data:${entry.image.mediaType};base64,${entry.image.data}`
      preview.alt = ''
      chip.append(preview)
    }
    const label = document.createElement('span')
    label.className = 'composer-attachment-label'
    label.textContent = entry.label
    label.title = entry.kind === 'path' ? (draft.paths[entry.index] ?? entry.label) : entry.label
    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'composer-attachment-remove'
    remove.textContent = '×'
    remove.setAttribute('aria-label', `${t('removeAttachment')}：${entry.label}`)
    remove.addEventListener('click', () => {
      if (entry.kind === 'image') draft.images.splice(entry.index, 1)
      else draft.paths.splice(entry.index, 1)
      focusComposerSessionId = sessionId
      renderBubbles()
    })
    chip.append(label, remove)
    tray.append(chip)
  }
  return tray
}

function openComposer(session?: PetSessionSummary, focus = true): void {
  const selected = session ?? replyableSessions(snapshot)[0]
  if (!selected) {
    notifyMissingSession()
    return
  }
  dismissedSessionIds.delete(selected.id)
  targetSessionId = selected.id
  if (focus) focusComposerSessionId = selected.id
  setMenuOpen(false)
  renderBubbles()
}

function openComposerWithFiles(paths: readonly string[]): void {
  const valid = paths.filter((path) => path.length > 0 && path.length <= 4096).slice(0, 8)
  if (!valid.length) return
  const selected = replyableSessions(snapshot)[0]
  if (!selected) {
    pendingComposePaths = valid
    notifyMissingSession()
    return
  }
  const draft = attachmentDraft(selected.id)
  draft.paths = mergeComposerPaths(draft.paths, valid)
  pendingComposePaths = []
  openComposer(selected, true)
}

function closeComposer(): void {
  targetSessionId = undefined
  focusComposerSessionId = undefined
  renderBubbles()
}

function dismissSessionBubble(sessionId: string): void {
  const session = replyableSessions(snapshot).find((candidate) => candidate.id === sessionId)
  if (session) dismissedSessionIds.set(sessionId, sessionBubbleDismissal(session))
  if (targetSessionId === sessionId) {
    targetSessionId = undefined
    focusComposerSessionId = undefined
  }
  renderBubbles()
}

function openSessionInHarness(sessionId: string): void {
  dismissSessionBubble(sessionId)
  void window.harnessPet.openClient(sessionId)
}

function clearMenuTransition(): void {
  if (menuSwapTimer !== undefined) window.clearTimeout(menuSwapTimer)
  if (menuHideTimer !== undefined) window.clearTimeout(menuHideTimer)
  if (menuOpenFrame !== undefined) window.cancelAnimationFrame(menuOpenFrame)
  menuSwapTimer = undefined
  menuHideTimer = undefined
  menuOpenFrame = undefined
}

function positionRecentSessionMenu(): void {
  const trigger = recentSessionTrigger.getBoundingClientRect()
  const menu = recentSessionMenu.getBoundingClientRect()
  const position = resolveSubmenuPosition(
    { left: trigger.left, top: trigger.top, right: trigger.right, bottom: trigger.bottom },
    { width: menu.width || 136, height: menu.height },
    { width: window.innerWidth, height: window.innerHeight },
  )
  recentSessionMenu.style.left = `${position.left}px`
  recentSessionMenu.style.top = `${position.top}px`
  recentSessionMenu.dataset.side = position.side
}

function setRecentSessionMenuOpen(open: boolean): void {
  if (recentMenuCloseTimer !== undefined) window.clearTimeout(recentMenuCloseTimer)
  recentMenuCloseTimer = undefined
  const next = open && menuRequestedOpen && !recentSessionTrigger.disabled
  if (next) positionRecentSessionMenu()
  recentSessionMenu.classList.toggle('is-open', next)
  recentSessionTrigger.setAttribute('aria-expanded', String(next))
}

function scheduleRecentSessionMenuClose(): void {
  if (recentMenuCloseTimer !== undefined) window.clearTimeout(recentMenuCloseTimer)
  recentMenuCloseTimer = window.setTimeout(() => {
    recentMenuCloseTimer = undefined
    if (recentSessionTrigger.matches(':hover') || recentSessionMenu.matches(':hover')) return
    if (recentSessionTrigger.matches(':focus') || recentSessionMenu.contains(document.activeElement)) return
    setRecentSessionMenuOpen(false)
  }, 120)
}

recentSessionTrigger.addEventListener('pointerenter', () => setRecentSessionMenuOpen(true))
recentSessionTrigger.addEventListener('pointerleave', scheduleRecentSessionMenuClose)
recentSessionTrigger.addEventListener('focus', () => setRecentSessionMenuOpen(true))
recentSessionTrigger.addEventListener('blur', scheduleRecentSessionMenuClose)
recentSessionMenu.addEventListener('pointerenter', () => setRecentSessionMenuOpen(true))
recentSessionMenu.addEventListener('pointerleave', scheduleRecentSessionMenuClose)
recentSessionMenu.addEventListener('focusout', scheduleRecentSessionMenuClose)

function setMenuOpen(open: boolean): void {
  if (menuRequestedOpen === open && (open || pixelMenu.classList.contains('is-hidden'))) return
  menuRequestedOpen = open
  clearMenuTransition()

  if (open) {
    const bubbleIsVisible = !bubbleStack.classList.contains('is-hidden')
    bubbleStack.classList.add('is-menu-suppressed')
    bubbleStack.setAttribute('aria-hidden', 'true')
    pixelMenu.classList.remove('is-open')
    pixelMenu.classList.add('is-hidden')
    const revealMenu = (): void => {
      menuSwapTimer = undefined
      if (!menuRequestedOpen) return
      pixelMenu.classList.remove('is-hidden')
      menuOpenFrame = window.requestAnimationFrame(() => {
        menuOpenFrame = undefined
        if (!menuRequestedOpen) return
        pixelMenu.classList.add('is-open')
        pixelMenu.querySelector<HTMLButtonElement>('button:not(.is-hidden)')?.focus()
      })
    }
    if (bubbleIsVisible && !reducedMotion) menuSwapTimer = window.setTimeout(revealMenu, MENU_TRANSITION_MS)
    else revealMenu()
    return
  }

  setRecentSessionMenuOpen(false)
  const menuWasVisible = !pixelMenu.classList.contains('is-hidden')
  pixelMenu.classList.remove('is-open')
  const restoreBubbles = (): void => {
    menuHideTimer = undefined
    pixelMenu.classList.add('is-hidden')
    bubbleStack.classList.remove('is-menu-suppressed')
    bubbleStack.removeAttribute('aria-hidden')
  }
  if (menuWasVisible && !reducedMotion) menuHideTimer = window.setTimeout(restoreBubbles, MENU_TRANSITION_MS)
  else restoreBubbles()
}

petStage.addEventListener('contextmenu', (event) => {
  event.preventDefault()
  recordInteraction()
  setMenuOpen(!menuRequestedOpen)
})

document.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return
  const target = event.target as Node
  if (menuRequestedOpen && !pixelMenu.contains(target) && !recentSessionMenu.contains(target) && !petStage.contains(target)) {
    setMenuOpen(false)
  }
  const activeComposer = bubbleStack.querySelector('.session-bubble.is-expanded')
  const voiceGestureKeepsComposerOpen = petStage.contains(target)
    && targetSessionId !== undefined
    && targetSessionId === voiceSessionId
    && Boolean(voiceRequested || voiceRecording || voiceStartPromise || voiceFinishPromise)
  if (shouldDismissComposer(targetSessionId, Boolean(activeComposer?.contains(target)), voiceGestureKeepsComposerOpen)) {
    const dismissedSessionId = targetSessionId
    window.requestAnimationFrame(() => {
      if (targetSessionId === dismissedSessionId) closeComposer()
    })
  }
})

function bubbleDragHandle(target: Element): Element | undefined {
  const collapsed = target.closest('.session-bubble-main')
  if (collapsed) return collapsed
  if (target.closest('textarea, input, button, .approval-actions, .question-form, .session-timeline')) return undefined
  const heading = target.closest('.session-panel > .session-heading')
  return heading ?? undefined
}

bubbleStack.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || !bubbleDragHandle(event.target as Element)) return
  const rect = bubbleStack.getBoundingClientRect()
  bubbleDrag = {
    pointerId: event.pointerId,
    startClient: { x: event.clientX, y: event.clientY },
    startRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    startOffset: bubbleOffset,
    active: false,
  }
})

document.addEventListener('pointermove', (event) => {
  if (!bubbleDrag || bubbleDrag.pointerId !== event.pointerId) return
  const delta = {
    x: event.clientX - bubbleDrag.startClient.x,
    y: event.clientY - bubbleDrag.startClient.y,
  }
  if (!bubbleDrag.active && Math.hypot(delta.x, delta.y) <= 5) return
  if (!bubbleDrag.active) {
    bubbleDrag.active = true
    bubbleStack.classList.add('is-dragging')
    bubbleStack.setPointerCapture(event.pointerId)
    if (bubbleClickTimer !== undefined) window.clearTimeout(bubbleClickTimer)
    bubbleClickTimer = undefined
  }
  event.preventDefault()
  const desiredRect = {
    left: bubbleDrag.startRect.left + delta.x,
    top: bubbleDrag.startRect.top + delta.y,
  }
  applyBubbleSide(bubbleSideForCenter({
    x: desiredRect.left + bubbleDrag.startRect.width / 2,
    y: desiredRect.top + bubbleDrag.startRect.height / 2,
  }, petStage.getBoundingClientRect()))
  const rect = bubbleStack.getBoundingClientRect()
  const baseRect = {
    left: rect.left - bubbleOffset.x,
    top: rect.top - bubbleOffset.y,
    right: rect.right - bubbleOffset.x,
    bottom: rect.bottom - bubbleOffset.y,
  }
  const box = themeDisplayBox(theme.manifest.canvas)
  applyBubbleOffset(constrainBubbleOffset(
    { x: desiredRect.left - baseRect.left, y: desiredRect.top - baseRect.top },
    baseRect,
    { width: window.innerWidth, height: window.innerHeight },
    bubbleDragLimits({ width: box.width * scale, height: box.height * scale }),
  ))
})

function finishBubbleDrag(event: PointerEvent): void {
  if (!bubbleDrag || bubbleDrag.pointerId !== event.pointerId) return
  if (bubbleDrag.active) {
    suppressBubbleActivationUntil = Date.now() + 350
    bubbleStack.classList.remove('is-dragging')
    if (bubbleStack.hasPointerCapture(event.pointerId)) bubbleStack.releasePointerCapture(event.pointerId)
    event.preventDefault()
    window.requestAnimationFrame(syncChasePause)
    if (bubbleSide !== 'auto') {
      bubbleLayoutAdjustmentPending = true
      void window.harnessPet.setBubbleSide(bubbleSide).finally(() => {
        bubbleLayoutAdjustmentPending = false
        queueMicrotask(clampBubbleOffset)
      })
    }
  }
  bubbleDrag = undefined
}

document.addEventListener('pointerup', finishBubbleDrag)
document.addEventListener('pointercancel', finishBubbleDrag)
bubbleStack.addEventListener('click', (event) => {
  if (Date.now() > suppressBubbleActivationUntil) return
  event.preventDefault()
  event.stopImmediatePropagation()
}, true)
bubbleStack.addEventListener('dblclick', (event) => {
  if (Date.now() > suppressBubbleActivationUntil) return
  event.preventDefault()
  event.stopImmediatePropagation()
}, true)

window.addEventListener('blur', () => {
  setMenuOpen(false)
  finishPetDrag(undefined, 'cancel')
  bubbleStack.classList.remove('is-dragging')
  bubbleDrag = undefined
  ignoringWindowMouse = true
  window.harnessPet.setIgnoreMouseEvents(true)
})

function finishPetDrag(event: PointerEvent | undefined, reason: 'release' | 'cancel'): void {
  if (!dragging) return
  if (event && pressedPointerId !== undefined && event.pointerId !== pressedPointerId) return
  const pointerId = pressedPointerId
  const moved = dragDistance > 4
  dragging = false
  pressedPointerId = undefined
  clearLongPressTimer()
  if (pointerId !== undefined && petStage.hasPointerCapture(pointerId)) {
    try { petStage.releasePointerCapture(pointerId) } catch { /* Capture may already be gone. */ }
  }
  // Transparent Electron windows can report a real mouse release as
  // pointercancel/lostpointercapture (notably through remote desktop). Once
  // recording has started, preserve the user's speech instead of silently
  // discarding it because the pointer termination label was unreliable.
  if (voiceStopMode === 'release') void finishVoiceRecording(false)
  petStage.blur()
  window.harnessPet.endDrag()
  window.harnessPet.setChasePaused(false)
  if (moved) {
    lastDragEndedAt = Date.now()
    dragFacing = undefined
    pressReleased = true
    if (!preservesActiveAnimation(snapshot.state)) playState(snapshot.state, snapshot.state)
    return
  }
  if (reason === 'release' && !longPressTriggered) releasePress()
  else {
    pressReleased = true
    if (!preservesActiveAnimation(snapshot.state)) playState(snapshot.state, snapshot.state)
  }
}

petStage.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return
  recordInteraction()
  dragging = true
  dragDistance = 0
  dragFacing = undefined
  dragLastX = event.screenX
  dragOrigin = { x: event.screenX, y: event.screenY }
  pressedPointerId = event.pointerId
  longPressTriggered = false
  clearLongPressTimer()
  petStage.setPointerCapture(event.pointerId)
  window.harnessPet.beginDrag()
  if (!preservesActiveAnimation(snapshot.state)) playPress()
  longPressTimer = window.setTimeout(() => {
    longPressTimer = undefined
    if (!dragging || dragDistance > 4 || pressedPointerId !== event.pointerId) return
    longPressTriggered = true
    if (longPressAction === 'none') return
    if (longPressAction === 'voice') {
      if (canStartVoiceInput(snapshot.state, voiceInputEnabled, dragging, dragDistance)) void beginVoiceRecording('release')
      return
    }
    if (longPressAction === 'openRecentChat') {
      openComposer()
      return
    }
    void window.harnessPet.openClient(snapshot.sessionId)
  }, VOICE_LONG_PRESS_MS)
})

petStage.addEventListener('pointermove', (event) => {
  if (!dragging) return
  if (shouldRecoverLostPointerRelease(dragging, event.buttons)) {
    // Remote desktop software can resume with a new pointer ID after dropping
    // pointerup. The button bitmask is the authoritative recovery signal.
    finishPetDrag(undefined, 'release')
    return
  }
  if (pressedPointerId !== undefined && event.pointerId !== pressedPointerId) return
  const horizontalDelta = event.screenX - dragOrigin.x
  const horizontalMovement = event.screenX - dragLastX
  dragLastX = event.screenX
  dragDistance = Math.max(dragDistance, Math.hypot(horizontalDelta, event.screenY - dragOrigin.y))
  if (dragDistance > 4 && !longPressTriggered) clearLongPressTimer()
  const nextFacing = horizontalMovement < -1 ? 'left' : horizontalMovement > 1 ? 'right' : dragFacing
  if (dragDistance > 4 && nextFacing && nextFacing !== dragFacing) {
    dragFacing = nextFacing
    if (!preservesActiveAnimation(snapshot.state)) playWalk(nextFacing)
  }
  window.harnessPet.dragTo()
})

document.addEventListener('pointerup', (event) => finishPetDrag(event, 'release'), true)
document.addEventListener('pointercancel', (event) => finishPetDrag(event, 'cancel'), true)
petStage.addEventListener('lostpointercapture', (event) => finishPetDrag(event, 'cancel'))

petStage.addEventListener('dblclick', () => {
  if (Date.now() - lastDragEndedAt < 500) return
  if (doubleClickAction === 'none') return
  if (doubleClickAction === 'voice') {
    if (!voiceInputEnabled || preservesActiveAnimation(snapshot.state)) return
    if (voiceRequested || voiceRecording || voiceStartPromise || voiceFinishPromise) void finishVoiceRecording(false)
    else void beginVoiceRecording('toggle')
    return
  }
  if (doubleClickAction === 'openRecentChat') {
    openComposer()
    return
  }
  void window.harnessPet.openClient(snapshot.sessionId)
})

async function submitComposer(sessionId: string, input: HTMLTextAreaElement): Promise<void> {
  if (composerSubmittingSessionId) return
  if (voiceSessionId === sessionId && (voiceRequested || voiceRecording || voiceStartPromise || voiceFinishPromise)) {
    await finishVoiceRecording(false)
  }
  const attachments = composerAttachments.get(sessionId)
  const text = chatTextWithPaths(composerDrafts.get(sessionId) ?? '', attachments?.paths ?? [], locale)
  const images = (attachments?.images ?? []).map(({ bytes: _bytes, ...image }) => image)
  if (!text && !images.length) return
  if (text.length > 8_000) {
    setComposerFeedback(sessionId, locale === 'zh-CN' ? '消息和文件路径太长了' : 'The message and file paths are too long')
    return
  }
  composerSubmittingSessionId = sessionId
  input.disabled = true
  try {
    const result = await window.harnessPet.submitChat(text, sessionId, images)
    if (result.ok) {
      composerDrafts.delete(sessionId)
      composerAttachments.delete(sessionId)
      closeComposer()
    } else if (result.error) {
      setComposerFeedback(sessionId, result.error)
    }
  } finally {
    composerSubmittingSessionId = undefined
    if (document.contains(input)) {
      input.disabled = false
      input.focus()
    }
  }
}

pixelMenu.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button')
  if (!button) return
  recordInteraction()
  if (button === recentSessionTrigger) {
    setRecentSessionMenuOpen(!recentSessionMenu.classList.contains('is-open'))
    return
  }
  const selectedScale = Number(button.dataset.scale)
  if (Number.isFinite(selectedScale) && selectedScale >= 0.2 && selectedScale <= 2) {
    void window.harnessPet.setScale(selectedScale)
  }
  const action = button.dataset.menuAction
  if (action === 'open-client') void window.harnessPet.openClient(snapshot.sessionId)
  if (action === 'chat') openComposer()
  if (action === 'tap') handlePetTap()
  if (action === 'settings') void window.harnessPet.openSettings()
  if (action === 'toggle-chase') void window.harnessPet.setMouseChaseEnabled(!mouseChaseEnabled)
  if (action === 'reconnect') {
    void window.harnessPet.reconnect()
  }
  if (action === 'quit') void window.harnessPet.quit()
  if (action === 'stop-service') void window.harnessPet.stopService()
  setMenuOpen(false)
})
recentSessionMenu.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-session-id]')
  if (!button) return
  recordInteraction()
  openComposer(recentReplyableSessions(snapshot, 4).find((session) => session.id === button.dataset.sessionId))
  setMenuOpen(false)
})
document.addEventListener('keydown', (event) => {
  recordInteraction()
  if (event.key === 'Escape') {
    if (targetSessionId) closeComposer()
    else setMenuOpen(false)
  }
})

window.harnessPet.onSnapshot(applySnapshot)
window.harnessPet.onTheme(applyTheme)
window.harnessPet.onOpenChat(() => openComposer())
window.harnessPet.onComposeFiles((paths) => openComposerWithFiles(paths))
window.harnessPet.onServiceOwned((owned) => {
  serviceOwned = owned
  renderStatus()
})
window.harnessPet.onWindowDock(applyWindowDock)
window.harnessPet.onPetStageOffset(applyPetStageOffset)
window.harnessPet.onPreferences((value) => {
  document.documentElement.style.setProperty('--electric-blue', value.accentColor)
  reducedMotion = value.reducedMotion
  bubbleVisible = value.bubbleVisible
  scale = value.scale
  applyPetStageOffset(petStageOffset)
  doubleClickAction = value.doubleClickAction
  longPressAction = value.longPressAction
  voiceInputEnabled = value.voiceInputEnabled
  walkingEnabled = value.walkingEnabled
  mouseChaseEnabled = value.mouseChaseEnabled
  locale = value.locale
  menuActions = value.menuActions
  menuExtensions = value.menuExtensions
  applyLanguage()
  renderStatus()
  if (!preservesActiveAnimation(snapshot.state)) playState(snapshot.state, snapshot.state)
})

const bootstrap = await window.harnessPet.getBootstrap()
ignoringWindowMouse = true
window.harnessPet.setIgnoreMouseEvents(true)
theme = bootstrap.theme
document.documentElement.style.setProperty('--electric-blue', bootstrap.preferences.accentColor)
applyThemeLayout(theme)
snapshot = bootstrap.snapshot
if (snapshot.sessionId && snapshot.turn !== undefined && (snapshot.state === 'thinking' || snapshot.state === 'working' || snapshot.state === 'needsInput')) {
  observedTurns.set(snapshot.sessionId, snapshot.turn)
}
reducedMotion = bootstrap.reducedMotion
bubbleVisible = bootstrap.bubbleVisible
scale = bootstrap.scale
doubleClickAction = bootstrap.doubleClickAction
longPressAction = bootstrap.longPressAction
voiceInputEnabled = bootstrap.preferences.voiceInputEnabled
serviceOwned = bootstrap.serviceOwned
walkingEnabled = bootstrap.preferences.walkingEnabled
mouseChaseEnabled = bootstrap.preferences.mouseChaseEnabled
locale = bootstrap.preferences.locale
applyWindowDock(bootstrap.windowDock)
applyPetStageOffset(bootstrap.petStageOffset)
menuActions = bootstrap.preferences.menuActions
menuExtensions = bootstrap.preferences.menuExtensions
applyLanguage()
renderStatus()
playState(snapshot.state)
scheduleCompletionPreload(theme)
window.setInterval(() => { if (!targetSessionId) renderBubbles() }, 60_000)
