export const PET_STATES = [
  'idle',
  'sleep',
  'walk',
  'thinking',
  'working',
  'needsInput',
  'complete',
  'error',
  'offline',
] as const

export type PetState = (typeof PET_STATES)[number]

export const PET_SETTINGS_QUERY = 'xyPet'

export function petSettingsUrl(clientUrl: string): string {
  const url = new URL(clientUrl)
  url.searchParams.set(PET_SETTINGS_QUERY, 'settings')
  return url.toString()
}

export function consumePetSettingsUrl(clientUrl: string): { requested: boolean; cleanUrl: string } {
  const url = new URL(clientUrl)
  const requested = url.searchParams.get(PET_SETTINGS_QUERY) === 'settings'
  if (requested) url.searchParams.delete(PET_SETTINGS_QUERY)
  return { requested, cleanUrl: url.toString() }
}

export const PET_ACTIVITY_KINDS = [
  'thinking',
  'tool',
  'assistant',
  'needsInput',
  'complete',
  'error',
] as const

export type PetActivityKind = (typeof PET_ACTIVITY_KINDS)[number]

const MAX_ACTIVITY_TEXT = 8_000

export interface PetSessionActivity {
  id: string
  kind: PetActivityKind
  text: string
  time: number
}

export interface PetQuestionOption {
  label: string
  description?: string | undefined
}

export interface PetQuestionItem {
  id: string
  question: string
  header?: string | undefined
  detail?: string | undefined
  options?: PetQuestionOption[] | undefined
  multiSelect?: boolean | undefined
}

export interface PetQuestionRequest {
  requestId: string
  questions: PetQuestionItem[]
}

export interface PetQuestionAnswer {
  id: string
  selected: string[]
  custom?: string | undefined
}

export interface PetSessionSummary {
  id: string
  title: string
  state: PetState
  unread: boolean
  updatedAt: number
  text?: string | undefined
  turn?: number | undefined
  activities?: PetSessionActivity[] | undefined
  approval?: {
    requestId: string
    toolName: string
  } | undefined
  question?: PetQuestionRequest | undefined
}

export interface PetSnapshot {
  state: PetState
  connected: boolean
  facing: 'left' | 'right'
  sessionId?: string
  text?: string | undefined
  turn?: number | undefined
  sessions?: PetSessionSummary[]
  sequence: number
  time: number
}

export type BridgeServerMessage =
  | { type: 'snapshot'; snapshot: PetSnapshot }
  | { type: 'chat-result'; requestId: string; ok: true }
  | { type: 'chat-result'; requestId: string; ok: false; error: string }
  | { type: 'approval-result'; requestId: string; ok: true }
  | { type: 'approval-result'; requestId: string; ok: false; error: string }
  | { type: 'question-result'; requestId: string; ok: true }
  | { type: 'question-result'; requestId: string; ok: false; error: string }
  | { type: 'theme-import'; requestId: string; path: string }
  | { type: 'quit' }

export type BridgeClientMessage =
  | { type: 'auth'; token: string }
  | { type: 'chat'; requestId: string; text: string; sessionId?: string }
  | { type: 'approval-decision'; requestId: string; sessionId: string; outcome: 'allowed-once' | 'rejected' }
  | { type: 'question-answer'; requestId: string; sessionId: string; answers: PetQuestionAnswer[] }
  | { type: 'focus' }
  | { type: 'acknowledge'; sessionId: string }
  | { type: 'open-client'; sessionId?: string }
  | { type: 'treasure-found' }
  | { type: 'shutdown-service' }
  | { type: 'theme-import-result'; requestId: string; ok: true; themeId: string }
  | { type: 'theme-import-result'; requestId: string; ok: false; error: string }

export type HarnessPetEvent =
  | { type: 'bridge/connected'; time?: number }
  | { type: 'bridge/disconnected'; time?: number }
  | { type: 'agent/running'; sessionId: string; turn?: number; time?: number }
  | { type: 'agent/idle'; sessionId: string; time?: number }
  | { type: 'step/working'; sessionId: string; text?: string; time?: number }
  | { type: 'assistant/text'; sessionId: string; text: string; time?: number }
  | { type: 'agent/needs-input'; sessionId: string; text?: string; time?: number }
  | { type: 'turn/complete'; sessionId: string; text?: string; time?: number }
  | { type: 'agent/error'; sessionId: string; text?: string; time?: number }

const MAX_STATUS_TEXT = 280

export function boundedStatusText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return undefined
  return normalized.slice(0, MAX_STATUS_TEXT)
}

export function initialSnapshot(time = Date.now()): PetSnapshot {
  return { state: 'offline', connected: false, facing: 'right', sequence: 0, time }
}

export function reducePetEvent(previous: PetSnapshot, event: HarnessPetEvent): PetSnapshot {
  const time = event.time ?? Date.now()
  const base = { ...previous, sequence: previous.sequence + 1, time }
  const { text: _previousText, ...baseWithoutText } = base

  switch (event.type) {
    case 'bridge/connected':
      return { ...baseWithoutText, connected: true, state: 'idle' }
    case 'bridge/disconnected':
      return { ...base, connected: false, state: 'offline', text: 'Harness disconnected' }
    case 'agent/running':
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: 'thinking',
        text: 'Thinking',
        ...(event.turn !== undefined ? { turn: event.turn } : {}),
      }
    case 'agent/idle':
      return { ...baseWithoutText, connected: true, sessionId: event.sessionId, state: 'idle' }
    case 'step/working':
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: 'working',
        text: boundedStatusText(event.text) ?? 'Working',
      }
    case 'assistant/text':
      const text = boundedStatusText(event.text)
      return {
        ...baseWithoutText,
        connected: true,
        sessionId: event.sessionId,
        state: previous.state === 'working' ? 'working' : 'thinking',
        ...(text ? { text } : {}),
      }
    case 'agent/needs-input':
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: 'needsInput',
        text: boundedStatusText(event.text) ?? 'Needs your input',
      }
    case 'turn/complete':
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: 'complete',
        text: boundedStatusText(event.text) ?? 'Done',
      }
    case 'agent/error':
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: 'error',
        text: boundedStatusText(event.text) ?? 'Something went wrong',
      }
  }
}

export function isBridgeClientMessage(value: unknown): value is BridgeClientMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  if (message.type === 'auth') return typeof message.token === 'string' && message.token.length <= 256
  if (message.type === 'focus') return true
  if (message.type === 'shutdown-service') return true
  if (message.type === 'theme-import-result') {
    return typeof message.requestId === 'string' && message.requestId.length <= 128 &&
      typeof message.ok === 'boolean' &&
      (message.ok ? typeof message.themeId === 'string' && message.themeId.length <= 64 : typeof message.error === 'string' && message.error.length <= 500)
  }
  if (message.type === 'acknowledge') return typeof message.sessionId === 'string' && message.sessionId.length <= 256
  if (message.type === 'approval-decision') {
    return typeof message.requestId === 'string' && message.requestId.length <= 128 &&
      typeof message.sessionId === 'string' && message.sessionId.length <= 256 &&
      (message.outcome === 'allowed-once' || message.outcome === 'rejected')
  }
  if (message.type === 'question-answer') {
    return typeof message.requestId === 'string' && message.requestId.length <= 128 &&
      typeof message.sessionId === 'string' && message.sessionId.length <= 256 &&
      validQuestionAnswers(message.answers)
  }
  if (message.type === 'open-client') {
    return message.sessionId === undefined || (typeof message.sessionId === 'string' && message.sessionId.length <= 256)
  }
  if (message.type === 'treasure-found') return true
  return (
    message.type === 'chat' &&
    typeof message.requestId === 'string' &&
    message.requestId.length <= 128 &&
    typeof message.text === 'string' &&
    message.text.trim().length > 0 &&
    message.text.length <= 8_000 &&
    (message.sessionId === undefined || (typeof message.sessionId === 'string' && message.sessionId.length <= 256))
  )
}

export function isBridgeServerMessage(value: unknown): value is BridgeServerMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  if (message.type === 'snapshot') {
    const snapshot = message.snapshot as Record<string, unknown> | undefined
    const sessions = snapshot?.sessions
    const validSessions =
      sessions === undefined ||
      (Array.isArray(sessions) &&
        sessions.length <= 64 &&
        sessions.every((entry) => {
          if (!entry || typeof entry !== 'object') return false
          const session = entry as Record<string, unknown>
          return (
            typeof session.id === 'string' &&
            session.id.length <= 256 &&
            typeof session.title === 'string' &&
            session.title.length <= 120 &&
            PET_STATES.includes(session.state as PetState) &&
            typeof session.unread === 'boolean' &&
            typeof session.updatedAt === 'number' &&
            (session.text === undefined || (typeof session.text === 'string' && session.text.length <= 600)) &&
            (session.turn === undefined || (Number.isInteger(session.turn) && (session.turn as number) >= 0)) &&
            (session.activities === undefined || (
              Array.isArray(session.activities) &&
              session.activities.length <= 16 &&
              session.activities.every((entry) => {
                if (!entry || typeof entry !== 'object') return false
                const activity = entry as Record<string, unknown>
                return typeof activity.id === 'string' && activity.id.length <= 128 &&
                  PET_ACTIVITY_KINDS.includes(activity.kind as PetActivityKind) &&
                  typeof activity.text === 'string' && activity.text.length > 0 && activity.text.length <= MAX_ACTIVITY_TEXT &&
                  typeof activity.time === 'number'
              })
            )) &&
            (session.approval === undefined || (
              typeof session.approval === 'object' && session.approval !== null &&
              typeof (session.approval as Record<string, unknown>).requestId === 'string' &&
              ((session.approval as Record<string, unknown>).requestId as string).length <= 128 &&
              typeof (session.approval as Record<string, unknown>).toolName === 'string' &&
              ((session.approval as Record<string, unknown>).toolName as string).length <= 80
            )) &&
            (session.question === undefined || validQuestionRequest(session.question))
          )
        }))
    return Boolean(
      snapshot &&
        PET_STATES.includes(snapshot.state as PetState) &&
        typeof snapshot.connected === 'boolean' &&
        (snapshot.facing === 'left' || snapshot.facing === 'right') &&
        typeof snapshot.sequence === 'number' &&
        typeof snapshot.time === 'number' &&
        (snapshot.turn === undefined || (Number.isInteger(snapshot.turn) && (snapshot.turn as number) >= 0)) &&
        validSessions,
    )
  }
  if (message.type === 'theme-import') {
    return typeof message.requestId === 'string' && message.requestId.length <= 128 &&
      typeof message.path === 'string' && message.path.length <= 1024
  }
  if (message.type === 'quit') return true
  return (
    (message.type === 'chat-result' || message.type === 'approval-result' || message.type === 'question-result') &&
    typeof message.requestId === 'string' &&
    typeof message.ok === 'boolean' &&
    (message.ok || typeof message.error === 'string')
  )
}

function validQuestionRequest(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  if (typeof request.requestId !== 'string' || request.requestId.length === 0 || request.requestId.length > 128) return false
  if (!Array.isArray(request.questions) || request.questions.length === 0 || request.questions.length > 8) return false
  return request.questions.every((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const question = entry as Record<string, unknown>
    return typeof question.id === 'string' && question.id.length > 0 && question.id.length <= 128 &&
      typeof question.question === 'string' && question.question.length > 0 && question.question.length <= 600 &&
      (question.header === undefined || (typeof question.header === 'string' && question.header.length <= 80)) &&
      (question.detail === undefined || (typeof question.detail === 'string' && question.detail.length <= 4_000)) &&
      (question.multiSelect === undefined || typeof question.multiSelect === 'boolean') &&
      (question.options === undefined || (
        Array.isArray(question.options) && question.options.length <= 12 && question.options.every((entry) => {
          if (!entry || typeof entry !== 'object') return false
          const option = entry as Record<string, unknown>
          return typeof option.label === 'string' && option.label.length > 0 && option.label.length <= 120 &&
            (option.description === undefined || (typeof option.description === 'string' && option.description.length <= 500))
        })
      ))
  })
}

function validQuestionAnswers(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.length <= 8 && value.every((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const answer = entry as Record<string, unknown>
    return typeof answer.id === 'string' && answer.id.length > 0 && answer.id.length <= 128 &&
      Array.isArray(answer.selected) && answer.selected.length <= 12 &&
      answer.selected.every((label) => typeof label === 'string' && label.length > 0 && label.length <= 120) &&
      (answer.custom === undefined || (typeof answer.custom === 'string' && answer.custom.trim().length > 0 && answer.custom.length <= 2_000))
  })
}
