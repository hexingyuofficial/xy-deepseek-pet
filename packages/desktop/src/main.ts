import { app, BrowserWindow, dialog, ipcMain, screen, shell } from 'electron'
import { randomUUID } from 'node:crypto'
import { statSync, watch, type FSWatcher } from 'node:fs'
import { readFile, mkdir, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import WebSocket from 'ws'
import {
  initialSnapshot,
  isBridgeServerMessage,
  type BridgeClientMessage,
  type BridgeServerMessage,
  type PetSnapshot,
} from '@xy-deepseek-pet/protocol'
import { ThemeManager, type LoadedTheme } from './theme.js'
import { shouldEnterSleep, stateAfterInteraction } from './inactivity-policy.js'
import { draggedWindowPosition, isScreenPoint } from './drag-position.js'

interface Preferences {
  themeId: string
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
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
  scale: 1,
  activationGesture: 'longPress',
  locale: 'system',
  autoLaunch: false,
  menuActions: ['open-client', 'chat', 'settings'],
}
const BASE_WINDOW_WIDTH = 360
const BASE_WINDOW_HEIGHT = 348
const MAX_WIRE_BYTES = 64 * 1024
const MIN_SCALE = 0.4
const MAX_SCALE = 2
const SCALE_STEP = 0.05

let petWindow: BrowserWindow | undefined
let themeManager: ThemeManager
let activeTheme: LoadedTheme
let preferences: Preferences
let preferencesPath: string
let snapshot: PetSnapshot = initialSnapshot()
let bridge: DesktopBridge | undefined
let dragStart: { cursor: { x: number; y: number }; lastCursor: { x: number; y: number }; window: { x: number; y: number } } | undefined
let wanderTimer: NodeJS.Timeout | undefined
let inactivityTimer: NodeJS.Timeout | undefined
let preferencesWatcher: FSWatcher | undefined
let preferencesReloadTimer: NodeJS.Timeout | undefined
let menuExtensions: MenuExtension[] = []
let lastInteractionAt = Date.now()
const isDevelopment = process.argv.includes('--dev')
const isErrorDemo = isDevelopment && process.argv.includes('--demo-error')

// Electron derives its per-user data directory from the app name. Set it before
// the app becomes ready so imports and the Harness settings service share a root.
app.setName('XY DeepSeek Pet')

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

async function savePreferences(): Promise<void> {
  await mkdir(dirname(preferencesPath), { recursive: true })
  const staging = `${preferencesPath}.partial-${process.pid}`
  await writeFile(staging, `${JSON.stringify(preferences, null, 2)}\n`, { mode: 0o600 })
  await rename(staging, preferencesPath)
}

function clampPosition(position: { x: number; y: number }): { x: number; y: number } {
  const { width, height } = windowDimensions()
  const bounds = { x: position.x, y: position.y, width, height }
  const workArea = screen.getDisplayMatching(bounds).workArea
  return {
    x: Math.round(Math.min(Math.max(position.x, workArea.x), workArea.x + workArea.width - width)),
    y: Math.round(Math.min(Math.max(position.y, workArea.y), workArea.y + workArea.height - height)),
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
  preferences.scale = scale
  if (petWindow) {
    const { width, height } = windowDimensions()
    petWindow.setSize(width, height)
    const [x = 0, y = 0] = petWindow.getPosition()
    const position = clampPosition({ x, y })
    petWindow.setPosition(position.x, position.y)
    preferences.position = position
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
    locale: preferences.locale === 'system' ? (app.getLocale().toLowerCase().startsWith('zh') ? 'zh-CN' : 'en') : preferences.locale,
    menuActions: preferences.menuActions,
    menuExtensions,
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
  if (next.themeId !== previous.themeId) {
    try {
      activeTheme = await themeManager.load(next.themeId)
      preferences.themeId = activeTheme.manifest.id
      sendToPet('pet:theme', activeTheme)
    } catch {
      preferences.themeId = previous.themeId
    }
  }
  if (next.scale !== previous.scale && petWindow) {
    const { width, height } = windowDimensions()
    petWindow.setSize(width, height)
    const [x = 0, y = 0] = petWindow.getPosition()
    const position = clampPosition({ x, y })
    petWindow.setPosition(position.x, position.y)
    preferences.position = position
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
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  window.loadFile(join(import.meta.dirname, 'index.html'))
  window.once('ready-to-show', () => window.showInactive())
  return window
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
  ipcMain.handle('pet:acknowledge', (_event, sessionId: unknown) => {
    if (typeof sessionId !== 'string') return
    if (isErrorDemo && sessionId === snapshot.sessionId) {
      publishSnapshot({ state: 'idle', connected: true, facing: snapshot.facing, sequence: snapshot.sequence + 1, time: Date.now() })
      return
    }
    bridge?.acknowledge(sessionId)
  })
  ipcMain.handle('pet:open-client', (_event, sessionId?: unknown) => {
    bridge?.openClient(typeof sessionId === 'string' ? sessionId : undefined)
  })
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
  ipcMain.handle('pet:quit', () => app.quit())
  ipcMain.handle('pet:stop-service', () => confirmStopOwnedService())
  ipcMain.on('pet:drag-begin', (_event, point: unknown) => {
    if (!petWindow || !isScreenPoint(point)) return
    const [x = 0, y = 0] = petWindow.getPosition()
    dragStart = { cursor: point, lastCursor: point, window: { x, y } }
  })
  ipcMain.on('pet:drag-move', (_event, point: unknown) => {
    if (!petWindow || !dragStart || !isScreenPoint(point)) return
    const horizontalMovement = point.x - dragStart.lastCursor.x
    dragStart.lastCursor = point
    const facing = horizontalMovement < -1 ? 'left' : horizontalMovement > 1 ? 'right' : snapshot.facing
    if (facing !== snapshot.facing) {
      publishSnapshot({ ...snapshot, facing, sequence: snapshot.sequence + 1, time: Date.now() })
    }
    const position = draggedWindowPosition(dragStart.cursor, dragStart.window, point)
    petWindow.setPosition(position.x, position.y, false)
  })
  ipcMain.on('pet:drag-end', () => {
    if (!petWindow || !dragStart) return
    dragStart = undefined
    const [x = 0, y = 0] = petWindow.getPosition()
    preferences.position = clampPosition({ x, y })
    petWindow.setPosition(preferences.position.x, preferences.position.y)
    void savePreferences()
  })
}

function startWandering(): void {
  wanderTimer = setInterval(() => {
    if (!petWindow || !preferences.walkingEnabled || preferences.reducedMotion || dragStart || snapshot.state !== 'idle') return
    const [x = 0, y = 0] = petWindow.getPosition()
    const direction = Math.random() > 0.5 ? 1 : -1
    const target = clampPosition({ x: x + direction * (24 + Math.round(Math.random() * 36)), y })
    publishSnapshot({
      ...snapshot,
      state: 'walk',
      facing: direction < 0 ? 'left' : 'right',
      sequence: snapshot.sequence + 1,
      time: Date.now(),
    })
    petWindow.setPosition(target.x, target.y, true)
    preferences.position = target
    setTimeout(() => {
      if (snapshot.state === 'walk') publishSnapshot({ ...snapshot, state: 'idle', sequence: snapshot.sequence + 1, time: Date.now() })
    }, 1500)
    void savePreferences()
  }, 12_000)
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

  acknowledge(sessionId: string): void {
    if (!this.isConnected || !this.socket) return
    const message: BridgeClientMessage = { type: 'acknowledge', sessionId }
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
    if (message.type === 'theme-import') void this.importTheme(message)
  }

  private resolveChat(message: Extract<BridgeServerMessage, { type: 'chat-result' }>): void {
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

function bridgeFileFromArgs(args: readonly string[]): string | undefined {
  const prefix = '--bridge-file='
  return args.find((argument) => argument.startsWith(prefix))?.slice(prefix.length)
}

async function readBridgeStartup(args: readonly string[] = process.argv, allowStdin = true): Promise<BridgeStartup | undefined> {
  const port = Number(process.env.HARNESS_PET_BRIDGE_PORT)
  const token = process.env.HARNESS_PET_BRIDGE_TOKEN
  if (Number.isInteger(port) && port > 0 && port < 65536 && token) return { port, token }
  const bridgeFile = bridgeFileFromArgs(args) ?? process.env.XY_DEEPSEEK_PET_BRIDGE_FILE
  if (bridgeFile) {
    try {
      const parsed = JSON.parse(await readFile(bridgeFile, 'utf8')) as BridgeStartup
      if (Number.isInteger(parsed.port) && parsed.port > 0 && parsed.port < 65536 && typeof parsed.token === 'string') return parsed
    } catch {
      // Fall through to stdin/offline preview.
    }
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
    startWandering()
    startInactivityTimer()
    watchPreferences()

    if (!isErrorDemo) await attachBridgeFromArgs(process.argv, true)
  })
}

app.on('before-quit', () => {
  bridge?.stop()
  if (wanderTimer) clearInterval(wanderTimer)
  if (inactivityTimer) clearInterval(inactivityTimer)
  if (preferencesReloadTimer) clearTimeout(preferencesReloadTimer)
  preferencesWatcher?.close()
})

app.on('window-all-closed', () => app.quit())
