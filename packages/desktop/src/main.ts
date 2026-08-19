import { app, BrowserWindow, dialog, globalShortcut, ipcMain, screen, shell } from 'electron'
import { randomUUID } from 'node:crypto'
import { statSync, watch, type FSWatcher } from 'node:fs'
import { readFile, mkdir, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import WebSocket from 'ws'
import {
  initialSnapshot,
  isBridgeClientMessage,
  isBridgeServerMessage,
  petSettingsUrl,
  type BridgeClientMessage,
  type BridgeServerMessage,
  type PetQuestionAnswer,
  type PetSnapshot,
} from '@xy-deepseek-pet/protocol'
import { ThemeManager, type LoadedTheme } from './theme.js'
import { shouldEnterSleep, stateAfterInteraction } from './inactivity-policy.js'
import { draggedWindowPosition, normalizeWindowPosition } from './drag-position.js'
import { clampWindowPosition, resolvePetOffset, resolvePetPlacement, selectPetWindowDock, type WindowDock, type WorkArea } from './window-layout.js'
import { bridgeFileForStartup } from './bridge-startup.js'
import { MAC_PET_ACTIVATION_POLICY, macWindowVisibilityPolicy } from './window-visibility.js'
import { themeDisplayBox } from './theme-layout.js'
import {
  estimateFlingVelocity,
  facingForFling,
  flingUsesMovementAnimation,
  stepFling,
  type FlingMotion,
  type FlingSample,
  type PetCollisionBox,
} from './fling-policy.js'
import {
  canWander,
  chaseStep,
  DEFAULT_MOUSE_CHASE_SPEED,
  DEFAULT_WANDER_DISTANCE,
  DEFAULT_WANDER_FREQUENCY,
  mouseChaseStopRadius,
  selectWanderOffset,
  wanderIntervalMs,
} from './wander-policy.js'

interface Preferences {
  themeId: string
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
  wanderFrequency: number
  wanderDistance: number
  mouseChaseEnabled: boolean
  mouseChaseSpeed: number
  flingEnabled: boolean
  flingResistance: number
  showOnFullScreen: boolean
  teleportShortcutEnabled: boolean
  teleportShortcut: string
  teleportOpensRecentChat: boolean
  scale: number
  activationGesture: 'doubleClick' | 'longPress'
  locale: 'system' | 'zh-CN' | 'en'
  autoLaunch: boolean
  menuActions: string[]
  position?: { x: number; y: number }
}

interface BridgeStartup {
  port: number
  token: string
  clientUrl?: string
  serviceOwned?: boolean
}

interface MenuExtension {
  id: string
  label: { 'zh-CN': string; en: string }
  invoke: 'open-client' | 'chat' | 'tap' | 'settings'
  order?: number
}

const DEFAULT_PREFERENCES: Preferences = {
  themeId: 'whale-default',
  reducedMotion: false,
  bubbleVisible: true,
  walkingEnabled: true,
  wanderFrequency: DEFAULT_WANDER_FREQUENCY,
  wanderDistance: DEFAULT_WANDER_DISTANCE,
  mouseChaseEnabled: false,
  mouseChaseSpeed: DEFAULT_MOUSE_CHASE_SPEED,
  flingEnabled: true,
  flingResistance: 45,
  showOnFullScreen: true,
  teleportShortcutEnabled: false,
  teleportShortcut: 'CommandOrControl+Shift+P',
  teleportOpensRecentChat: false,
  scale: 1,
  activationGesture: 'longPress',
  locale: 'system',
  autoLaunch: false,
  menuActions: ['open-client', 'chat', 'settings'],
}
const BASE_WINDOW_WIDTH = 360
const BASE_WINDOW_HEIGHT = 348
const MAX_WIRE_BYTES = 64 * 1024
const MIN_SCALE = 0.2
const MAX_SCALE = 2
const SCALE_STEP = 0.05

let petWindow: BrowserWindow | undefined
let themeManager: ThemeManager
let activeTheme: LoadedTheme
let preferences: Preferences
let preferencesPath: string
let snapshot: PetSnapshot = initialSnapshot()
let bridge: DesktopBridge | undefined
let dragStart: { cursor: { x: number; y: number }; lastCursor: { x: number; y: number }; window: { x: number; y: number }; samples: FlingSample[] } | undefined
let currentWindowDock: WindowDock | undefined
let petStageOffset = { x: 0, y: 0 }
let wanderTimer: NodeJS.Timeout | undefined
let mouseChaseTimer: NodeJS.Timeout | undefined
let mouseChaseActive = false
let interactionChasePaused = false
let flingTimer: NodeJS.Timeout | undefined
let flingMotion: FlingMotion | undefined
let flingWorkArea: WorkArea | undefined
let flingPetBox: PetCollisionBox | undefined
let flingAnimated = false
let flingLastStepAt = 0
let inactivityTimer: NodeJS.Timeout | undefined
let preferencesWatcher: FSWatcher | undefined
let preferencesReloadTimer: NodeJS.Timeout | undefined
let menuExtensions: MenuExtension[] = []
let lastInteractionAt = Date.now()
let registeredTeleportShortcut: string | undefined
let textInputActive = false
const isDevelopment = process.argv.includes('--dev')
const isErrorDemo = isDevelopment && process.argv.includes('--demo-error')
const isApprovalDemo = isDevelopment && process.argv.includes('--demo-approval')

// Electron derives its per-user data directory from the app name. Set it before
// the app becomes ready so imports and the Harness settings service share a root.
app.setName('XY DeepSeek Pet')
if (process.platform === 'darwin') app.setActivationPolicy(MAC_PET_ACTIVATION_POLICY)

function findRepositoryRoot(): string {
  const appPath = app.getAppPath()
  const candidates = [resolve(appPath, 'resources'), resolve(appPath, '../..'), resolve(appPath, '../../..'), process.cwd()]
  for (const candidate of candidates) {
    try {
      if (requireStat(join(candidate, 'schemas', 'theme.schema.json'))) return candidate
    } catch {
      // Try the next development/package layout.
    }
  }
  throw new Error('Could not locate schemas/theme.schema.json')
}

function requireStat(path: string): boolean {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

async function readPreferences(): Promise<Preferences> {
  try {
    const parsed = JSON.parse(await readFile(preferencesPath, 'utf8')) as Partial<Preferences>
    const scale = normalizeScale(parsed.scale)
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      scale,
      activationGesture: parsed.activationGesture === 'doubleClick' || parsed.activationGesture === 'longPress'
        ? parsed.activationGesture
        : DEFAULT_PREFERENCES.activationGesture,
      wanderFrequency: normalizeMovementLevel(parsed.wanderFrequency, DEFAULT_PREFERENCES.wanderFrequency),
      wanderDistance: normalizeMovementLevel(parsed.wanderDistance, DEFAULT_PREFERENCES.wanderDistance),
      mouseChaseEnabled: parsed.mouseChaseEnabled === true,
      mouseChaseSpeed: normalizeMovementLevel(parsed.mouseChaseSpeed, DEFAULT_PREFERENCES.mouseChaseSpeed),
      flingEnabled: parsed.flingEnabled !== false,
      flingResistance: normalizeMovementLevel(parsed.flingResistance, DEFAULT_PREFERENCES.flingResistance),
      showOnFullScreen: parsed.showOnFullScreen !== false,
      teleportShortcutEnabled: parsed.teleportShortcutEnabled === true,
      teleportShortcut: normalizeAccelerator(parsed.teleportShortcut),
      teleportOpensRecentChat: parsed.teleportOpensRecentChat === true,
      locale: 'system',
      ...(parsed.position && Number.isFinite(parsed.position.x) && Number.isFinite(parsed.position.y)
        ? { position: parsed.position }
        : {}),
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

function normalizeScale(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < MIN_SCALE || value > MAX_SCALE) return DEFAULT_PREFERENCES.scale
  return Math.round(value / SCALE_STEP) * SCALE_STEP
}

function normalizeMovementLevel(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.round(Math.min(100, Math.max(0, value)))
}

function normalizeAccelerator(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_PREFERENCES.teleportShortcut
  const trimmed = value.trim()
  return /^(?:(?:CommandOrControl|Command|Control|Ctrl|Alt|Option|Shift|Super|Meta)\+)+[A-Z0-9]$/.test(trimmed)
    ? trimmed
    : DEFAULT_PREFERENCES.teleportShortcut
}

async function savePreferences(): Promise<void> {
  await mkdir(dirname(preferencesPath), { recursive: true })
  const staging = `${preferencesPath}.partial-${process.pid}`
  await writeFile(staging, `${JSON.stringify(preferences, null, 2)}\n`, { mode: 0o600 })
  await rename(staging, preferencesPath)
}

function clampPosition(position: { x: number; y: number }, preferredWorkArea?: WorkArea): { x: number; y: number } {
  const normalized = normalizeWindowPosition(position)
  const { width, height } = windowDimensions()
  const bounds = { x: normalized.x, y: normalized.y, width, height }
  const workArea = preferredWorkArea ?? screen.getDisplayMatching(bounds).workArea
  return normalizeWindowPosition(clampWindowPosition(normalized, { width, height }, workArea))
}

function currentPetSize(): { width: number; height: number } {
  const display = themeDisplayBox(activeTheme.manifest.canvas)
  return { width: display.width * preferences.scale, height: display.height * preferences.scale }
}

function currentPetPosition(): { x: number; y: number } {
  if (!petWindow || petWindow.isDestroyed()) return { x: 0, y: 0 }
  const [x = 0, y = 0] = petWindow.getPosition()
  return { x: x + petStageOffset.x, y: y + petStageOffset.y }
}

function setPetStageOffset(offset: { x: number; y: number }): void {
  if (Math.abs(offset.x - petStageOffset.x) < 0.01 && Math.abs(offset.y - petStageOffset.y) < 0.01) return
  petStageOffset = offset
  sendToPet('pet:stage-offset', petStageOffset)
}

function updateWindowDock(petPosition: { x: number; y: number }, petSize: { width: number; height: number }, force = false): void {
  if (!petWindow || petWindow.isDestroyed()) return
  const [windowX = 0, windowY = 0] = petWindow.getPosition()
  const [windowWidth = 0, windowHeight = 0] = petWindow.getSize()
  const next = selectPetWindowDock(
    petPosition,
    petSize,
    { x: windowX, y: windowY },
    { width: windowWidth, height: windowHeight },
  )
  if (next === currentWindowDock && !force) return
  currentWindowDock = next
  sendToPet('pet:window-dock', next)
}

function placeVisiblePet(
  desiredPetPosition: { x: number; y: number },
  displayBounds: WorkArea,
  animate = false,
  updateDock = true,
): boolean {
  if (!petWindow || petWindow.isDestroyed()) return false
  const [width = 0, height = 0] = petWindow.getSize()
  const petSize = currentPetSize()
  const placement = resolvePetPlacement(
    desiredPetPosition,
    { width, height },
    petSize,
    displayBounds,
    petStageOffset,
  )
  try {
    petWindow.setPosition(placement.windowPosition.x, placement.windowPosition.y, animate)
    const [actualX = placement.windowPosition.x, actualY = placement.windowPosition.y] = animate
      ? [placement.windowPosition.x, placement.windowPosition.y]
      : petWindow.getPosition()
    const actualWindowPosition = { x: actualX, y: actualY }
    const actualOffset = resolvePetOffset(placement.petPosition, actualWindowPosition, { width, height }, petSize)
    const actualPetPosition = {
      x: actualWindowPosition.x + actualOffset.x,
      y: actualWindowPosition.y + actualOffset.y,
    }
    setPetStageOffset(actualOffset)
    if (updateDock) updateWindowDock(actualPetPosition, petSize)
    return true
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.warn(`Could not move the desktop pet window: ${detail.slice(0, 240)}`)
    return false
  }
}

function initialPosition(): { x: number; y: number } {
  if (preferences.position) return clampPosition(preferences.position)
  const workArea = screen.getPrimaryDisplay().workArea
  const { width, height } = windowDimensions()
  return {
    x: workArea.x + workArea.width - width - 28,
    y: workArea.y + workArea.height - height - 28,
  }
}

function windowDimensions(): { width: number; height: number } {
  return {
    width: Math.max(BASE_WINDOW_WIDTH, Math.round(260 * preferences.scale + 96)),
    height: Math.max(BASE_WINDOW_HEIGHT, Math.round(224 * preferences.scale + 132)),
  }
}

async function setScale(scale: Preferences['scale']): Promise<void> {
  const petPosition = currentPetPosition()
  preferences.scale = scale
  if (petWindow) {
    const { width, height } = windowDimensions()
    petWindow.setSize(width, height)
    const bounds = screen.getDisplayNearestPoint(petPosition).bounds
    placeVisiblePet(petPosition, bounds)
    const [x = 0, y = 0] = petWindow.getPosition()
    preferences.position = { x, y }
    petWindow.webContents.send('pet:preferences', rendererPreferences())
  }
  await savePreferences()
}

function rendererPreferences() {
  return {
    reducedMotion: preferences.reducedMotion,
    bubbleVisible: preferences.bubbleVisible,
    scale: preferences.scale,
    activationGesture: preferences.activationGesture,
    walkingEnabled: preferences.walkingEnabled,
    mouseChaseEnabled: preferences.mouseChaseEnabled,
    locale: preferences.locale === 'system' ? (app.getLocale().toLowerCase().startsWith('zh') ? 'zh-CN' : 'en') : preferences.locale,
    menuActions: preferences.menuActions,
    menuExtensions,
  }
}

function teleportPetToCursor(): void {
  if (!petWindow || petWindow.isDestroyed()) return
  finishFling()
  finishMouseChase()
  dragStart = undefined
  interactionChasePaused = false
  const pointer = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(pointer)
  const petSize = currentPetSize()
  const desired = { x: pointer.x - petSize.width / 2, y: pointer.y - petSize.height / 2 }
  if (!placeVisiblePet(desired, display.workArea, false, true)) return
  updateWindowDock(currentPetPosition(), petSize, true)
  const [x = 0, y = 0] = petWindow.getPosition()
  preferences.position = { x, y }
  void savePreferences()
  petWindow.showInactive()
  petWindow.moveTop()
  if (preferences.teleportOpensRecentChat) sendToPet('pet:open-chat')
}

function registerTeleportShortcut(): void {
  if (registeredTeleportShortcut) {
    globalShortcut.unregister(registeredTeleportShortcut)
    registeredTeleportShortcut = undefined
  }
  if (!preferences.teleportShortcutEnabled) return
  const accelerator = normalizeAccelerator(preferences.teleportShortcut)
  try {
    if (globalShortcut.register(accelerator, teleportPetToCursor)) {
      registeredTeleportShortcut = accelerator
    } else {
      console.warn(`Could not register pet teleport shortcut: ${accelerator}`)
    }
  } catch (error) {
    console.warn(`Could not register pet teleport shortcut: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function readMenuExtensions(): Promise<MenuExtension[]> {
  try {
    const parsed = JSON.parse(await readFile(join(dirname(preferencesPath), 'menu-extensions.json'), 'utf8')) as MenuExtension[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.label?.['zh-CN'] === 'string' && typeof entry.label?.en === 'string' && ['open-client', 'chat', 'tap', 'settings'].includes(entry.invoke))
  } catch { return [] }
}

async function reloadExternalPreferences(): Promise<void> {
  const previous = preferences
  const next = await readPreferences()
  menuExtensions = await readMenuExtensions()
  preferences = next
  if (next.showOnFullScreen !== previous.showOnFullScreen && petWindow) applyWindowVisibility(petWindow)
  if (next.teleportShortcutEnabled !== previous.teleportShortcutEnabled || next.teleportShortcut !== previous.teleportShortcut) {
    registerTeleportShortcut()
  }
  if ((!next.flingEnabled || next.reducedMotion) && flingTimer) finishFling()
  if (next.wanderFrequency !== previous.wanderFrequency) startWandering()
  if (next.themeId !== previous.themeId) {
    const petPosition = currentPetPosition()
    try {
      activeTheme = await themeManager.load(next.themeId)
      preferences.themeId = activeTheme.manifest.id
      sendToPet('pet:theme', activeTheme)
      placeVisiblePet(petPosition, screen.getDisplayNearestPoint(petPosition).bounds)
    } catch {
      preferences.themeId = previous.themeId
    }
  }
  if (next.scale !== previous.scale && petWindow) {
    const petPosition = currentPetPosition()
    const { width, height } = windowDimensions()
    petWindow.setSize(width, height)
    const bounds = screen.getDisplayNearestPoint(petPosition).bounds
    placeVisiblePet(petPosition, bounds)
    const [x = 0, y = 0] = petWindow.getPosition()
    preferences.position = { x, y }
  }
  sendToPet('pet:preferences', rendererPreferences())
}

function watchPreferences(): void {
  preferencesWatcher?.close()
  preferencesWatcher = watch(dirname(preferencesPath), (_event, filename) => {
    if (filename !== 'pet-settings.json' && filename !== 'menu-extensions.json') return
    if (preferencesReloadTimer) clearTimeout(preferencesReloadTimer)
    preferencesReloadTimer = setTimeout(() => void reloadExternalPreferences(), 80)
  })
}

function sendToPet(channel: string, ...args: unknown[]): void {
  if (!petWindow || petWindow.isDestroyed() || petWindow.webContents.isDestroyed()) return
  petWindow.webContents.send(channel, ...args)
}

function recordInteraction(): void {
  lastInteractionAt = Date.now()
  const next = stateAfterInteraction(snapshot.state)
  if (next !== snapshot.state) {
    publishSnapshot({ ...snapshot, state: next, sequence: snapshot.sequence + 1, time: lastInteractionAt })
  }
}

function startInactivityTimer(): void {
  inactivityTimer = setInterval(() => {
    const now = Date.now()
    if (!shouldEnterSleep(snapshot.state, lastInteractionAt, now)) return
    publishSnapshot({ ...snapshot, state: 'sleep', sequence: snapshot.sequence + 1, time: now })
  }, 15_000)
}

function publishSnapshot(next: PetSnapshot): void {
  if (flingTimer && flingAnimated && flingMotion && (next.state === 'idle' || next.state === 'walk')) {
    next = { ...next, state: 'walk', facing: facingForFling(flingMotion.velocityX, snapshot.facing) }
  }
  snapshot = next
  sendToPet('pet:snapshot', snapshot)
}

async function confirmStopOwnedService(): Promise<void> {
  if (!bridge?.ownsService) {
    await dialog.showMessageBox({
      type: 'info',
      title: 'Harness service is externally managed',
      message: 'This pet did not start the Harness service.',
      detail: 'Quit the pet here and stop Harness from the terminal or launcher that owns it.',
    })
    return
  }
  const result = await dialog.showMessageBox({
    type: 'warning',
    title: 'Stop Harness and quit?',
    message: 'Stopping the service interrupts active sessions and disconnects open client tabs.',
    buttons: ['Keep running', 'Stop service and quit'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
  })
  if (result.response !== 1) return
  bridge.shutdownOwnedService()
  setTimeout(() => app.quit(), 180)
}

function createPetWindow(): BrowserWindow {
  const position = initialPosition()
  const { width, height } = windowDimensions()
  const petSize = currentPetSize()
  petStageOffset = {
    x: Math.max(0, (width - petSize.width) / 2),
    y: Math.max(0, height - petSize.height),
  }
  const window = new BrowserWindow({
    width,
    height,
    x: position.x,
    y: position.y,
    transparent: true,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })
  applyWindowVisibility(window)
  window.loadFile(join(import.meta.dirname, 'index.html'))
  window.on('show', () => applyWindowVisibility(window))
  window.once('ready-to-show', () => {
    window.showInactive()
    const [x = position.x, y = position.y] = window.getPosition()
    const petPosition = { x: x + petStageOffset.x, y: y + petStageOffset.y }
    updateWindowDock(petPosition, petSize)
  })
  return window
}

function applyWindowVisibility(window: BrowserWindow): void {
  if (process.platform !== 'darwin') {
    window.setAlwaysOnTop(!textInputActive)
    return
  }
  const policy = macWindowVisibilityPolicy(preferences.showOnFullScreen, textInputActive)
  window.setVisibleOnAllWorkspaces(policy.visibleOnAllWorkspaces, {
    visibleOnFullScreen: policy.visibleOnFullScreen,
    skipTransformProcessType: policy.skipTransformProcessType,
  })
  window.setAlwaysOnTop(true, policy.alwaysOnTopLevel)
}

function registerIpc(): void {
  ipcMain.handle('pet:get-bootstrap', async () => ({
    snapshot,
    theme: activeTheme,
    reducedMotion: preferences.reducedMotion,
    bubbleVisible: preferences.bubbleVisible,
    scale: preferences.scale,
    activationGesture: preferences.activationGesture,
    serviceOwned: bridge?.ownsService ?? false,
    petStageOffset,
    windowDock: currentWindowDock ?? 'center',
    preferences: rendererPreferences(),
  }))
  ipcMain.handle('pet:set-bubble-visible', async (_event, visible: boolean) => {
    preferences.bubbleVisible = Boolean(visible)
    await savePreferences()
  })
  ipcMain.handle('pet:record-interaction', () => recordInteraction())
  ipcMain.handle('pet:chat', async (_event, text: unknown, sessionId?: unknown) => {
    if (typeof text !== 'string' || !text.trim() || text.length > 8_000) return { ok: false, error: 'Message is empty or too long.' }
    if (isErrorDemo) {
      publishSnapshot({ state: 'idle', connected: true, facing: snapshot.facing, sequence: snapshot.sequence + 1, time: Date.now(), text: 'Failure demo acknowledged' })
      return { ok: true }
    }
    if (!bridge?.isConnected) return { ok: false, error: 'Harness is not connected.' }
    try {
      await bridge.sendChat(text.trim(), typeof sessionId === 'string' ? sessionId : undefined)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
  ipcMain.handle('pet:approval-decision', async (_event, sessionId: unknown, requestId: unknown, outcome: unknown) => {
    if (typeof sessionId !== 'string' || typeof requestId !== 'string' || (outcome !== 'allowed-once' && outcome !== 'rejected')) {
      return { ok: false, error: 'Approval decision is invalid.' }
    }
    if (isApprovalDemo && sessionId === 'approval-demo' && requestId === 'approval-demo-request') {
      const time = Date.now()
      publishSnapshot({
        state: 'thinking', connected: true, facing: snapshot.facing, sessionId, turn: 1, sequence: snapshot.sequence + 1, time,
        text: outcome === 'allowed-once' ? '开发测试：已允许本次操作' : '开发测试：已拒绝本次操作',
        sessions: [{
          id: sessionId,
          title: '审批气泡测试',
          state: 'thinking',
          unread: false,
          updatedAt: time,
          turn: 1,
          text: outcome === 'allowed-once' ? '已允许，继续思考' : '已拒绝，继续处理',
        }],
      })
      return { ok: true }
    }
    if (!bridge?.isConnected) return { ok: false, error: 'Harness is not connected.' }
    try {
      await bridge.decideApproval(sessionId, requestId, outcome)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
  ipcMain.handle('pet:question-answer', async (_event, sessionId: unknown, requestId: unknown, answers: unknown) => {
    const candidate = { type: 'question-answer', sessionId, requestId, answers }
    if (!isBridgeClientMessage(candidate)) return { ok: false, error: 'Question answer is invalid.' }
    if (!bridge?.isConnected) return { ok: false, error: 'Harness is not connected.' }
    try {
      await bridge.answerQuestion(candidate.sessionId, candidate.requestId, candidate.answers)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
  ipcMain.handle('pet:acknowledge', (_event, sessionId: unknown) => {
    if (typeof sessionId !== 'string') return
    if (isErrorDemo && sessionId === snapshot.sessionId) {
      publishSnapshot({ state: 'idle', connected: true, facing: snapshot.facing, sequence: snapshot.sequence + 1, time: Date.now() })
      return
    }
    bridge?.acknowledge(sessionId)
  })
  ipcMain.handle('pet:record-treasure-found', () => bridge?.recordTreasureFound())
  ipcMain.handle('pet:open-client', (_event, sessionId?: unknown) => {
    bridge?.openClient(typeof sessionId === 'string' ? sessionId : undefined)
  })
  ipcMain.handle('pet:open-settings', () => bridge?.openSettings())
  ipcMain.handle('pet:reconnect', async () => {
    try {
      const startup = await readBridgeStartup(process.argv, false)
      if (startup) {
        bridge?.stop()
        bridge = new DesktopBridge(startup)
        bridge.start()
        sendToPet('pet:service-owned', bridge.ownsService)
      } else if (bridge) {
        bridge.reconnectNow()
      } else {
        return { ok: false, error: 'Harness bridge information is unavailable.' }
      }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message.slice(0, 200) : 'Could not reconnect to Harness.' }
    }
  })
  ipcMain.handle('pet:set-scale', async (_event, value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value) && value >= MIN_SCALE && value <= MAX_SCALE) await setScale(normalizeScale(value))
  })
  ipcMain.handle('pet:set-gesture', async (_event, value: unknown) => {
    if (value !== 'doubleClick' && value !== 'longPress') return
    preferences.activationGesture = value
    sendToPet('pet:preferences', rendererPreferences())
    await savePreferences()
  })
  ipcMain.handle('pet:set-mouse-chase-enabled', async (_event, enabled: unknown) => {
    if (typeof enabled !== 'boolean') return
    preferences.mouseChaseEnabled = enabled
    interactionChasePaused = false
    if (!enabled) finishMouseChase()
    sendToPet('pet:preferences', rendererPreferences())
    await savePreferences()
  })
  ipcMain.handle('pet:quit', () => app.quit())
  ipcMain.handle('pet:stop-service', () => confirmStopOwnedService())
  ipcMain.on('pet:drag-begin', () => {
    if (!petWindow) return
    finishFling()
    const point = screen.getCursorScreenPoint()
    dragStart = { cursor: point, lastCursor: point, window: currentPetPosition(), samples: [{ ...point, time: Date.now() }] }
  })
  ipcMain.on('pet:drag-move', () => {
    if (!petWindow || petWindow.isDestroyed() || !dragStart) return
    const point = screen.getCursorScreenPoint()
    const now = Date.now()
    dragStart.samples.push({ ...point, time: now })
    dragStart.samples = dragStart.samples.filter((sample) => now - sample.time <= 180)
    const horizontalMovement = point.x - dragStart.lastCursor.x
    dragStart.lastCursor = point
    const facing = horizontalMovement < -1 ? 'left' : horizontalMovement > 1 ? 'right' : snapshot.facing
    if ((snapshot.state === 'idle' || snapshot.state === 'walk') && facing !== snapshot.facing) {
      publishSnapshot({ ...snapshot, facing, sequence: snapshot.sequence + 1, time: Date.now() })
    }
    const position = draggedWindowPosition(dragStart.cursor, dragStart.window, point)
    const bounds = screen.getDisplayNearestPoint(point).bounds
    placeVisiblePet(position, bounds)
  })
  ipcMain.on('pet:drag-end', () => {
    if (!petWindow || petWindow.isDestroyed() || !dragStart) return
    const release = screen.getCursorScreenPoint()
    const releasedAt = Date.now()
    const samples = [...dragStart.samples, { ...release, time: releasedAt }]
    dragStart = undefined
    interactionChasePaused = false
    const petPosition = currentPetPosition()
    const bounds = screen.getDisplayNearestPoint(release).bounds
    const petSize = currentPetSize()
    const pet = { offsetX: 0, offsetY: 0, ...petSize }
    if (!startFling(samples, bounds, pet)) {
      updateWindowDock(petPosition, petSize, true)
      const [settledX = 0, settledY = 0] = petWindow.getPosition()
      preferences.position = { x: settledX, y: settledY }
      void savePreferences()
    }
  })
  ipcMain.on('pet:chase-paused', (_event, paused: unknown) => {
    if (typeof paused !== 'boolean') return
    interactionChasePaused = paused
    if (paused) finishMouseChase()
  })
  ipcMain.on('pet:set-ignore-mouse-events', (_event, ignored: unknown) => {
    if (!petWindow || petWindow.isDestroyed() || typeof ignored !== 'boolean') return
    petWindow.setIgnoreMouseEvents(ignored, { forward: true })
  })
  ipcMain.on('pet:text-input-active', (_event, active: unknown) => {
    if (typeof active !== 'boolean' || textInputActive === active) return
    textInputActive = active
    if (petWindow && !petWindow.isDestroyed()) applyWindowVisibility(petWindow)
  })
}

function startWandering(): void {
  if (wanderTimer) clearTimeout(wanderTimer)
  wanderTimer = setTimeout(() => {
    if (!petWindow || flingTimer || !canWander({
      walkingEnabled: preferences.walkingEnabled,
      mouseChaseEnabled: preferences.mouseChaseEnabled,
      reducedMotion: preferences.reducedMotion,
      interactionPaused: interactionChasePaused,
      dragging: Boolean(dragStart),
      state: snapshot.state,
    })) {
      startWandering()
      return
    }
    const petPosition = currentPetPosition()
    const offset = selectWanderOffset(preferences.wanderDistance)
    const target = { x: petPosition.x + offset.x, y: petPosition.y + offset.y }
    publishSnapshot({
      ...snapshot,
      state: 'walk',
      facing: offset.facing,
      sequence: snapshot.sequence + 1,
      time: Date.now(),
    })
    placeVisiblePet(target, screen.getDisplayNearestPoint(target).bounds, true)
    const [x = 0, y = 0] = petWindow.getPosition()
    preferences.position = { x, y }
    setTimeout(() => {
      if (snapshot.state === 'walk') publishSnapshot({ ...snapshot, state: 'idle', sequence: snapshot.sequence + 1, time: Date.now() })
    }, 1500)
    void savePreferences()
    startWandering()
  }, wanderIntervalMs(preferences.wanderFrequency))
}

function finishMouseChase(): void {
  if (!mouseChaseActive) return
  mouseChaseActive = false
  if (snapshot.state === 'walk') {
    publishSnapshot({ ...snapshot, state: 'idle', sequence: snapshot.sequence + 1, time: Date.now() })
  }
  void savePreferences()
}

function startMouseChase(): void {
  mouseChaseTimer = setInterval(() => {
    const canChase = petWindow
      && !petWindow.isDestroyed()
      && preferences.mouseChaseEnabled
      && !preferences.reducedMotion
      && !interactionChasePaused
      && !dragStart
      && !flingTimer
      && (snapshot.state === 'idle' || snapshot.state === 'walk')
    if (!canChase || !petWindow) {
      finishMouseChase()
      return
    }
    const [width = 0, height = 0] = petWindow.getSize()
    const pointer = screen.getCursorScreenPoint()
    const petPosition = currentPetPosition()
    const petSize = currentPetSize()
    const petAnchor = { x: petPosition.x + petSize.width / 2, y: petPosition.y + petSize.height / 2 }
    const step = chaseStep(
      petAnchor,
      pointer,
      preferences.mouseChaseSpeed,
      mouseChaseStopRadius(preferences.scale, { width, height }),
    )
    if (!step) {
      finishMouseChase()
      return
    }
    mouseChaseActive = true
    if (snapshot.state !== 'walk' || snapshot.facing !== step.facing) {
      publishSnapshot({
        ...snapshot,
        state: 'walk',
        facing: step.facing,
        sequence: snapshot.sequence + 1,
        time: Date.now(),
      })
    }
    const target = { x: petPosition.x + step.x, y: petPosition.y + step.y }
    // Resolve against the pointer's display, so crossing either direction is symmetrical.
    placeVisiblePet(target, screen.getDisplayNearestPoint(pointer).workArea)
    const [x = 0, y = 0] = petWindow.getPosition()
    preferences.position = { x, y }
  }, 50)
}

function startFling(samples: readonly FlingSample[], workArea: WorkArea, pet: PetCollisionBox): boolean {
  if (!petWindow || petWindow.isDestroyed() || !preferences.flingEnabled || preferences.reducedMotion) return false
  const velocity = estimateFlingVelocity(samples)
  if (!velocity) return false
  finishMouseChase()
  const position = currentPetPosition()
  flingMotion = { ...position, velocityX: velocity.x, velocityY: velocity.y }
  flingWorkArea = workArea
  flingPetBox = pet
  flingAnimated = flingUsesMovementAnimation(snapshot.state)
  flingLastStepAt = Date.now()
  if (flingAnimated) {
    publishSnapshot({
      ...snapshot,
      state: 'walk',
      facing: facingForFling(velocity.x, snapshot.facing),
      sequence: snapshot.sequence + 1,
      time: flingLastStepAt,
    })
  }
  flingTimer = setInterval(tickFling, 16)
  return true
}

function tickFling(): void {
  if (!petWindow || petWindow.isDestroyed() || !flingMotion || !flingWorkArea || !flingPetBox || dragStart || !preferences.flingEnabled || preferences.reducedMotion) {
    finishFling()
    return
  }
  const now = Date.now()
  const next = stepFling(flingMotion, (now - flingLastStepAt) / 1_000, flingPetBox, flingWorkArea, preferences.flingResistance)
  flingLastStepAt = now
  const moved = placeVisiblePet({ x: next.x, y: next.y }, flingWorkArea)
  const actualPosition = moved ? currentPetPosition() : { x: next.x, y: next.y }
  flingMotion = { ...next, ...actualPosition }
  if (flingAnimated && snapshot.state === 'walk') {
    const facing = facingForFling(next.velocityX, snapshot.facing)
    if (facing !== snapshot.facing) publishSnapshot({ ...snapshot, facing, sequence: snapshot.sequence + 1, time: now })
  }
  if (next.stopped) finishFling()
}

function finishFling(): void {
  if (flingTimer) clearInterval(flingTimer)
  const wasActive = Boolean(flingTimer || flingMotion)
  const settledWorkArea = flingWorkArea
  flingTimer = undefined
  flingMotion = undefined
  flingWorkArea = undefined
  flingPetBox = undefined
  if (flingAnimated && snapshot.state === 'walk') {
    publishSnapshot({ ...snapshot, state: 'idle', sequence: snapshot.sequence + 1, time: Date.now() })
  }
  flingAnimated = false
  if (!wasActive || !petWindow || petWindow.isDestroyed()) return
  if (settledWorkArea) updateWindowDock(currentPetPosition(), currentPetSize())
  const [x = 0, y = 0] = petWindow.getPosition()
  preferences.position = { x, y }
  void savePreferences()
}

class DesktopBridge {
  private socket: WebSocket | undefined
  private reconnectTimer: NodeJS.Timeout | undefined
  private stopped = false
  private authenticated = false
  private lastDirectClientOpen: { target: string; at: number } | undefined
  private readonly pending = new Map<
    string,
    { resolve: () => void; reject: (error: Error) => void; timeout: NodeJS.Timeout }
  >()

  constructor(private readonly startup: BridgeStartup) {}

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN && this.authenticated
  }

  get ownsService(): boolean {
    return this.startup.serviceOwned === true
  }

  start(): void {
    this.connect()
  }

  reconnectNow(): void {
    if (this.stopped) return
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = undefined
    this.authenticated = false
    const stale = this.socket
    this.socket = undefined
    stale?.terminate()
    this.connect()
  }

  stop(): void {
    this.stopped = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.socket?.close()
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('Harness bridge stopped'))
    }
    this.pending.clear()
  }

  sendChat(text: string, sessionId?: string): Promise<void> {
    if (!this.isConnected || !this.socket) return Promise.reject(new Error('Harness is not connected'))
    const requestId = randomUUID()
    const message: BridgeClientMessage = { type: 'chat', requestId, text, ...(sessionId ? { sessionId } : {}) }
    this.socket.send(JSON.stringify(message))
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error('Harness did not acknowledge the message'))
      }, 10_000)
      this.pending.set(requestId, { resolve: resolvePromise, reject, timeout })
    })
  }

  decideApproval(sessionId: string, requestId: string, outcome: 'allowed-once' | 'rejected'): Promise<void> {
    if (!this.isConnected || !this.socket) return Promise.reject(new Error('Harness is not connected'))
    const message: BridgeClientMessage = { type: 'approval-decision', requestId, sessionId, outcome }
    this.socket.send(JSON.stringify(message))
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error('Harness did not acknowledge the approval decision'))
      }, 10_000)
      this.pending.set(requestId, { resolve: resolvePromise, reject, timeout })
    })
  }

  answerQuestion(sessionId: string, requestId: string, answers: PetQuestionAnswer[]): Promise<void> {
    if (!this.isConnected || !this.socket) return Promise.reject(new Error('Harness is not connected'))
    const message: BridgeClientMessage = { type: 'question-answer', requestId, sessionId, answers }
    this.socket.send(JSON.stringify(message))
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error('Harness did not acknowledge the question answer'))
      }, 10_000)
      this.pending.set(requestId, { resolve: resolvePromise, reject, timeout })
    })
  }

  acknowledge(sessionId: string): void {
    if (!this.isConnected || !this.socket) return
    const message: BridgeClientMessage = { type: 'acknowledge', sessionId }
    this.socket.send(JSON.stringify(message))
  }

  recordTreasureFound(): void {
    if (!this.isConnected || !this.socket) return
    const message: BridgeClientMessage = { type: 'treasure-found' }
    this.socket.send(JSON.stringify(message))
  }

  openClient(sessionId?: string): void {
    if (this.isConnected && this.socket) {
      const message: BridgeClientMessage = { type: 'open-client', ...(sessionId ? { sessionId } : {}) }
      this.socket.send(JSON.stringify(message))
      return
    }
    const now = Date.now()
    const target = sessionId ?? ''
    if (this.lastDirectClientOpen?.target === target && now - this.lastDirectClientOpen.at < 5_000) return
    this.lastDirectClientOpen = { target, at: now }
    const url = this.startup.clientUrl ?? 'http://127.0.0.1:3080'
    void shell.openExternal(url)
  }

  openSettings(): void {
    const now = Date.now()
    if (this.lastDirectClientOpen?.target === 'settings' && now - this.lastDirectClientOpen.at < 5_000) return
    this.lastDirectClientOpen = { target: 'settings', at: now }
    const url = petSettingsUrl(this.startup.clientUrl ?? 'http://127.0.0.1:3080')
    void shell.openExternal(url)
  }

  shutdownOwnedService(): void {
    if (!this.ownsService || !this.isConnected || !this.socket) return
    const message: BridgeClientMessage = { type: 'shutdown-service' }
    this.socket.send(JSON.stringify(message))
  }

  private connect(): void {
    if (this.stopped) return
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return
    const socket = new WebSocket(`ws://127.0.0.1:${this.startup.port}`, { maxPayload: MAX_WIRE_BYTES })
    this.socket = socket
    socket.on('open', () => {
      const message: BridgeClientMessage = { type: 'auth', token: this.startup.token }
      socket.send(JSON.stringify(message))
    })
    socket.on('message', (data) => this.onMessage(data))
    socket.on('close', () => {
      if (this.socket !== socket) return
      this.socket = undefined
      this.authenticated = false
      publishSnapshot({
        ...snapshot,
        state: 'offline',
        connected: false,
        sequence: snapshot.sequence + 1,
        time: Date.now(),
        text: 'Harness disconnected',
      })
      if (!this.stopped) this.reconnectTimer = setTimeout(() => this.connect(), 1500)
    })
    socket.on('error', () => socket.close())
  }

  private onMessage(data: WebSocket.RawData): void {
    const byteLength = Array.isArray(data) ? data.reduce((total, part) => total + part.byteLength, 0) : data.byteLength
    if (byteLength > MAX_WIRE_BYTES) return this.socket?.close(1009, 'Message too large')
    let message: unknown
    try {
      message = JSON.parse(data.toString())
    } catch {
      return
    }
    if (!isBridgeServerMessage(message)) return
    if (message.type === 'quit') {
      app.quit()
      return
    }
    if (message.type === 'snapshot') {
      this.authenticated = true
      lastInteractionAt = Date.now()
      publishSnapshot(message.snapshot)
      return
    }
    if (message.type === 'chat-result') this.resolveChat(message)
    if (message.type === 'approval-result') this.resolveRequest(message)
    if (message.type === 'question-result') this.resolveRequest(message)
    if (message.type === 'theme-import') void this.importTheme(message)
  }

  private resolveChat(message: Extract<BridgeServerMessage, { type: 'chat-result' }>): void {
    this.resolveRequest(message)
  }

  private resolveRequest(message: Extract<BridgeServerMessage, { type: 'chat-result' | 'approval-result' | 'question-result' }>): void {
    const pending = this.pending.get(message.requestId)
    if (!pending) return
    clearTimeout(pending.timeout)
    this.pending.delete(message.requestId)
    if (message.ok) pending.resolve()
    else pending.reject(new Error(message.error))
  }

  private async importTheme(message: Extract<BridgeServerMessage, { type: 'theme-import' }>): Promise<void> {
    if (!this.socket || !this.isConnected) return
    const importsRoot = resolve(homedir(), '.xy-deepseek-pet', 'imports')
    const archivePath = resolve(message.path)
    const pathFromRoot = relative(importsRoot, archivePath)
    if (!pathFromRoot || pathFromRoot.startsWith('..') || pathFromRoot.includes('/../') || pathFromRoot.includes('\\..\\')) {
      this.sendThemeImportResult({ type: 'theme-import-result', requestId: message.requestId, ok: false, error: 'Import path is outside the managed directory' })
      return
    }
    try {
      const loaded = await themeManager.importPath(archivePath)
      activeTheme = loaded
      preferences.themeId = loaded.manifest.id
      await savePreferences()
      sendToPet('pet:theme', loaded)
      this.sendThemeImportResult({ type: 'theme-import-result', requestId: message.requestId, ok: true, themeId: loaded.manifest.id })
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      this.sendThemeImportResult({ type: 'theme-import-result', requestId: message.requestId, ok: false, error: text.slice(0, 500) })
    }
  }

  private sendThemeImportResult(message: Extract<BridgeClientMessage, { type: 'theme-import-result' }>): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message))
  }
}

async function readBridgeStartup(args: readonly string[] = process.argv, allowStdin = true): Promise<BridgeStartup | undefined> {
  const port = Number(process.env.HARNESS_PET_BRIDGE_PORT)
  const token = process.env.HARNESS_PET_BRIDGE_TOKEN
  if (Number.isInteger(port) && port > 0 && port < 65536 && token) return { port, token }
  const bridgeFile = bridgeFileForStartup(args)
  try {
    const parsed = JSON.parse(await readFile(bridgeFile, 'utf8')) as BridgeStartup
    if (Number.isInteger(parsed.port) && parsed.port > 0 && parsed.port < 65536 && typeof parsed.token === 'string') return parsed
  } catch {
    // Fall through to stdin/offline preview.
  }
  if (!allowStdin || process.stdin.isTTY) return undefined

  return new Promise((resolveStartup) => {
    let value = ''
    let settled = false
    const finish = (startup: BridgeStartup | undefined): void => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      process.stdin.off('data', onData)
      resolveStartup(startup)
    }
    const timeout = setTimeout(() => finish(undefined), 800)
    process.stdin.setEncoding('utf8')
    const onData = (chunk: string): void => {
      value += chunk
      const newline = value.indexOf('\n')
      if (newline < 0) return
      try {
        const parsed = JSON.parse(value.slice(0, newline)) as BridgeStartup
        if (Number.isInteger(parsed.port) && parsed.port > 0 && parsed.port < 65536 && typeof parsed.token === 'string') {
          finish(parsed)
        } else finish(undefined)
      } catch {
        finish(undefined)
      }
    }
    process.stdin.on('data', onData)
  })
}

async function attachBridgeFromArgs(args: readonly string[], allowStdin = false): Promise<void> {
  const startup = await readBridgeStartup(args, allowStdin)
  if (!startup) return
  bridge?.stop()
  bridge = new DesktopBridge(startup)
  bridge.start()
  sendToPet('pet:service-owned', bridge.ownsService)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    void attachBridgeFromArgs(commandLine)
    petWindow?.showInactive()
    petWindow?.moveTop()
  })
  app.whenReady().then(async () => {
    preferencesPath = join(homedir(), '.xy-deepseek-pet', 'pet-settings.json')
    await mkdir(dirname(preferencesPath), { recursive: true, mode: 0o700 })
    preferences = await readPreferences()
    menuExtensions = await readMenuExtensions()
    themeManager = new ThemeManager({ userData: app.getPath('userData'), repositoryRoot: findRepositoryRoot() })
    await themeManager.initialize()
    activeTheme = await themeManager.load(preferences.themeId)
    preferences.themeId = activeTheme.manifest.id

    if (isErrorDemo) {
      const time = Date.now()
      snapshot = {
        state: 'error', connected: true, facing: 'right', sessionId: 'failure-demo', sequence: 1, time,
        text: '开发测试：点击勾或回复以播放失败退场动画',
        sessions: [{ id: 'failure-demo', title: '失败动画测试', state: 'error', unread: true, updatedAt: time, text: '进入 → 翻肚皮停留 → 退场' }],
      }
    } else if (isApprovalDemo) {
      const time = Date.now()
      snapshot = {
        state: 'needsInput', connected: true, facing: 'right', sessionId: 'approval-demo', turn: 1, sequence: 1, time,
        text: 'Approval required: write_file',
        sessions: [{
          id: 'approval-demo',
          title: '审批气泡测试',
          state: 'needsInput',
          unread: true,
          updatedAt: time,
          turn: 1,
          text: 'Approval required: write_file',
          approval: { requestId: 'approval-demo-request', toolName: 'write_file' },
        }],
      }
    } else if (isDevelopment) {
      snapshot = {
        state: 'idle',
        connected: true,
        facing: 'right',
        sequence: 1,
        time: Date.now(),
        text: 'XY DeepSeek Pet preview',
      }
    }
    registerIpc()
    petWindow = createPetWindow()
    registerTeleportShortcut()
    startWandering()
    startMouseChase()
    startInactivityTimer()
    watchPreferences()

    if (!isErrorDemo && !isApprovalDemo) await attachBridgeFromArgs(process.argv, true)
  })
}

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
  bridge?.stop()
  if (wanderTimer) clearInterval(wanderTimer)
  if (mouseChaseTimer) clearInterval(mouseChaseTimer)
  if (flingTimer) clearInterval(flingTimer)
  if (inactivityTimer) clearInterval(inactivityTimer)
  if (preferencesReloadTimer) clearTimeout(preferencesReloadTimer)
  preferencesWatcher?.close()
})

app.on('window-all-closed', () => app.quit())
