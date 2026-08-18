import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-commands'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { WebSocket, WebSocketServer } from 'ws'
import {
  initialSnapshot,
  isBridgeClientMessage,
  boundedStatusText,
  reducePetEvent,
  type BridgeClientMessage,
  type BridgeServerMessage,
  type HarnessPetEvent,
  type PetSessionSummary,
  type PetSnapshot,
} from '@xy-deepseek-pet/protocol'
import { PetSettingsGateway } from './gateway.js'
import { PetMenuRegistry } from './menu-registry.js'
import { PetSettingsController, repositoryRootFromDesktopEntry } from './settings.js'
import { registerPetAgentCapabilities } from './agent-capabilities.js'
import { createDesktopLauncher, type LauncherIconId } from './desktop-launcher.js'

export const name = 'xy-deepseek-pet'
export const inject = ['agents', 'commands', 'systemPrompt', 'tools']

const MAX_WIRE_BYTES = 64 * 1024
const REACTION_MS = 2_800

export interface Config {
  autoLaunch?: boolean
  desktopCommand?: string
  desktopEntry?: string
  clientUrl?: string
  rendezvousPath?: string
}

interface DesktopLaunch {
  command: string
  args: string[]
  resourceRoot?: string
}

const require = createRequire(import.meta.url)

function installedDesktop(): DesktopLaunch | undefined {
  try {
    const packageRoot = dirname(require.resolve('@xy-deepseek-pet/desktop/package.json'))
    const cli = join(packageRoot, 'bin', 'cli.mjs')
    const resourceRoot = join(packageRoot, 'dist', 'resources')
    if (!existsSync(cli) || !existsSync(join(resourceRoot, 'schemas', 'theme.schema.json'))) return undefined
    return { command: process.execPath, args: [cli], resourceRoot }
  } catch {
    return undefined
  }
}

function authMatches(actual: string, expected: string): boolean {
  const actualHash = createHash('sha256').update(actual).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(actualHash, expectedHash)
}

function processAlive(pid: unknown): boolean {
  if (!Number.isInteger(pid) || (pid as number) <= 0) return false
  try {
    process.kill(pid as number, 0)
    return true
  } catch {
    return false
  }
}

function visibleAssistantText(event: SessionEvent): string | undefined {
  if (event.type !== 'assistant/message') return undefined
  const text = event.data.message.content
    .filter((block): block is Extract<(typeof event.data.message.content)[number], { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join(' ')
    .trim()
  return boundedStatusText(text)
}

function visibleAssistantChunk(event: SessionEvent): string | undefined {
  if (event.type !== 'assistant/chunk' || event.data.chunk.type !== 'text-delta') return undefined
  return event.data.chunk.text
}

function safeToolName(value: unknown): string {
  if (typeof value !== 'string') return 'tool'
  return boundedStatusText(value)?.slice(0, 80) || 'tool'
}

function toolResultCallId(event: SessionEvent): string | undefined {
  if (event.type !== 'tool/result') return undefined
  return String(event.data.message.content[0].toolCallId)
}

type ApprovalAuditEvent =
  | { type: 'approval/asked'; time: number; data: { id: string; toolName: string } }
  | { type: 'approval/decided'; time: number; data: { id: string } }

function approvalAuditEvent(event: SessionEvent): ApprovalAuditEvent | undefined {
  const candidate = event as unknown as { type?: unknown; time?: unknown; data?: Record<string, unknown> }
  if (typeof candidate.time !== 'number' || !candidate.data) return undefined
  if (candidate.type === 'approval/asked' && typeof candidate.data.id === 'string') {
    return {
      type: 'approval/asked',
      time: candidate.time,
      data: { id: candidate.data.id, toolName: safeToolName(candidate.data.toolName) },
    }
  }
  if (candidate.type === 'approval/decided' && typeof candidate.data.id === 'string') {
    return { type: 'approval/decided', time: candidate.time, data: { id: candidate.data.id } }
  }
  return undefined
}

function visibleSessionTitle(event: SessionEvent): string | undefined {
  const candidate = event as unknown as { type?: unknown; data?: { title?: unknown } }
  if (candidate.type !== 'session/title' || typeof candidate.data?.title !== 'string') return undefined
  const title = candidate.data.title.replace(/\s+/g, ' ').trim()
  return title ? title.slice(0, 120) : undefined
}

function desktopLaunch(config: Config): DesktopLaunch | undefined {
  const configuredCommand = config.desktopCommand ?? process.env.XY_DEEPSEEK_PET_DESKTOP_COMMAND
  const configuredEntry = config.desktopEntry ?? process.env.XY_DEEPSEEK_PET_DESKTOP_ENTRY
  if (configuredCommand) return { command: configuredCommand, args: configuredEntry ? [configuredEntry] : [] }

  const installed = installedDesktop()
  if (installed) return installed

  if (process.platform !== 'darwin') return undefined
  const repositoryRoot = resolve(import.meta.dirname, '../../..')
  const command = resolve(repositoryRoot, 'packages/desktop/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
  const entry = resolve(repositoryRoot, 'packages/desktop/dist/main.js')
  return existsSync(command) && existsSync(entry) ? { command, args: [entry] } : undefined
}

function desktopResourceRoot(config: Config): string | undefined {
  return repositoryRootFromDesktopEntry(config.desktopEntry ?? process.env.XY_DEEPSEEK_PET_DESKTOP_ENTRY)
    ?? installedDesktop()?.resourceRoot
}

export class HarnessPetRuntime {
  private readonly logger
  private readonly token = randomBytes(32).toString('hex')
  private readonly authenticated = new WeakSet<WebSocket>()
  private readonly touched = new Map<string, number>()
  private server: WebSocketServer | undefined
  private desktop: ChildProcess | undefined
  private selected: Agent | undefined
  private snapshot: PetSnapshot = initialSnapshot()
  private readonly sessions = new Map<string, PetSessionSummary>()
  private readonly lastAssistantText = new Map<string, string>()
  private readonly activeToolCalls = new Map<string, Map<string, string>>()
  private readonly pendingQuestionCalls = new Map<string, Set<string>>()
  private readonly pendingApprovals = new Map<string, Map<string, string>>()
  private sequence = 0
  private reactionTimer: NodeJS.Timeout | undefined
  private stopped = false
  private lastClientOpen: { target: string; at: number } | undefined
  private readonly pendingThemeImports = new Map<string, {
    resolve: (themeId: string) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>()

  constructor(
    private readonly ctx: Context,
    private readonly config: Config = {},
    private readonly settings?: PetSettingsController,
  ) {
    this.logger = ctx.logger('xy-deepseek-pet')
  }

  async start(): Promise<void> {
    if (this.server || this.stopped) return
    this.selectLatest()
    this.server = new WebSocketServer({ host: '127.0.0.1', port: 0, maxPayload: MAX_WIRE_BYTES })
    this.server.on('connection', (socket) => this.accept(socket))
    await new Promise<void>((resolveReady, reject) => {
      this.server?.once('listening', resolveReady)
      this.server?.once('error', reject)
    })
    this.snapshot = reducePetEvent(this.snapshot, { type: 'bridge/connected' })
    await this.writeRendezvous()
    if (this.config.autoLaunch === true || this.settings?.config.autoLaunch === true) this.openDesktop()
    this.logger.info('local desktop bridge ready')
  }

  async stop(): Promise<void> {
    this.stopped = true
    if (this.reactionTimer) clearTimeout(this.reactionTimer)
    for (const pending of this.pendingThemeImports.values()) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('Pet runtime stopped'))
    }
    this.pendingThemeImports.clear()
    this.desktop?.kill()
    this.desktop = undefined
    const server = this.server
    this.server = undefined
    const closeServer = server
      ? new Promise<void>((resolveClosed) => {
          for (const client of server.clients) client.close(1001, 'Plugin unloaded')
          server.close(() => resolveClosed())
        })
      : Promise.resolve()
    await Promise.all([closeServer, this.removeRendezvous()])
  }

  openDesktop(): boolean {
    if (!this.server) return false
    if (this.authenticatedDesktop()) return true
    if (this.desktop && this.desktop.exitCode === null && !this.desktop.killed) return true
    const launch = desktopLaunch(this.config)
    if (!launch) {
      this.logger.warn('desktop executable is not installed for this platform')
      return false
    }
    const address = this.server.address()
    if (!address || typeof address === 'string') return false
    const child = spawn(launch.command, launch.args, {
      stdio: ['pipe', 'ignore', 'ignore'],
      env: { ...process.env, XY_DEEPSEEK_PET_CHILD: '1' },
    })
    child.stdin?.end(`${JSON.stringify({ port: address.port, token: this.token })}\n`)
    child.once('exit', () => {
      if (this.desktop === child) this.desktop = undefined
    })
    child.once('error', (error) => this.logger.warn(`desktop launch failed: ${String(error)}`))
    this.desktop = child
    return true
  }

  desktopStatus(): boolean {
    return Boolean(this.authenticatedDesktop()) || Boolean(this.desktop && this.desktop.exitCode === null && !this.desktop.killed)
  }

  closeDesktop(): boolean {
    const socket = this.authenticatedDesktop()
    if (socket) {
      this.send(socket, { type: 'quit' })
      return true
    }
    if (this.desktop && this.desktop.exitCode === null && !this.desktop.killed) {
      return this.desktop.kill()
    }
    return false
  }

  async importTheme(fileName: string, dataBase64: string): Promise<string> {
    if (extname(fileName).toLowerCase() !== '.zip' || dataBase64.length > 28_000_000) {
      throw new Error('Pet package must be a ZIP no larger than 20 MiB')
    }
    const bytes = Buffer.from(dataBase64, 'base64')
    if (bytes.length < 4 || bytes.length > 20 * 1024 * 1024 || bytes.subarray(0, 2).toString('hex') !== '504b') {
      throw new Error('The selected file is not a valid ZIP package')
    }
    if (!this.authenticatedDesktop()) {
      this.openDesktop()
      await this.waitForDesktop(5_000)
    }
    const socket = this.authenticatedDesktop()
    if (!socket) throw new Error('Open the desktop pet before importing a pet package')
    const requestId = randomUUID()
    const directory = resolve(homedir(), '.xy-deepseek-pet', 'imports')
    const archivePath = resolve(directory, `${requestId}.zip`)
    await mkdir(directory, { recursive: true, mode: 0o700 })
    await writeFile(archivePath, bytes, { mode: 0o600 })
    return new Promise<string>((resolveTheme, reject) => {
      const timeout = setTimeout(() => {
        this.pendingThemeImports.delete(requestId)
        void rm(archivePath, { force: true })
        reject(new Error('Desktop pet did not finish importing the package'))
      }, 20_000)
      this.pendingThemeImports.set(requestId, {
        resolve: (themeId) => { void rm(archivePath, { force: true }); resolveTheme(themeId) },
        reject: (error) => { void rm(archivePath, { force: true }); reject(error) },
        timeout,
      })
      this.send(socket, { type: 'theme-import', requestId, path: archivePath })
    })
  }

  createLauncher(name: string, iconId: LauncherIconId, fileName: string, dataBase64: string): { displayName: string; platform: 'macOS' | 'Windows' } {
    const packageRoot = resolve(import.meta.dirname, '..')
    return createDesktopLauncher({ packageRoot, name, iconId, fileName, dataBase64 })
  }

  async importThemeArchive(path: string, signal?: AbortSignal): Promise<string> {
    const archivePath = resolve(path)
    if (extname(archivePath).toLowerCase() !== '.zip') throw new Error('Pet theme must be a ZIP file')
    const metadata = await lstat(archivePath)
    if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size <= 0 || metadata.size > 20 * 1024 * 1024) {
      throw new Error('Pet theme must be a regular ZIP file no larger than 20 MiB')
    }
    const bytes = await readFile(archivePath, { signal })
    return this.importTheme(basename(archivePath), bytes.toString('base64'))
  }

  onAgentCreated(agent: Agent): void {
    this.touch(agent)
    this.selectLatest()
  }

  onAgentDisposed(agent: Agent): void {
    this.touched.delete(String(agent.id))
    this.sessions.delete(String(agent.id))
    this.lastAssistantText.delete(String(agent.id))
    this.activeToolCalls.delete(String(agent.id))
    this.pendingQuestionCalls.delete(String(agent.id))
    this.pendingApprovals.delete(String(agent.id))
    if (this.selected === agent) this.selectLatest()
    this.publishAggregate()
  }

  onAgentStatus(agent: Agent, status: 'idle' | 'running'): void {
    if (!this.isRoot(agent)) return
    this.touch(agent)
    this.selected = agent
    if (status === 'running') {
      this.cancelReaction()
      this.lastAssistantText.delete(String(agent.id))
      this.updateSession(String(agent.id), { state: 'thinking', unread: false, text: 'Thinking' })
      this.publish({ type: 'agent/running', sessionId: String(agent.id) })
      return
    }
    const summary = this.sessions.get(String(agent.id))
    if (summary?.state === 'complete' || summary?.state === 'error' || summary?.state === 'needsInput') return
    this.updateSession(String(agent.id), { state: 'idle', unread: false, text: undefined })
    this.publishAggregate()
  }

  onSessionEvent(session: Session, event: SessionEvent): void {
    const agent = this.ctx.agents.get(session.id)
    if (!agent || !this.isRoot(agent)) return
    this.touch(agent)
    this.selected = agent
    const sessionId = String(session.id)
    const title = visibleSessionTitle(event)
    if (title) {
      this.updateSession(sessionId, { title, updatedAt: event.time })
      this.publishAggregate()
      return
    }
    const approval = approvalAuditEvent(event)
    if (approval?.type === 'approval/asked') {
      const approvals = this.pendingApprovals.get(sessionId) ?? new Map<string, string>()
      approvals.set(approval.data.id, approval.data.toolName)
      this.pendingApprovals.set(sessionId, approvals)
      this.publishAttentionState(sessionId, approval.time)
      return
    }
    if (approval?.type === 'approval/decided') {
      this.pendingApprovals.get(sessionId)?.delete(approval.data.id)
      this.publishCurrentActivity(sessionId, approval.time)
      return
    }
    switch (event.type) {
      case 'turn/start':
        this.cancelReaction()
        this.lastAssistantText.delete(sessionId)
        this.activeToolCalls.delete(sessionId)
        this.pendingQuestionCalls.delete(sessionId)
        this.pendingApprovals.delete(sessionId)
        this.updateSession(sessionId, { state: 'thinking', unread: false, text: 'Thinking' })
        this.publish({ type: 'agent/running', sessionId, time: event.time })
        break
      case 'tool/call':
        {
          const callId = String(event.data.callId)
          const toolName = safeToolName(event.data.name)
          if (toolName === 'ask_user_question' || toolName === 'request_user_input') {
            const questions = this.pendingQuestionCalls.get(sessionId) ?? new Set<string>()
            questions.add(callId)
            this.pendingQuestionCalls.set(sessionId, questions)
            this.publishAttentionState(sessionId, event.time)
            break
          }
          const tools = this.activeToolCalls.get(sessionId) ?? new Map<string, string>()
          tools.set(callId, toolName)
          this.activeToolCalls.set(sessionId, tools)
          const text = boundedStatusText(`Using ${toolName}`) ?? 'Working'
          this.updateSession(sessionId, { state: 'working', text })
          this.publish({ type: 'step/working', sessionId, text, time: event.time })
        }
        break
      case 'tool/result': {
        const callId = toolResultCallId(event)
        if (callId) {
          this.activeToolCalls.get(sessionId)?.delete(callId)
          this.pendingQuestionCalls.get(sessionId)?.delete(callId)
        }
        this.publishCurrentActivity(sessionId, event.time)
        break
      }
      case 'assistant/chunk': {
        const delta = visibleAssistantChunk(event)
        if (!delta) break
        const text = boundedStatusText(`${this.lastAssistantText.get(sessionId) ?? ''}${delta}`)
        if (!text) break
        this.lastAssistantText.set(sessionId, text)
        this.updateSession(sessionId, { text })
        this.publish({ type: 'assistant/text', sessionId, text, time: event.time })
        break
      }
      case 'assistant/message': {
        const text = visibleAssistantText(event)
        if (text) {
          this.lastAssistantText.set(sessionId, text)
          this.updateSession(sessionId, { text })
          this.publish({ type: 'assistant/text', sessionId, text, time: event.time })
        }
        break
      }
      case 'turn/end':
        this.activeToolCalls.delete(sessionId)
        this.pendingQuestionCalls.delete(sessionId)
        this.pendingApprovals.delete(sessionId)
        if (event.data.reason.kind === 'completed') {
          const text = this.lastAssistantText.get(sessionId) ?? 'Done'
          this.updateSession(sessionId, { state: 'complete', unread: true, text })
          this.publish({ type: 'turn/complete', sessionId, text, time: event.time })
          this.scheduleIdle(agent)
        } else if (event.data.reason.kind === 'blocked') {
          this.updateSession(sessionId, { state: 'needsInput', unread: true, text: 'Needs your input' })
          this.publish({ type: 'agent/needs-input', sessionId, text: 'Needs your input', time: event.time })
        } else if (event.data.reason.kind === 'error') {
          this.updateSession(sessionId, { state: 'error', unread: true, text: 'Something went wrong' })
          this.publish({ type: 'agent/error', sessionId, text: 'Something went wrong', time: event.time })
        } else {
          this.updateSession(sessionId, { state: 'idle', unread: false, text: undefined })
          this.publishAggregate()
        }
        break
    }
  }

  private publishAttentionState(sessionId: string, time: number): void {
    const approval = [...(this.pendingApprovals.get(sessionId)?.values() ?? [])].at(-1)
    const text = approval ? `Approval required: ${approval}` : 'Waiting for your answer'
    this.updateSession(sessionId, { state: 'needsInput', unread: true, text })
    this.publish({ type: 'agent/needs-input', sessionId, text, time })
  }

  private publishCurrentActivity(sessionId: string, time: number): void {
    const hasQuestions = Boolean(this.pendingQuestionCalls.get(sessionId)?.size)
    const hasApprovals = Boolean(this.pendingApprovals.get(sessionId)?.size)
    if (hasQuestions || hasApprovals) return this.publishAttentionState(sessionId, time)
    const activeTool = [...(this.activeToolCalls.get(sessionId)?.values() ?? [])].at(-1)
    if (activeTool) {
      const text = boundedStatusText(`Using ${activeTool}`) ?? 'Working'
      this.updateSession(sessionId, { state: 'working', unread: false, text })
      this.publish({ type: 'step/working', sessionId, text, time })
      return
    }
    this.updateSession(sessionId, { state: 'thinking', unread: false, text: 'Thinking' })
    this.publish({ type: 'agent/running', sessionId, time })
  }

  onAgentError(agent: Agent): void {
    if (agent !== this.selected && !this.isRoot(agent)) return
    this.selected = agent
    this.updateSession(String(agent.id), { state: 'error', unread: true, text: 'Something went wrong' })
    this.publish({ type: 'agent/error', sessionId: String(agent.id), text: 'Something went wrong' })
  }

  private accept(socket: WebSocket): void {
    const authTimer = setTimeout(() => socket.close(1008, 'Authentication required'), 2_000)
    socket.on('message', (data) => {
      const byteLength = Array.isArray(data) ? data.reduce((total, part) => total + part.byteLength, 0) : data.byteLength
      if (byteLength > MAX_WIRE_BYTES) return socket.close(1009, 'Message too large')
      let value: unknown
      try {
        value = JSON.parse(data.toString())
      } catch {
        return socket.close(1003, 'Invalid JSON')
      }
      if (!isBridgeClientMessage(value)) return socket.close(1008, 'Invalid message')
      if (!this.authenticated.has(socket)) {
        if (value.type !== 'auth' || !authMatches(value.token, this.token)) return socket.close(1008, 'Authentication failed')
        clearTimeout(authTimer)
        this.authenticated.add(socket)
        this.send(socket, { type: 'snapshot', snapshot: this.snapshot })
        return
      }
      if (value.type === 'chat') this.submitChat(socket, value.requestId, value.text, value.sessionId)
      if (value.type === 'focus') this.openDesktop()
      if (value.type === 'acknowledge') this.acknowledge(value.sessionId)
      if (value.type === 'open-client') this.openClient(value.sessionId)
      if (value.type === 'shutdown-service') this.shutdownOwnedService()
      if (value.type === 'theme-import-result') this.resolveThemeImport(value)
    })
    socket.once('close', () => clearTimeout(authTimer))
  }

  private submitChat(socket: WebSocket, requestId: string, text: string, sessionId?: string): void {
    const agent = sessionId
      ? this.ctx.agents.roots().find((candidate) => String(candidate.id) === sessionId)
      : this.selectLatest()
    if (agent && !this.isRoot(agent)) {
      return this.send(socket, { type: 'chat-result', requestId, ok: false, error: 'The selected session is not eligible.' })
    }
    if (!agent) return this.send(socket, { type: 'chat-result', requestId, ok: false, error: 'No active Harness session.' })
    try {
      agent.followup(createUserMessage({
        content: [{ type: 'text', text: text.trim() }],
        source: { kind: 'user' },
      }))
      this.touch(agent)
      this.acknowledge(String(agent.id))
      this.send(socket, { type: 'chat-result', requestId, ok: true })
    } catch {
      this.send(socket, { type: 'chat-result', requestId, ok: false, error: 'Harness rejected the message.' })
    }
  }

  private publish(event: HarnessPetEvent): void {
    this.snapshot = { ...reducePetEvent(this.snapshot, event), sessions: this.sortedSessions() }
    this.broadcast()
  }

  private publishAggregate(): void {
    const summaries = this.sortedSessions()
    const active = summaries.find((entry) => entry.state === 'needsInput') ??
      summaries.find((entry) => entry.state === 'error' && entry.unread) ??
      summaries.find((entry) => entry.state === 'working') ??
      summaries.find((entry) => entry.state === 'thinking')
    const nextState = active?.state ?? 'idle'
    const { sessionId: _sessionId, text: _text, ...snapshotBase } = this.snapshot
    const activeFields = active
      ? { sessionId: active.id, ...(active.text ? { text: active.text } : {}) }
      : {}
    this.snapshot = {
      ...snapshotBase,
      state: nextState,
      connected: true,
      sequence: this.snapshot.sequence + 1,
      time: Date.now(),
      sessions: summaries,
      ...activeFields,
    }
    this.broadcast()
  }

  private broadcast(): void {
    const message: BridgeServerMessage = { type: 'snapshot', snapshot: this.snapshot }
    for (const client of this.server?.clients ?? []) {
      if (client.readyState === WebSocket.OPEN && this.authenticated.has(client)) this.send(client, message)
    }
  }

  private updateSession(id: string, patch: Partial<Omit<PetSessionSummary, 'id'>>): void {
    const previous = this.sessions.get(id)
    this.sessions.set(id, {
      id,
      title: patch.title ?? previous?.title ?? '',
      state: patch.state ?? previous?.state ?? 'idle',
      unread: patch.unread ?? previous?.unread ?? false,
      updatedAt: patch.updatedAt ?? Date.now(),
      ...(patch.text !== undefined ? { text: patch.text } : previous?.text ? { text: previous.text } : {}),
    })
    if (patch.text === undefined && Object.prototype.hasOwnProperty.call(patch, 'text')) {
      const current = this.sessions.get(id)!
      delete current.text
    }
  }

  private sortedSessions(): PetSessionSummary[] {
    const priority: Record<PetSnapshot['state'], number> = {
      needsInput: 6,
      error: 5,
      complete: 4,
      working: 3,
      thinking: 2,
      walk: 1,
      idle: 0,
      sleep: 0,
      offline: 0,
    }
    return [...this.sessions.values()]
      .filter((entry) => entry.state !== 'idle' || entry.unread)
      .sort((a, b) => priority[b.state] - priority[a.state] || b.updatedAt - a.updatedAt)
      .slice(0, 64)
  }

  private acknowledge(sessionId: string): void {
    const summary = this.sessions.get(sessionId)
    if (!summary) return
    this.updateSession(sessionId, {
      unread: false,
      ...(summary.state === 'complete' || summary.state === 'error'
        ? { state: 'idle' as const, text: undefined }
        : {}),
    })
    this.publishAggregate()
  }

  openClient(sessionId?: string): void {
    if (sessionId) this.acknowledge(sessionId)
    const now = Date.now()
    const target = sessionId ?? ''
    if (this.lastClientOpen?.target === target && now - this.lastClientOpen.at < 5_000) return
    this.lastClientOpen = { target, at: now }
    const url = this.config.clientUrl ?? process.env.XY_DEEPSEEK_PET_CLIENT_URL ?? 'http://127.0.0.1:3080'
    const launch = process.platform === 'darwin'
      ? { command: 'open', args: [url] }
      : process.platform === 'win32'
        ? { command: 'cmd.exe', args: ['/d', '/s', '/c', 'start', '', url] }
        : { command: 'xdg-open', args: [url] }
    const child = spawn(launch.command, launch.args, { stdio: 'ignore', windowsHide: true })
    child.unref()
  }

  private shutdownOwnedService(): void {
    if (process.env.XY_DEEPSEEK_PET_SERVICE_OWNER !== 'launcher') {
      this.logger.warn('ignored service shutdown request for an externally owned process')
      return
    }
    this.logger.info('launcher-owned Harness service is stopping')
    setTimeout(() => process.kill(process.pid, 'SIGTERM'), 50).unref()
  }

  private send(socket: WebSocket, message: BridgeServerMessage): void {
    socket.send(JSON.stringify(message))
  }

  private authenticatedDesktop(): WebSocket | undefined {
    return [...(this.server?.clients ?? [])].find((socket) => socket.readyState === WebSocket.OPEN && this.authenticated.has(socket))
  }

  private waitForDesktop(timeoutMs: number): Promise<void> {
    if (this.authenticatedDesktop()) return Promise.resolve()
    return new Promise((resolveWait, reject) => {
      const startedAt = Date.now()
      const interval = setInterval(() => {
        if (this.authenticatedDesktop()) {
          clearInterval(interval)
          resolveWait()
        } else if (Date.now() - startedAt >= timeoutMs) {
          clearInterval(interval)
          reject(new Error('Desktop pet could not be opened'))
        }
      }, 100)
    })
  }

  private resolveThemeImport(message: Extract<BridgeClientMessage, { type: 'theme-import-result' }>): void {
    const pending = this.pendingThemeImports.get(message.requestId)
    if (!pending) return
    clearTimeout(pending.timeout)
    this.pendingThemeImports.delete(message.requestId)
    if (message.ok) pending.resolve(message.themeId)
    else pending.reject(new Error(message.error))
  }

  private scheduleIdle(agent: Agent): void {
    this.cancelReaction()
    this.reactionTimer = setTimeout(() => {
      if (!this.stopped && this.selected === agent && agent.status === 'idle') {
        this.publishAggregate()
      }
    }, REACTION_MS)
  }

  private cancelReaction(): void {
    if (this.reactionTimer) clearTimeout(this.reactionTimer)
    this.reactionTimer = undefined
  }

  private touch(agent: Agent): void {
    this.touched.set(String(agent.id), ++this.sequence)
  }

  private isRoot(agent: Agent): boolean {
    return this.ctx.agents.roots().includes(agent)
  }

  private selectLatest(): Agent | undefined {
    const roots = this.ctx.agents.roots()
    roots.sort((a, b) => (this.touched.get(String(a.id)) ?? 0) - (this.touched.get(String(b.id)) ?? 0))
    this.selected = roots.at(-1)
    return this.selected
  }

  private rendezvousPath(): string {
    return this.config.rendezvousPath ?? resolve(homedir(), '.xy-deepseek-pet', 'bridge.json')
  }

  private async writeRendezvous(): Promise<void> {
    const address = this.server?.address()
    if (!address || typeof address === 'string') return
    const path = this.rendezvousPath()
    await mkdir(dirname(path), { recursive: true, mode: 0o700 })
    try {
      const existing = JSON.parse(await readFile(path, 'utf8')) as { pid?: unknown; token?: unknown }
      const ownedByThisRuntime = existing.pid === process.pid && existing.token === this.token
      if (!ownedByThisRuntime && processAlive(existing.pid)) {
        this.logger.warn('kept rendezvous descriptor owned by another live Harness process')
        return
      }
    } catch { /* Missing, stale, and malformed descriptors may be replaced. */ }
    await writeFile(path, `${JSON.stringify({
      version: 1,
      pid: process.pid,
      port: address.port,
      token: this.token,
      serviceOwned: process.env.XY_DEEPSEEK_PET_SERVICE_OWNER === 'launcher',
      clientUrl: this.config.clientUrl ?? 'http://127.0.0.1:3080',
    })}\n`, { mode: 0o600 })
  }

  private async removeRendezvous(): Promise<void> {
    const path = this.rendezvousPath()
    try {
      const existing = JSON.parse(await readFile(path, 'utf8')) as { pid?: unknown; token?: unknown }
      if (existing.pid !== process.pid || existing.token !== this.token) return
      await rm(path, { force: true })
    } catch { /* Missing and malformed descriptors require no cleanup. */ }
  }
}

export async function apply(ctx: Context, config: Config = {}): Promise<void> {
  const menuRegistry = new PetMenuRegistry(ctx)
  const settings = new PetSettingsController(desktopResourceRoot(config), menuRegistry)
  await settings.initialize()
  const runtime = new HarnessPetRuntime(ctx, config, settings)
  registerPetAgentCapabilities(ctx, runtime, settings)
  new PetSettingsGateway(ctx, settings, runtime)
  ctx.on('agent/created', ({ agent }) => runtime.onAgentCreated(agent))
  ctx.on('agent/disposed', ({ agent }) => runtime.onAgentDisposed(agent))
  ctx.on('agent/status', ({ agent, status }) => runtime.onAgentStatus(agent, status))
  ctx.on('session/event', (session, event) => runtime.onSessionEvent(session, event))
  ctx.on('agent/error', ({ agent }) => runtime.onAgentError(agent))
  ctx.effect(
    () =>
      ctx.commands.register({
        name: 'pet',
        description: 'Open or focus XY DeepSeek Pet',
        recordInput: false,
        handler: () =>
          runtime.openDesktop()
            ? { kind: 'success', text: 'XY DeepSeek Pet is open.' }
            : { kind: 'error', text: 'The desktop companion is not installed for this platform.' },
      }),
    'xy-deepseek-pet command',
  )
  ctx.effect(() => {
    void runtime.start().catch((error) => ctx.logger('xy-deepseek-pet').error(`startup failed: ${String(error)}`))
    return () => runtime.stop()
  }, 'xy-deepseek-pet runtime')
}

export { PetMenuRegistry, type PetMenuContribution } from './menu-registry.js'
