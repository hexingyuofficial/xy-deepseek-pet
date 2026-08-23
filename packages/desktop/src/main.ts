import { app, BrowserWindow, dialog, globalShortcut, ipcMain, screen, shell } from 'electron'
import { randomUUID } from 'node:crypto'
import { statSync, watch, type FSWatcher } from 'node:fs'
import { appendFile, readFile, mkdir, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import WebSocket from 'ws'
import {
  DEFAULT_PET_ACCENT_COLOR,
  initialSnapshot,
  isBridgeClientMessage,
  isBridgeServerMessage,
  petSettingsUrl,
  type BridgeClientMessage,
  type BridgeServerMessage,
  type PetChatImage,
  type PetQuestionAnswer,
  type PetSnapshot,
} from '@xy-deepseek-pet/protocol'
import { ThemeManager, type LoadedTheme } from './theme.js'
import { shouldEnterSleep, stateAfterInteraction } from './inactivity-policy.js'
import { draggedWindowPosition, normalizeWindowPosition } from './drag-position.js'
import { clampWindowPosition, companionWindowSize, preferredPetOffsetForBubble, resolvePetOffset, resolvePetPlacement, selectPetWindowDock, type PetBubbleSide, type WindowDock, type WorkArea } from './window-layout.js'
import { bridgeFileForStartup, finderComposePathsFromArgs } from './bridge-startup.js'
import { MAC_PET_ACTIVATION_POLICY, macWindowVisibilityPolicy, summonWindowActivation } from './window-visibility.js'
import { themeDisplayBox } from './theme-layout.js'
import { analyzePcm16Wav, MAX_VOICE_WAV_BYTES } from './voice-audio.js'
import { isNoSpeechDetectedError, SystemVoiceTranscriber, type VoiceLanguage } from './voice-transcription.js'
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
  accentColor: string
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
  doubleClickAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness'
  longPressAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness'
  voiceInputEnabled: boolean
  voiceProvider: 'system'
  voiceLanguage: VoiceLanguage
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
  accentColor: DEFAULT_PET_ACCENT_COLOR,
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
  doubleClickAction: 'openHarness',
  longPressAction: 'voice',
  voiceInputEnabled: true,
  voiceProvider: 'system',
  voiceLanguage: 'system',
  locale: 'system',
  autoLaunch: false,
  menuActions: ['open-client', 'chat', 'settings'],
}
const BASE_WINDOW_WIDTH = 360
const BASE_WINDOW_HEIGHT = 348
const MAX_WIRE_BYTES = 12 * 1024 * 1024
const MIN_SCALE = 0.2
const MAX_SCALE = 2
const SCALE_STEP = 0.05

let petWindow: BrowserWindow | undefined
let themeManager: ThemeManager
let activeTheme: LoadedTheme
let preferences: Preferences
let preferencesPath: string
let preferencesSaveQueue: Promise<void> = Promise.resolve()
let snapshot: PetSnapshot = initialSnapshot()
let bridge: DesktopBridge | undefined
let dragStart: { cursor: { x: number; y: number }; lastCursor: { x: number; y: number }; window: { x: number; y: number }; samples: FlingSample[] } | undefined
let currentWindowDock: WindowDock | undefined
let pendingFinderComposePaths: string[] = []
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
let resourceRoot: string
let preferencesReloadTimer: NodeJS.Timeout | undefined
let menuExtensions: MenuExtension[] = []
let lastInteractionAt = Date.now()
let registeredTeleportShortcut: string | undefined
let textInputActive = false
let voiceTranscriptionActive = false
const voiceDiagnosticPath = join(homedir(), '.xy-deepseek-pet', 'voice-diagnostic.log')
const isDevelopment = process.argv.includes('--dev')
const isErrorDemo = isDevelopment && process.argv.includes('--demo-error')
const isApprovalDemo = isDevelopment && process.argv.includes('--demo-approval')

function recordVoiceDiagnostic(message: string): void {
  const line = `${new Date().toISOString()} ${message.replace(/[\r\n]+/g, ' ').slice(0, 500)}\n`
  void mkdir(dirname(voiceDiagnosticPath), { recursive: true, mode: 0o700 })
    .then(() => appendFile(voiceDiagnosticPath, line, { encoding: 'utf8', mode: 0o600 }))
    .catch(() => undefined)
}

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
    const parsed = JSON.parse(await readFile(preferencesPath, 'utf8')) as Partial<Preferences> & { activationGesture?: 'doubleClick' | 'longPress' }
    const scale = normalizeScale(parsed.scale)
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      accentColor: typeof parsed.accentColor === 'string' && /^#[0-9a-f]{6}$/i.test(parsed.accentColor)
        ? parsed.accentColor.toLowerCase()
        : DEFAULT_PREFERENCES.accentColor,
      scale,
      doubleClickAction: parsed.doubleClickAction === 'none' || parsed.doubleClickAction === 'voice' || parsed.doubleClickAction === 'openRecentChat' || parsed.doubleClickAction === 'openHarness'
        ? parsed.doubleClickAction
        : DEFAULT_PREFERENCES.doubleClickAction,
      longPressAction: parsed.longPressAction === 'none' || parsed.longPressAction === 'voice' || parsed.longPressAction === 'openRecentChat' || parsed.longPressAction === 'openHarness'
        ? parsed.longPressAction
        : parsed.voiceInputEnabled === false && parsed.activationGesture === 'longPress'
          ? 'openHarness'
          : DEFAULT_PREFERENCES.longPressAction,
      voiceInputEnabled: parsed.doubleClickAction === 'voice' || parsed.longPressAction === 'voice'
        || (parsed.doubleClickAction === undefined && parsed.longPressAction === undefined && parsed.voiceInputEnabled !== false),
      voiceProvider: 'system',
      voiceLanguage: parsed.voiceLanguage === 'zh-CN' || parsed.voiceLanguage === 'en-US' ? parsed.voiceLanguage : 'system',
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

function savePreferences(): Promise<void> {
  const content = `${JSON.stringify(preferences, null, 2)}\n`
  preferencesSaveQueue = preferencesSaveQueue.catch(() => undefined).then(async () => {
    await mkdir(dirname(preferencesPath), { recursive: true })
    const staging = `${preferencesPath}.partial-${process.pid}-${randomUUID()}`
    await writeFile(staging, content, { mode: 0o600 })
    await rename(staging, preferencesPath)
  })
  return preferencesSaveQueue
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
  const required = companionWindowSize(currentPetSize())
  return { width: Math.max(BASE_WINDOW_WIDTH, required.width), height: Math.max(BASE_WINDOW_HEIGHT, required.height) }
}

function placePetForBubbleSide(side: PetBubbleSide): void {
  if (!petWindow || petWindow.isDestroyed()) return
  const petPosition = currentPetPosition()
  const petSize = currentPetSize()
  const [width = 0, height = 0] = petWindow.getSize()
  const windowSize = { width, height }
  const preferred = preferredPetOffsetForBubble(side, windowSize, petSize)
  const display = screen.getDisplayNearestPoint(petPosition).bounds
  const requestedWindowPosition = clampWindowPosition({
    x: petPosition.x - preferred.x,
    y: petPosition.y - preferred.y,
  }, windowSize, display)
  try {
    petWindow.setPosition(requestedWindowPosition.x, requestedWindowPosition.y)
    const [actualX = requestedWindowPosition.x, actualY = requestedWindowPosition.y] = petWindow.getPosition()
    const actualWindowPosition = { x: actualX, y: actualY }
    const actualOffset = resolvePetOffset(petPosition, actualWindowPosition, windowSize, petSize)
    setPetStageOffset(actualOffset)
    updateWindowDock({ x: actualWindowPosition.x + actualOffset.x, y: actualWindowPosition.y + actualOffset.y }, petSize, true)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.warn(`Could not arrange the desktop pet around its bubble: ${detail.slice(0, 240)}`)
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
    accentColor: preferences.accentColor,
    reducedMotion: preferences.reducedMotion,
    bubbleVisible: preferences.bubbleVisible,
    scale: preferences.scale,
    doubleClickAction: preferences.doubleClickAction,
    longPressAction: preferences.longPressAction,
    voiceInputEnabled: preferences.voiceInputEnabled,
    voiceProvider: preferences.voiceProvider,
    voiceLanguage: preferences.voiceLanguage,
    walkingEnabled: preferences.walkingEnabled,
    mouseChaseEnabled: preferences.mouseChaseEnabled,
    locale: preferences.locale === 'system' ? (app.getLocale().toLowerCase().startsWith('zh') ? 'zh-CN' : 'en') : preferences.locale,
    menuActions: preferences.menuActions,
    menuExtensions,
  }
}

function summonPetToCursor(openChat: boolean, composePaths: readonly string[] = []): void {
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
  const activation = summonWindowActivation(openChat)
  if (activation === 'active') {
    if (process.platform === 'darwin') app.focus({ steal: true })
    petWindow.show()
    petWindow.focus()
    petWindow.webContents.focus()
  } else {
    petWindow.showInactive()
  }
  petWindow.moveTop()
  if (composePaths.length) sendToPet('pet:compose-files', [...composePaths])
  else if (openChat) sendToPet('pet:open-chat')
}

function teleportPetToCursor(): void {
  summonPetToCursor(preferences.teleportOpensRecentChat)
}

function requestFinderComposePaths(paths: readonly string[]): void {
  if (!paths.length) return
  pendingFinderComposePaths = [...paths]
  if (!petWindow || petWindow.isDestroyed() || petWindow.webContents.isLoadingMainFrame()) return
  const pending = pendingFinderComposePaths
  pendingFinderComposePaths = []
  summonPetToCursor(true, pending)
}

function finderComposePathsFromAdditionalData(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((path): path is string => typeof path === 'string' && path.length > 0 && path.length <= 4096 && (path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path)))
    .slice(0, 8)
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
  window.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (webContents !== window.webContents || permission !== 'media' || !requestingOrigin.startsWith('file://')) return false
    const mediaTypes = 'mediaTypes' in details && Array.isArray(details.mediaTypes) ? details.mediaTypes : []
    return mediaTypes.length === 0 || (mediaTypes.includes('audio') && !mediaTypes.includes('video'))
  })
  window.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const mediaTypes = permission === 'media' && 'mediaTypes' in details && Array.isArray(details.mediaTypes) ? details.mediaTypes : []
    callback(webContents === window.webContents && permission === 'media' && mediaTypes.includes('audio') && !mediaTypes.includes('video'))
  })
  applyWindowVisibility(window)
  window.loadFile(join(import.meta.dirname, 'index.html'))
  window.webContents.on('did-finish-load', () => {
    if (!pendingFinderComposePaths.length) return
    const pending = pendingFinderComposePaths
    pendingFinderComposePaths = []
    summonPetToCursor(true, pending)
  })
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

function activatePetForInput(): void {
  if (!petWindow || petWindow.isDestroyed()) return
  if (process.platform === 'darwin') app.focus({ steal: true })
  petWindow.show()
  petWindow.focus()
  petWindow.webContents.focus()
  petWindow.moveTop()
}

function registerIpc(): void {
  ipcMain.handle('pet:get-bootstrap', async () => ({
    snapshot,
    theme: activeTheme,
    reducedMotion: preferences.reducedMotion,
    bubbleVisible: preferences.bubbleVisible,
    scale: preferences.scale,
    doubleClickAction: preferences.doubleClickAction,
    longPressAction: preferences.longPressAction,
    serviceOwned: bridge?.ownsService ?? false,
    petStageOffset,
    windowDock: currentWindowDock ?? 'center',
    preferences: rendererPreferences(),
  }))
  ipcMain.handle('pet:set-bubble-visible', async (_event, visible: boolean) => {
    preferences.bubbleVisible = Boolean(visible)
    await savePreferences()
  })
  ipcMain.handle('pet:set-bubble-side', (_event, side: unknown) => {
    if (side !== 'top' && side !== 'right' && side !== 'bottom' && side !== 'left') return
    placePetForBubbleSide(side)
  })
  ipcMain.handle('pet:record-interaction', () => recordInteraction())
  ipcMain.handle('pet:activate-for-input', () => activatePetForInput())
  ipcMain.handle('pet:chat', async (_event, text: unknown, sessionId?: unknown, images?: unknown) => {
    const candidate: Extract<BridgeClientMessage, { type: 'chat' }> = {
      type: 'chat', requestId: 'ipc-validation', text: typeof text === 'string' ? text : '',
      ...(typeof sessionId === 'string' ? { sessionId } : {}),
      ...(Array.isArray(images) ? { images } : {}),
    } as Extract<BridgeClientMessage, { type: 'chat' }>
    if (!isBridgeClientMessage(candidate)) return { ok: false, error: 'Message or image attachments are invalid.' }
    if (isErrorDemo) {
      publishSnapshot({ state: 'idle', connected: true, facing: snapshot.facing, sequence: snapshot.sequence + 1, time: Date.now(), text: 'Failure demo acknowledged' })
      return { ok: true }
    }
    if (!bridge?.isConnected) return { ok: false, error: 'Harness is not connected.' }
    try {
      await bridge.sendChat(candidate.text.trim(), candidate.sessionId, candidate.images)
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
  ipcMain.handle('pet:transcribe-voice', async (_event, value: unknown, diagnostic: unknown) => {
    if (!preferences.voiceInputEnabled) {
      recordVoiceDiagnostic('rejected reason=disabled')
      return { ok: false, error: 'Voice input is disabled.' }
    }
    if (voiceTranscriptionActive) {
      recordVoiceDiagnostic('rejected reason=already-active')
      return { ok: false, error: 'Speech recognition is already running.' }
    }
    const bytes = value instanceof Uint8Array
      ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      : value instanceof ArrayBuffer ? new Uint8Array(value) : undefined
    if (!bytes || bytes.byteLength < 46 || bytes.byteLength > MAX_VOICE_WAV_BYTES) {
      recordVoiceDiagnostic(`rejected reason=invalid-size bytes=${bytes?.byteLength ?? 0}`)
      return { ok: false, error: 'Voice recording is empty or longer than 60 seconds.' }
    }
    voiceTranscriptionActive = true
    const levels = analyzePcm16Wav(bytes)
    const levelText = levels
      ? ` duration=${levels.durationSeconds.toFixed(2)}s peak=${Number.isFinite(levels.peakDb) ? levels.peakDb.toFixed(1) : '-inf'}dB rms=${Number.isFinite(levels.rmsDb) ? levels.rmsDb.toFixed(1) : '-inf'}dB active=${(levels.activeFrameRatio * 100).toFixed(0)}% longest=${levels.longestActiveSeconds.toFixed(2)}s`
      : ''
    const track = diagnostic && typeof diagnostic === 'object' ? diagnostic as Record<string, unknown> : {}
    const clean = (value: unknown, maximum = 80) => typeof value === 'string'
      ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, maximum)
      : undefined
    const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
    const boolean = (value: unknown) => typeof value === 'boolean' ? value : undefined
    const trackText = [
      clean(track.label) ? `device=${JSON.stringify(clean(track.label))}` : undefined,
      clean(track.readyState, 20) ? `state=${clean(track.readyState, 20)}` : undefined,
      boolean(track.muted) !== undefined ? `muted=${boolean(track.muted)}` : undefined,
      boolean(track.enabled) !== undefined ? `enabled=${boolean(track.enabled)}` : undefined,
      number(track.sampleRate) !== undefined ? `rate=${number(track.sampleRate)}` : undefined,
      number(track.channelCount) !== undefined ? `channels=${number(track.channelCount)}` : undefined,
      boolean(track.autoGainControl) !== undefined ? `agc=${boolean(track.autoGainControl)}` : undefined,
      boolean(track.echoCancellation) !== undefined ? `aec=${boolean(track.echoCancellation)}` : undefined,
      boolean(track.noiseSuppression) !== undefined ? `ns=${boolean(track.noiseSuppression)}` : undefined,
    ].filter(Boolean).join(' ')
    recordVoiceDiagnostic(`started bytes=${bytes.byteLength}${levelText} language=${preferences.voiceLanguage} platform=${process.platform}${trackText ? ` ${trackText}` : ''}`)
    try {
      const text = await new SystemVoiceTranscriber(resourceRoot).transcribe(bytes, preferences.voiceLanguage)
      recordVoiceDiagnostic(`finished outcome=${text ? 'recognized' : 'no-speech'} characters=${text.length}`)
      return text ? { ok: true, text } : { ok: false, code: 'noSpeech' }
    } catch (error) {
      const detail = (error instanceof Error ? error.message : String(error)).replace(/\s+/g, ' ').trim().slice(0, 300)
      recordVoiceDiagnostic(`finished outcome=error detail=${detail}`)
      console.warn(`Voice transcription failed: ${detail}`)
      if (isNoSpeechDetectedError(error)) return { ok: false, code: 'noSpeech', detail }
      return { ok: false, code: 'unavailable', detail }
    } finally {
      voiceTranscriptionActive = false
    }
  })
  ipcMain.handle('pet:voice-notice', async (_event, code: unknown, detail?: unknown) => {
    const chinese = app.getLocale().toLowerCase().startsWith('zh')
    const messages: Record<string, { message: string; detail: string }> = chinese ? {
      microphone: { message: '无法使用麦克风', detail: '请在系统隐私设置中允许 XY DeepSeek Pet 使用麦克风，然后再试一次。' },
      ready: { message: '语音输入已准备好', detail: '请再按住鲸鱼说话，松开后文字会进入回复框，不会自动发送。' },
      unavailable: { message: '系统语音识别暂不可用', detail: '请检查系统语音识别权限与语言包设置，然后再试一次。' },
      session: { message: '还没有可以回复的会话', detail: '请先在 Harness 中开始一个会话，再使用回复、语音或发送文件功能。' },
    } : {
      microphone: { message: 'Microphone unavailable', detail: 'Allow XY DeepSeek Pet to use the microphone in system privacy settings, then try again.' },
      ready: { message: 'Voice input is ready', detail: 'Hold the pet again to dictate. The transcript opens in the reply box and is never sent automatically.' },
      unavailable: { message: 'System speech recognition is unavailable', detail: 'Check speech-recognition permission and language-pack settings, then try again.' },
      session: { message: 'No session to reply to', detail: 'Start a Harness session before replying, dictating, or sending files.' },
    }
    const notice = typeof code === 'string' ? messages[code] : undefined
    if (!notice) return
    const diagnostic = typeof detail === 'string' ? detail.replace(/\s+/g, ' ').trim().slice(0, 300) : ''
    const options = {
      type: 'info' as const,
      title: 'XY DeepSeek Pet',
      message: notice.message,
      detail: diagnostic ? `${notice.detail}\n\n${chinese ? '诊断信息：' : 'Diagnostic: '}${diagnostic}` : notice.detail,
      buttons: [chinese ? '好' : 'OK'],
      noLink: true,
    }
    if (petWindow) await dialog.showMessageBox(petWindow, options)
    else await dialog.showMessageBox(options)
  })
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
  // Keep sub-pixel simulation coordinates independent from Electron's integer
  // window coordinates. Feeding rounded positions back into the simulation can
  // turn repeated edge contacts into apparent sliding along the boundary.
  flingMotion = next
  if (!moved) {
    finishFling()
    return
  }
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

  sendChat(text: string, sessionId?: string, images: PetChatImage[] = []): Promise<void> {
    if (!this.isConnected || !this.socket) return Promise.reject(new Error('Harness is not connected'))
    const requestId = randomUUID()
    const message: BridgeClientMessage = {
      type: 'chat', requestId, text,
      ...(sessionId ? { sessionId } : {}),
      ...(images.length ? { images } : {}),
    }
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

const startupFinderComposePaths = finderComposePathsFromArgs(process.argv)
if (!app.requestSingleInstanceLock({ finderComposePaths: startupFinderComposePaths })) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine, _workingDirectory, additionalData) => {
    void attachBridgeFromArgs(commandLine)
    const paths = finderComposePathsFromAdditionalData(
      additionalData && typeof additionalData === 'object' ? (additionalData as Record<string, unknown>).finderComposePaths : undefined,
    )
    if (paths.length) requestFinderComposePaths(paths)
    else {
      petWindow?.showInactive()
      petWindow?.moveTop()
    }
  })
  app.whenReady().then(async () => {
    preferencesPath = join(homedir(), '.xy-deepseek-pet', 'pet-settings.json')
    await mkdir(dirname(preferencesPath), { recursive: true, mode: 0o700 })
    preferences = await readPreferences()
    menuExtensions = await readMenuExtensions()
    resourceRoot = findRepositoryRoot()
    themeManager = new ThemeManager({ userData: app.getPath('userData'), repositoryRoot: resourceRoot })
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
    requestFinderComposePaths(startupFinderComposePaths)
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
