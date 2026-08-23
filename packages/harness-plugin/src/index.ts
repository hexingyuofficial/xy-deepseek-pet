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
  petSettingsUrl,
  boundedStatusText,
  reducePetEvent,
  stripThinkBlocks,
  type BridgeClientMessage,
  type BridgeServerMessage,
  type HarnessPetEvent,
  type PetActivityKind,
  type PetChatImage,
  type PetQuestionAnswer,
  type PetQuestionItem,
  type PetSessionActivity,
  type PetSessionSummary,
  type PetSnapshot,
} from '@xy-deepseek-pet/protocol'
import { PetSettingsGateway } from './gateway.js'
import { PetMenuRegistry } from './menu-registry.js'
import { PetSettingsController, repositoryRootFromDesktopEntry } from './settings.js'
import { registerPetAgentCapabilities } from './agent-capabilities.js'
import { createDesktopLauncher, launcherNodeExecutable, type LauncherIconId } from './desktop-launcher.js'
import { installFileQuickAction } from './finder-quick-action.js'
import { cleanElectronRuntimeEnv } from './electron-env.js'

export const name = 'xy-deepseek-pet'
export const inject = ['agents', 'apiProxy', 'approval', 'commands', 'systemPrompt', 'tools']

const MAX_WIRE_BYTES = 12 * 1024 * 1024
const REACTION_MS = 2_800
const COMPLETION_SETTLE_MS = 500
const MAX_SESSION_ACTIVITIES = 16
const MAX_ACTIVITY_TEXT = 8_000

function boundedActivityText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+\n/g, '\n')
    .replace(/\n[\t ]+/g, '\n')
    .trim()
  return normalized ? normalized.slice(0, MAX_ACTIVITY_TEXT) : undefined
}

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

interface PendingApprovalAnswer {
  requestId: string
  sessionId: string
  approvalId: string
  rpcId: string
  toolName: string
}

interface PendingQuestionAnswer {
  requestId: string
  sessionId: string
  rpcId: string
  questions: PetQuestionItem[]
}

interface PendingCompletion {
  agent: Agent
  text: string
  time: number
  idleObserved: boolean
  timer: NodeJS.Timeout | undefined
}

interface HarnessApiFrame {
  rpcId: string
  payload: {
    type: string
    sessionId?: unknown
    approvalId?: unknown
    toolName?: unknown
    questions?: unknown
    questionRpcId?: unknown
    outcome?: unknown
  }
}

interface HarnessApiProxy {
  sessions: {
    prompt(request: {
      rpcId: string
      payload: {
        sessionId: string
        mode: 'queue' | 'steer'
        content: Array<{ type: 'text'; text: string } | PetChatImage>
      }
    }): Promise<{
      rpcId: string
      result: { ok: true; value: { accepted: true } } | { ok: false; error: { message: string } }
    }>
  }
  events: {
    mux(request: { rpcId: string; payload: Record<string, never> }, signal: AbortSignal): AsyncIterable<HarnessApiFrame>
  }
  respond(message: {
    type: 'client-response'
    rpcId: string
    result: { ok: true; value:
      | { sessionId: string; approvalId: string; outcome: 'allowed-once' | 'rejected' }
      | { sessionId: string; answer: { answers: PetQuestionAnswer[] } }
    }
  }): Promise<{ accepted: true } | { accepted: false; reason: string }>
}

function boundedVisibleString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return undefined
  return normalized.slice(0, maxLength)
}

function sanitizeQuestions(value: unknown): PetQuestionItem[] | undefined {
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) return undefined
  const ids = new Set<string>()
  const questions: PetQuestionItem[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return undefined
    const input = entry as Record<string, unknown>
    const id = boundedVisibleString(input.id, 128)
    const question = boundedVisibleString(input.question, 600)
    if (!id || !question || ids.has(id)) return undefined
    ids.add(id)
    let options: PetQuestionItem['options']
    if (input.options !== undefined) {
      if (!Array.isArray(input.options) || input.options.length > 12) return undefined
      const labels = new Set<string>()
      options = []
      for (const entry of input.options) {
        if (!entry || typeof entry !== 'object') return undefined
        const option = entry as Record<string, unknown>
        const label = boundedVisibleString(option.label, 120)
        if (!label || labels.has(label)) return undefined
        labels.add(label)
        const description = boundedVisibleString(option.description, 500)
        options.push({ label, ...(description ? { description } : {}) })
      }
    }
    const header = boundedVisibleString(input.header, 80)
    const detail = boundedVisibleString(input.detail, 4_000)
    questions.push({
      id,
      question,
      ...(header ? { header } : {}),
      ...(detail ? { detail } : {}),
      ...(options !== undefined ? { options } : {}),
      ...(typeof input.multiSelect === 'boolean' ? { multiSelect: input.multiSelect } : {}),
    })
  }
  return questions
}

const require = createRequire(import.meta.url)

function installedDesktop(): DesktopLaunch | undefined {
  try {
    const packageRoot = dirname(require.resolve('xy-deepseek-desktop/package.json'))
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
    .join('\n\n')
    .trim()
  return boundedActivityText(stripThinkBlocks(text))
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

const RESOLVED_APPROVAL_TTL_MS = 10 * 60 * 1_000
const MAX_RESOLVED_APPROVALS = 256

function visibleSessionTitle(event: SessionEvent): string | undefined {
  const candidate = event as unknown as { type?: unknown; data?: { title?: unknown } }
  if (candidate.type !== 'session/title' || typeof candidate.data?.title !== 'string') return undefined
  const title = candidate.data.title.replace(/\s+/g, ' ').trim()
  return title ? title.slice(0, 120) : undefined
}

function latestVisibleSessionTitle(session: Session): { title: string; updatedAt: number } | undefined {
  for (let index = session.events.length - 1; index >= 0; index -= 1) {
    const event = session.events[index]!
    const title = visibleSessionTitle(event)
    if (title) return { title, updatedAt: event.time }
  }
  return undefined
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
  private readonly assistantStreams = new Map<string, string>()
  private readonly activeToolCalls = new Map<string, Map<string, string>>()
  private readonly pendingQuestionCalls = new Map<string, Set<string>>()
  private readonly pendingApprovals = new Map<string, Map<string, string>>()
  private readonly pendingApprovalAnswers = new Map<string, PendingApprovalAnswer>()
  private readonly resolvedApprovals = new Map<string, number>()
  private readonly pendingQuestionAnswers = new Map<string, PendingQuestionAnswer>()
  private readonly sessionActivities = new Map<string, PetSessionActivity[]>()
  private readonly pendingCompletions = new Map<string, PendingCompletion>()
  private activitySequence = 0
  private apiEventsAbort: AbortController | undefined
  private apiEventsTask: Promise<void> | undefined
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
    for (const agent of this.ctx.agents.roots()) this.restoreSessionTitle(agent)
    this.server = new WebSocketServer({ host: '127.0.0.1', port: 0, maxPayload: MAX_WIRE_BYTES })
    this.server.on('connection', (socket) => this.accept(socket))
    await new Promise<void>((resolveReady, reject) => {
      this.server?.once('listening', resolveReady)
      this.server?.once('error', reject)
    })
    this.snapshot = reducePetEvent(this.snapshot, { type: 'bridge/connected' })
    this.startApiEventMirror()
    await this.writeRendezvous()
    if (this.config.autoLaunch === true || this.settings?.config.autoLaunch === true) this.openDesktop()
    this.logger.info('local desktop bridge ready')
  }

  async stop(): Promise<void> {
    this.stopped = true
    if (this.reactionTimer) clearTimeout(this.reactionTimer)
    for (const pending of this.pendingCompletions.values()) {
      if (pending.timer) clearTimeout(pending.timer)
    }
    this.pendingCompletions.clear()
    for (const pending of this.pendingThemeImports.values()) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('Pet runtime stopped'))
    }
    this.pendingThemeImports.clear()
    this.apiEventsAbort?.abort()
    this.apiEventsAbort = undefined
    await this.apiEventsTask
    this.apiEventsTask = undefined
    this.pendingApprovalAnswers.clear()
    this.resolvedApprovals.clear()
    this.pendingQuestionAnswers.clear()
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
      stdio: ['pipe', 'ignore', 'pipe'],
      env: cleanElectronRuntimeEnv(process.env, { XY_DEEPSEEK_PET_CHILD: '1' }),
    })
    let stderr = ''
    child.stderr?.setEncoding('utf8')
    child.stderr?.on('data', (chunk: string) => {
      stderr = `${stderr}${chunk}`.slice(-4_096)
    })
    child.stdin?.end(`${JSON.stringify({ port: address.port, token: this.token })}\n`)
    child.once('exit', (code, signal) => {
      if (this.desktop === child) this.desktop = undefined
      if (code && code !== 0) {
        const detail = stderr.replace(/\s+/g, ' ').trim().slice(-1_000)
        this.logger.warn(`desktop exited with code ${code}${detail ? `: ${detail}` : ''}`)
      } else if (signal && !child.killed) {
        this.logger.warn(`desktop exited after signal ${signal}`)
      }
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

  async createLauncher(name: string, iconId: LauncherIconId, fileName: string, dataBase64: string): Promise<{ displayName: string; platform: 'macOS' | 'Windows' }> {
    const packageRoot = resolve(import.meta.dirname, '..')
    const reopenDesktop = process.platform === 'darwin' && this.desktopStatus()
    try {
      if (reopenDesktop) {
        this.closeDesktop()
        await this.waitForDesktopClosed(5_000)
      }
      return createDesktopLauncher({ packageRoot, name, iconId, fileName, dataBase64 })
    } finally {
      if (reopenDesktop) this.openDesktop()
    }
  }

  createFinderQuickAction(): { displayName: string; platform: 'macOS' | 'Windows' } {
    const packageRoot = resolve(import.meta.dirname, '..')
    return installFileQuickAction(packageRoot, launcherNodeExecutable())
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
    this.restoreSessionTitle(agent)
  }

  onAgentDisposed(agent: Agent): void {
    const sessionId = String(agent.id)
    this.cancelPendingCompletion(sessionId)
    this.clearApprovalAnswers((pending) => pending.sessionId === sessionId)
    this.clearQuestionAnswers((pending) => pending.sessionId === sessionId)
    this.touched.delete(String(agent.id))
    this.sessions.delete(String(agent.id))
    this.lastAssistantText.delete(String(agent.id))
    this.assistantStreams.delete(String(agent.id))
    this.activeToolCalls.delete(String(agent.id))
    this.pendingQuestionCalls.delete(String(agent.id))
    this.pendingApprovals.delete(String(agent.id))
    this.clearResolvedApprovals(String(agent.id))
    this.sessionActivities.delete(String(agent.id))
    if (this.selected === agent) this.selectLatest()
    this.publishAggregate()
  }

  onAgentStatus(agent: Agent, status: 'idle' | 'running'): void {
    if (!this.isRoot(agent)) return
    this.touch(agent)
    this.selected = agent
    if (this.reconcileApprovalAudit(agent.session)) this.publishCurrentActivity(String(agent.id), Date.now())
    if (status === 'running') {
      this.cancelPendingCompletion(String(agent.id))
      this.cancelReaction()
      return
    }
    const pendingCompletion = this.pendingCompletions.get(String(agent.id))
    if (pendingCompletion) {
      pendingCompletion.idleObserved = true
      if (!pendingCompletion.timer) this.confirmCompletion(String(agent.id))
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
    if (this.reconcileApprovalAudit(session)) this.publishCurrentActivity(sessionId, event.time)
    const title = visibleSessionTitle(event)
    if (title) {
      this.updateSession(sessionId, { title, updatedAt: event.time })
      this.publishAggregate()
      return
    }
    if (!this.sessions.get(sessionId)?.title) {
      const historicalTitle = latestVisibleSessionTitle(session)
      if (historicalTitle) this.updateSession(sessionId, historicalTitle)
    }
    const approval = approvalAuditEvent(event)
    if (approval?.type === 'approval/asked') {
      if (this.wasApprovalResolved(sessionId, approval.data.id)) return
      const approvals = this.pendingApprovals.get(sessionId) ?? new Map<string, string>()
      approvals.set(approval.data.id, approval.data.toolName)
      this.pendingApprovals.set(sessionId, approvals)
      this.publishAttentionState(sessionId, approval.time)
      return
    }
    if (approval?.type === 'approval/decided') {
      this.rememberResolvedApproval(sessionId, approval.data.id)
      this.pendingApprovals.get(sessionId)?.delete(approval.data.id)
      this.clearApprovalAnswers((pending) => pending.sessionId === sessionId && pending.approvalId === approval.data.id)
      this.publishCurrentActivity(sessionId, approval.time)
      return
    }
    switch (event.type) {
      case 'turn/start':
        this.cancelPendingCompletion(sessionId)
        this.cancelReaction()
        this.lastAssistantText.delete(sessionId)
        this.assistantStreams.delete(sessionId)
        this.activeToolCalls.delete(sessionId)
        this.pendingQuestionCalls.delete(sessionId)
        this.pendingApprovals.delete(sessionId)
        this.clearQuestionAnswers((pending) => pending.sessionId === sessionId)
        if (!this.isContinuingRound(sessionId)) this.sessionActivities.set(sessionId, [])
        this.appendActivity(sessionId, 'thinking', 'Thinking', event.time)
        this.updateSession(sessionId, { state: 'thinking', unread: false, text: 'Thinking', turn: event.data.turn, approval: undefined, question: undefined })
        this.publish({ type: 'agent/running', sessionId, turn: event.data.turn, time: event.time })
        break
      case 'tool/call':
        {
          this.cancelPendingCompletion(sessionId)
          // A tool call ends the current public assistant segment. Text emitted
          // after the tool must become the new compact status, not be appended
          // behind an earlier progress update that may already be truncated.
          this.assistantStreams.delete(sessionId)
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
          this.appendActivity(sessionId, 'tool', text, event.time, `tool:${callId}`)
          this.updateSession(sessionId, { state: 'working', text, turn: event.data.turn })
          this.publish({ type: 'step/working', sessionId, text, time: event.time })
        }
        break
      case 'tool/result': {
        this.cancelPendingCompletion(sessionId)
        const callId = toolResultCallId(event)
        if (callId) {
          this.activeToolCalls.get(sessionId)?.delete(callId)
          this.pendingQuestionCalls.get(sessionId)?.delete(callId)
        }
        this.publishCurrentActivity(sessionId, event.time)
        break
      }
      case 'assistant/chunk': {
        this.cancelPendingCompletion(sessionId)
        const delta = visibleAssistantChunk(event)
        if (!delta) break
        const stream = `${this.assistantStreams.get(sessionId) ?? ''}${delta}`.slice(0, MAX_ACTIVITY_TEXT)
        this.assistantStreams.set(sessionId, stream)
        const visibleStream = stripThinkBlocks(stream)
        const activityText = boundedActivityText(visibleStream)
        const text = boundedStatusText(visibleStream)
        if (!text || !activityText) break
        this.lastAssistantText.set(sessionId, text)
        this.upsertAssistantActivity(sessionId, activityText, event.time)
        this.updateSession(sessionId, { text })
        this.publish({ type: 'assistant/text', sessionId, text, time: event.time })
        break
      }
      case 'assistant/message': {
        this.cancelPendingCompletion(sessionId)
        const activityText = visibleAssistantText(event)
        const text = boundedStatusText(activityText)
        if (text && activityText) {
          this.lastAssistantText.set(sessionId, text)
          this.upsertAssistantActivity(sessionId, activityText, event.time)
          this.updateSession(sessionId, { text })
          this.publish({ type: 'assistant/text', sessionId, text, time: event.time })
        }
        break
      }
      case 'turn/end':
        if (event.data.reason.kind === 'completed') {
          if (this.hasPendingContinuation(sessionId)) {
            this.publishCurrentActivity(sessionId, event.time)
            break
          }
          const text = this.lastAssistantText.get(sessionId) ?? 'Done'
          this.queueCompletion(agent, text, event.time)
        } else if (event.data.reason.kind === 'blocked') {
          this.appendActivity(sessionId, 'needsInput', 'Needs your input', event.time)
          this.updateSession(sessionId, { state: 'needsInput', unread: true, text: 'Needs your input' })
          this.publish({ type: 'agent/needs-input', sessionId, text: 'Needs your input', time: event.time })
        } else if (event.data.reason.kind === 'error') {
          this.clearSessionContinuation(sessionId)
          this.appendActivity(sessionId, 'error', 'Something went wrong', event.time)
          this.updateSession(sessionId, { state: 'error', unread: true, text: 'Something went wrong' })
          this.publish({ type: 'agent/error', sessionId, text: 'Something went wrong', time: event.time })
        } else {
          this.clearSessionContinuation(sessionId)
          this.updateSession(sessionId, { state: 'idle', unread: false, text: undefined })
          this.publishAggregate()
        }
        break
    }
  }

  private publishAttentionState(sessionId: string, time: number): void {
    const answer = [...this.pendingApprovalAnswers.values()].reverse().find((pending) => pending.sessionId === sessionId)
    const approval = answer?.toolName ?? [...(this.pendingApprovals.get(sessionId)?.values() ?? [])].at(-1)
    const pendingQuestion = [...this.pendingQuestionAnswers.values()].reverse().find((pending) => pending.sessionId === sessionId)
    const text = approval ? `Approval required: ${approval}` : pendingQuestion ? 'Choice required' : 'Waiting for your answer'
    this.appendActivity(sessionId, 'needsInput', text, time)
    this.updateSession(sessionId, {
      state: 'needsInput',
      unread: true,
      text,
      approval: answer ? { requestId: answer.requestId, toolName: answer.toolName } : undefined,
      question: !approval && pendingQuestion
        ? { requestId: pendingQuestion.requestId, questions: pendingQuestion.questions }
        : undefined,
    })
    this.publish({ type: 'agent/needs-input', sessionId, text, time })
  }

  private publishCurrentActivity(sessionId: string, time: number): void {
    const hasQuestions = Boolean(this.pendingQuestionCalls.get(sessionId)?.size)
    const hasApprovals = Boolean(this.pendingApprovals.get(sessionId)?.size)
    const hasQuestionAnswer = [...this.pendingQuestionAnswers.values()].some((pending) => pending.sessionId === sessionId)
    if (hasQuestions || hasApprovals || hasQuestionAnswer) return this.publishAttentionState(sessionId, time)
    const activeTool = [...(this.activeToolCalls.get(sessionId)?.values() ?? [])].at(-1)
    if (activeTool) {
      const text = boundedStatusText(`Using ${activeTool}`) ?? 'Working'
      this.updateSession(sessionId, { state: 'working', unread: false, text })
      this.publish({ type: 'step/working', sessionId, text, time })
      return
    }
    const turn = this.sessions.get(sessionId)?.turn
    this.appendActivity(sessionId, 'thinking', 'Thinking', time)
    this.updateSession(sessionId, { state: 'thinking', unread: false, text: 'Thinking', approval: undefined, question: undefined })
    this.publish({ type: 'agent/running', sessionId, ...(turn !== undefined ? { turn } : {}), time })
  }

  private startApiEventMirror(): void {
    const apiProxy = (this.ctx as unknown as { apiProxy?: HarnessApiProxy }).apiProxy
    if (!apiProxy || this.apiEventsTask) return
    const controller = new AbortController()
    this.apiEventsAbort = controller
    this.apiEventsTask = this.consumeApiEvents(apiProxy, controller.signal)
  }

  private async consumeApiEvents(apiProxy: HarnessApiProxy, signal: AbortSignal): Promise<void> {
    try {
      const request = { rpcId: randomUUID(), payload: {} as Record<string, never> }
      for await (const frame of apiProxy.events.mux(request, signal)) this.onApiFrame(frame)
    } catch {
      if (!signal.aborted && !this.stopped) this.logger.warn('official Harness interaction mirror stopped')
    }
  }

  private onApiFrame(frame: HarnessApiFrame): void {
    const payload = frame.payload
    if (payload.type === 'approval/requested') {
      if (typeof payload.sessionId !== 'string' || typeof payload.approvalId !== 'string') return
      const sessionId = payload.sessionId
      if (this.wasApprovalResolved(sessionId, payload.approvalId)) return
      const agent = this.ctx.agents.roots().find((candidate) => String(candidate.id) === sessionId)
      if (!agent || !this.isRoot(agent)) return
      const requestId = String(frame.rpcId)
      this.pendingApprovalAnswers.set(requestId, {
        requestId,
        sessionId,
        approvalId: payload.approvalId,
        rpcId: frame.rpcId,
        toolName: safeToolName(payload.toolName),
      })
      const approvals = this.pendingApprovals.get(sessionId) ?? new Map<string, string>()
      approvals.set(String(payload.approvalId), safeToolName(payload.toolName))
      this.pendingApprovals.set(sessionId, approvals)
      this.publishAttentionState(sessionId, Date.now())
      return
    }
    if (payload.type === 'approval/resolved') {
      if (typeof payload.sessionId !== 'string' || typeof payload.approvalId !== 'string') return
      const sessionId = payload.sessionId
      this.rememberResolvedApproval(sessionId, payload.approvalId)
      this.pendingApprovals.get(sessionId)?.delete(payload.approvalId)
      this.clearApprovalAnswers((pending) => pending.sessionId === sessionId && pending.approvalId === payload.approvalId)
      this.publishCurrentActivity(sessionId, Date.now())
      return
    }
    if (payload.type === 'question/requested') {
      if (typeof payload.sessionId !== 'string') return
      const questions = sanitizeQuestions(payload.questions)
      if (!questions) return
      const sessionId = payload.sessionId
      const agent = this.ctx.agents.roots().find((candidate) => String(candidate.id) === sessionId)
      if (!agent || !this.isRoot(agent)) return
      const requestId = String(frame.rpcId)
      this.pendingQuestionAnswers.set(requestId, { requestId, sessionId, rpcId: frame.rpcId, questions })
      this.publishAttentionState(sessionId, Date.now())
      return
    }
    if (payload.type === 'question/resolved') {
      if (typeof payload.sessionId !== 'string' || typeof payload.questionRpcId !== 'string') return
      const sessionId = payload.sessionId
      this.clearQuestionAnswers((pending) => pending.sessionId === sessionId && pending.rpcId === payload.questionRpcId)
      this.pendingQuestionCalls.delete(sessionId)
      this.publishCurrentActivity(sessionId, Date.now())
    }
  }

  private async answerQuestion(
    socket: WebSocket,
    message: Extract<BridgeClientMessage, { type: 'question-answer' }>,
  ): Promise<void> {
    const pending = this.pendingQuestionAnswers.get(message.requestId)
    if (!pending || this.authenticatedDesktop() !== socket || pending.sessionId !== message.sessionId ||
      !this.validQuestionAnswers(pending.questions, message.answers)) {
      this.send(socket, { type: 'question-result', requestId: message.requestId, ok: false, error: 'Question is no longer available or the answer is invalid.' })
      return
    }
    try {
      const apiProxy = (this.ctx as unknown as { apiProxy?: HarnessApiProxy }).apiProxy
      if (!apiProxy) throw new Error('official API Proxy is unavailable')
      const answers = message.answers.map((answer) => ({
        id: answer.id,
        selected: [...answer.selected],
        ...(answer.custom ? { custom: answer.custom.trim() } : {}),
      }))
      const receipt = await apiProxy.respond({
        type: 'client-response',
        rpcId: pending.rpcId,
        result: { ok: true, value: { sessionId: pending.sessionId, answer: { answers } } },
      })
      if (!receipt.accepted) throw new Error('not pending')
      this.clearQuestionAnswers((entry) => entry.requestId === pending.requestId)
      this.pendingQuestionCalls.delete(pending.sessionId)
      this.publishCurrentActivity(pending.sessionId, Date.now())
      this.send(socket, { type: 'question-result', requestId: message.requestId, ok: true })
    } catch {
      this.send(socket, { type: 'question-result', requestId: message.requestId, ok: false, error: 'Question is no longer available.' })
    }
  }

  private validQuestionAnswers(questions: PetQuestionItem[], answers: PetQuestionAnswer[]): boolean {
    if (answers.length !== questions.length) return false
    return questions.every((question, index) => {
      const answer = answers[index]
      if (!answer || answer.id !== question.id || new Set(answer.selected).size !== answer.selected.length) return false
      const labels = new Set((question.options ?? []).map((option) => option.label))
      if (answer.selected.some((label) => !labels.has(label))) return false
      const custom = answer.custom?.trim()
      if (!question.multiSelect && answer.selected.length > 1) return false
      if (!question.multiSelect && answer.selected.length > 0 && custom) return false
      return answer.selected.length > 0 || Boolean(custom)
    })
  }

  private async decideApproval(
    socket: WebSocket,
    message: Extract<BridgeClientMessage, { type: 'approval-decision' }>,
  ): Promise<void> {
    const pending = this.pendingApprovalAnswers.get(message.requestId)
    if (!pending || this.authenticatedDesktop() !== socket || pending.sessionId !== message.sessionId) {
      this.send(socket, { type: 'approval-result', requestId: message.requestId, ok: false, error: 'Approval request is no longer available.' })
      return
    }
    try {
      const apiProxy = (this.ctx as unknown as { apiProxy?: HarnessApiProxy }).apiProxy
      if (!apiProxy) throw new Error('official API Proxy is unavailable')
      const receipt = await apiProxy.respond({
        type: 'client-response',
        rpcId: pending.rpcId,
        result: {
          ok: true,
          value: {
            sessionId: pending.sessionId,
            approvalId: pending.approvalId,
            outcome: message.outcome,
          },
        },
      })
      if (!receipt.accepted) throw new Error('not pending')
      this.rememberResolvedApproval(pending.sessionId, pending.approvalId)
      this.clearApprovalAnswers((entry) => entry.requestId === pending.requestId)
      this.pendingApprovals.get(pending.sessionId)?.delete(String(pending.approvalId))
      this.publishCurrentActivity(pending.sessionId, Date.now())
      this.send(socket, { type: 'approval-result', requestId: message.requestId, ok: true })
    } catch {
      this.send(socket, { type: 'approval-result', requestId: message.requestId, ok: false, error: 'Approval request is no longer available.' })
    }
  }

  private clearApprovalAnswers(
    predicate: (pending: PendingApprovalAnswer) => boolean,
  ): void {
    for (const pending of [...this.pendingApprovalAnswers.values()]) {
      if (predicate(pending)) this.pendingApprovalAnswers.delete(pending.requestId)
    }
  }

  private reconcileApprovalAudit(session: Session): boolean {
    const sessionId = String(session.id)
    const pendingIds = new Set(this.pendingApprovals.get(sessionId)?.keys() ?? [])
    for (const pending of this.pendingApprovalAnswers.values()) {
      if (pending.sessionId === sessionId) pendingIds.add(pending.approvalId)
    }
    if (pendingIds.size === 0) return false

    const decided = new Set<string>()
    for (const event of session.events) {
      const approval = approvalAuditEvent(event)
      if (approval?.type === 'approval/decided' && pendingIds.has(approval.data.id)) decided.add(approval.data.id)
    }
    if (decided.size === 0) return false

    const approvals = this.pendingApprovals.get(sessionId)
    for (const approvalId of decided) {
      this.rememberResolvedApproval(sessionId, approvalId)
      approvals?.delete(approvalId)
    }
    if (approvals?.size === 0) this.pendingApprovals.delete(sessionId)
    this.clearApprovalAnswers((pending) => pending.sessionId === sessionId && decided.has(pending.approvalId))
    return true
  }

  private approvalKey(sessionId: string, approvalId: string): string {
    return `${sessionId}\u0000${approvalId}`
  }

  private rememberResolvedApproval(sessionId: string, approvalId: string, time = Date.now()): void {
    const key = this.approvalKey(sessionId, approvalId)
    this.resolvedApprovals.delete(key)
    this.resolvedApprovals.set(key, time)
    while (this.resolvedApprovals.size > MAX_RESOLVED_APPROVALS) {
      const oldest = this.resolvedApprovals.keys().next().value
      if (oldest === undefined) break
      this.resolvedApprovals.delete(oldest)
    }
  }

  private wasApprovalResolved(sessionId: string, approvalId: string, now = Date.now()): boolean {
    const key = this.approvalKey(sessionId, approvalId)
    const resolvedAt = this.resolvedApprovals.get(key)
    if (resolvedAt === undefined) return false
    if (now - resolvedAt <= RESOLVED_APPROVAL_TTL_MS) return true
    this.resolvedApprovals.delete(key)
    return false
  }

  private clearResolvedApprovals(sessionId: string): void {
    const prefix = `${sessionId}\u0000`
    for (const key of this.resolvedApprovals.keys()) {
      if (key.startsWith(prefix)) this.resolvedApprovals.delete(key)
    }
  }

  private clearQuestionAnswers(predicate: (pending: PendingQuestionAnswer) => boolean): void {
    for (const pending of [...this.pendingQuestionAnswers.values()]) {
      if (predicate(pending)) this.pendingQuestionAnswers.delete(pending.requestId)
    }
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
      if (value.type === 'chat') void this.submitChat(socket, value.requestId, value.text, value.sessionId, value.images)
      if (value.type === 'approval-decision') void this.decideApproval(socket, value)
      if (value.type === 'question-answer') void this.answerQuestion(socket, value)
      if (value.type === 'focus') this.openDesktop()
      if (value.type === 'acknowledge') this.acknowledge(value.sessionId)
      if (value.type === 'open-client') this.openClient(value.sessionId)
      if (value.type === 'treasure-found') {
        void this.settings?.recordTreasureFound().catch(() => this.logger.warn('could not persist treasure count'))
      }
      if (value.type === 'shutdown-service') this.shutdownOwnedService()
      if (value.type === 'theme-import-result') this.resolveThemeImport(value)
    })
    socket.once('close', () => {
      clearTimeout(authTimer)
    })
  }

  private async submitChat(socket: WebSocket, requestId: string, text: string, sessionId?: string, images: PetChatImage[] = []): Promise<void> {
    const agent = sessionId
      ? this.ctx.agents.roots().find((candidate) => String(candidate.id) === sessionId)
      : this.selectLatest()
    if (agent && !this.isRoot(agent)) {
      this.send(socket, { type: 'chat-result', requestId, ok: false, error: 'The selected session is not eligible.' })
      return
    }
    if (!agent) {
      this.send(socket, { type: 'chat-result', requestId, ok: false, error: 'No active Harness session.' })
      return
    }
    try {
      if (images.length) {
        const apiProxy = (this.ctx as unknown as { apiProxy?: HarnessApiProxy }).apiProxy
        if (!apiProxy) throw new Error('official API Proxy is unavailable')
        const content: Array<{ type: 'text'; text: string } | PetChatImage> = [
          ...(text.trim() ? [{ type: 'text' as const, text: text.trim() }] : []),
          ...images,
        ]
        const response = await apiProxy.sessions.prompt({
          rpcId: randomUUID(),
          payload: { sessionId: String(agent.id), mode: 'queue', content },
        })
        if (!response.result.ok) throw new Error(response.result.error.message)
      } else {
        agent.followup(createUserMessage({
          content: [{ type: 'text', text: text.trim() }],
          source: { kind: 'user' },
        }))
      }
      this.touch(agent)
      this.acknowledge(String(agent.id))
      this.send(socket, { type: 'chat-result', requestId, ok: true })
    } catch (error) {
      this.send(socket, {
        type: 'chat-result', requestId, ok: false,
        error: error instanceof Error ? error.message : 'Harness rejected the message.',
      })
    }
  }

  private publish(event: HarnessPetEvent): void {
    const reduced = reducePetEvent(this.snapshot, event)
    if ('sessionId' in event) {
      const { turn: _staleTurn, ...withoutTurn } = reduced
      const turn = this.sessions.get(event.sessionId)?.turn
      this.snapshot = {
        ...withoutTurn,
        ...(turn !== undefined ? { turn } : {}),
        sessions: this.sortedSessions(),
      }
    } else {
      this.snapshot = { ...reduced, sessions: this.sortedSessions() }
    }
    this.broadcast()
  }

  private publishAggregate(): void {
    const summaries = this.sortedSessions()
    const active = summaries.find((entry) => entry.state === 'needsInput') ??
      summaries.find((entry) => entry.state === 'error' && entry.unread) ??
      summaries.find((entry) => entry.state === 'working') ??
      summaries.find((entry) => entry.state === 'thinking')
    const nextState = active?.state ?? 'idle'
    const { sessionId: _sessionId, text: _text, turn: _turn, ...snapshotBase } = this.snapshot
    const activeFields = active
      ? {
          sessionId: active.id,
          ...(active.text ? { text: active.text } : {}),
          ...(active.turn !== undefined ? { turn: active.turn } : {}),
        }
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
      ...(patch.turn !== undefined ? { turn: patch.turn } : previous?.turn !== undefined ? { turn: previous.turn } : {}),
      ...(this.sessionActivities.get(id)?.length ? { activities: [...this.sessionActivities.get(id)!] } : {}),
      ...(patch.approval !== undefined ? { approval: patch.approval } : previous?.approval ? { approval: previous.approval } : {}),
      ...(patch.question !== undefined ? { question: patch.question } : previous?.question ? { question: previous.question } : {}),
    })
    if (patch.text === undefined && Object.prototype.hasOwnProperty.call(patch, 'text')) {
      const current = this.sessions.get(id)!
      delete current.text
    }
    if (patch.approval === undefined && Object.prototype.hasOwnProperty.call(patch, 'approval')) {
      const current = this.sessions.get(id)!
      delete current.approval
    }
    if (patch.question === undefined && Object.prototype.hasOwnProperty.call(patch, 'question')) {
      const current = this.sessions.get(id)!
      delete current.question
    }
  }

  private appendActivity(
    sessionId: string,
    kind: PetActivityKind,
    text: string,
    time: number,
    id = `${kind}:${++this.activitySequence}`,
  ): void {
    const bounded = boundedActivityText(text)
    if (!bounded) return
    const activities = this.sessionActivities.get(sessionId) ?? []
    const previous = activities.at(-1)
    if (previous?.kind === kind && previous.text === bounded && kind !== 'tool') return
    const next = [...activities.filter((activity) => activity.id !== id), { id, kind, text: bounded, time }]
      .slice(-MAX_SESSION_ACTIVITIES)
    this.sessionActivities.set(sessionId, next)
  }

  private isContinuingRound(sessionId: string): boolean {
    const state = this.sessions.get(sessionId)?.state
    return state === 'thinking' || state === 'working' || state === 'needsInput'
  }

  private hasPendingContinuation(sessionId: string): boolean {
    return Boolean(this.activeToolCalls.get(sessionId)?.size) ||
      Boolean(this.pendingQuestionCalls.get(sessionId)?.size) ||
      Boolean(this.pendingApprovals.get(sessionId)?.size) ||
      [...this.pendingApprovalAnswers.values()].some((entry) => entry.sessionId === sessionId) ||
      [...this.pendingQuestionAnswers.values()].some((entry) => entry.sessionId === sessionId)
  }

  private clearSessionContinuation(sessionId: string): void {
    this.clearApprovalAnswers((pending) => pending.sessionId === sessionId)
    this.clearQuestionAnswers((pending) => pending.sessionId === sessionId)
    this.activeToolCalls.delete(sessionId)
    this.pendingQuestionCalls.delete(sessionId)
    this.pendingApprovals.delete(sessionId)
    this.updateSession(sessionId, { approval: undefined, question: undefined })
  }

  private queueCompletion(agent: Agent, text: string, time: number): void {
    const sessionId = String(agent.id)
    this.cancelPendingCompletion(sessionId)
    const pending: PendingCompletion = {
      agent,
      text,
      time,
      idleObserved: agent.status === 'idle',
      timer: undefined,
    }
    pending.timer = setTimeout(() => this.confirmCompletion(sessionId), COMPLETION_SETTLE_MS)
    this.pendingCompletions.set(sessionId, pending)
  }

  private confirmCompletion(sessionId: string): void {
    const pending = this.pendingCompletions.get(sessionId)
    if (!pending) return
    pending.timer = undefined
    if (this.stopped) {
      this.pendingCompletions.delete(sessionId)
      return
    }
    if (!pending.idleObserved && pending.agent.status !== 'idle') return
    this.pendingCompletions.delete(sessionId)
    if (this.hasPendingContinuation(sessionId)) return
    this.appendActivity(sessionId, 'complete', 'Done', pending.time)
    this.updateSession(sessionId, { state: 'complete', unread: true, text: pending.text })
    this.publish({ type: 'turn/complete', sessionId, text: pending.text, time: pending.time })
    this.scheduleIdle(pending.agent)
  }

  private cancelPendingCompletion(sessionId: string): void {
    const pending = this.pendingCompletions.get(sessionId)
    if (!pending) return
    if (pending.timer) clearTimeout(pending.timer)
    this.pendingCompletions.delete(sessionId)
  }

  private upsertAssistantActivity(sessionId: string, text: string, time: number): void {
    const previous = this.sessionActivities.get(sessionId)?.at(-1)
    const id = previous?.kind === 'assistant' ? previous.id : `assistant:${++this.activitySequence}`
    this.appendActivity(sessionId, 'assistant', text, time, id)
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
      .sort((a, b) => priority[b.state] - priority[a.state] || b.updatedAt - a.updatedAt)
      .slice(0, 64)
      .map((entry, index) => {
        if (index < 3 || !entry.activities) return entry
        const { activities: _activities, ...summary } = entry
        return summary
      })
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

  openSettings(): void {
    const now = Date.now()
    if (this.lastClientOpen?.target === 'settings' && now - this.lastClientOpen.at < 5_000) return
    this.lastClientOpen = { target: 'settings', at: now }
    const url = petSettingsUrl(this.config.clientUrl ?? process.env.XY_DEEPSEEK_PET_CLIENT_URL ?? 'http://127.0.0.1:3080')
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

  private waitForDesktopClosed(timeoutMs: number): Promise<void> {
    if (!this.desktopStatus()) return Promise.resolve()
    return new Promise((resolveWait, reject) => {
      const deadline = Date.now() + timeoutMs
      const interval = setInterval(() => {
        if (!this.desktopStatus()) {
          clearInterval(interval)
          resolveWait()
        } else if (Date.now() >= deadline) {
          clearInterval(interval)
          reject(new Error('Close the desktop pet before replacing its macOS shortcut.'))
        }
      }, 50)
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

  private restoreSessionTitle(agent: Agent): void {
    const title = latestVisibleSessionTitle(agent.session)
    if (title) this.updateSession(String(agent.id), title)
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
