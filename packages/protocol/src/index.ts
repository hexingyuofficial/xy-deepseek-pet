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

export interface PetSessionSummary {
  id: string
  title: string
  state: PetState
  unread: boolean
  updatedAt: number
  text?: string | undefined
}

export interface PetSnapshot {
  state: PetState
  connected: boolean
  facing: 'left' | 'right'
  sessionId?: string
  text?: string | undefined
  sessions?: PetSessionSummary[]
  sequence: number
  time: number
}

export type BridgeServerMessage =
  | { type: 'snapshot'; snapshot: PetSnapshot }
  | { type: 'chat-result'; requestId: string; ok: true }
  | { type: 'chat-result'; requestId: string; ok: false; error: string }
  | { type: 'theme-import'; requestId: string; path: string }
  | { type: 'quit' }

export type BridgeClientMessage =
  | { type: 'auth'; token: string }
  | { type: 'chat'; requestId: string; text: string; sessionId?: string }
  | { type: 'focus' }
  | { type: 'acknowledge'; sessionId: string }
  | { type: 'open-client'; sessionId?: string }
  | { type: 'shutdown-service' }
  | { type: 'theme-import-result'; requestId: string; ok: true; themeId: string }
  | { type: 'theme-import-result'; requestId: string; ok: false; error: string }

export type HarnessPetEvent =
  | { type: 'bridge/connected'; time?: number }
  | { type: 'bridge/disconnected'; time?: number }
  | { type: 'agent/running'; sessionId: string; time?: number }
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
      return { ...base, connected: true, sessionId: event.sessionId, state: 'thinking', text: 'Thinking' }
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
  if (message.type === 'open-client') {
    return message.sessionId === undefined || (typeof message.sessionId === 'string' && message.sessionId.length <= 256)
  }
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
            (session.text === undefined || (typeof session.text === 'string' && session.text.length <= 600))
          )
        }))
    return Boolean(
      snapshot &&
        PET_STATES.includes(snapshot.state as PetState) &&
        typeof snapshot.connected === 'boolean' &&
        (snapshot.facing === 'left' || snapshot.facing === 'right') &&
        typeof snapshot.sequence === 'number' &&
        typeof snapshot.time === 'number' &&
        validSessions,
    )
  }
  if (message.type === 'theme-import') {
    return typeof message.requestId === 'string' && message.requestId.length <= 128 &&
      typeof message.path === 'string' && message.path.length <= 1024
  }
  if (message.type === 'quit') return true
  return (
    message.type === 'chat-result' &&
    typeof message.requestId === 'string' &&
    typeof message.ok === 'boolean' &&
    (message.ok || typeof message.error === 'string')
  )
}
