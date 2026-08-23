import type { PetSessionActivity, PetSessionSummary, PetSnapshot } from '@xy-deepseek-pet/protocol'

const passiveStates = new Set(['idle', 'sleep', 'walk'])
const activeProgressStates = new Set(['thinking', 'working'])

export interface SessionBubbleDismissal {
  turn?: number
  activeProgress: boolean
}

export function sessionBubbleDismissal(session: PetSessionSummary): SessionBubbleDismissal {
  return {
    ...(session.turn !== undefined ? { turn: session.turn } : {}),
    activeProgress: activeProgressStates.has(session.state),
  }
}

export function shouldReleaseSessionBubbleDismissal(
  dismissal: SessionBubbleDismissal,
  current: PetSessionSummary | undefined,
): boolean {
  if (!current) return true
  if (dismissal.turn !== undefined && current.turn !== undefined && dismissal.turn !== current.turn) return true
  if (dismissal.activeProgress) return !activeProgressStates.has(current.state)
  return current.state === 'thinking' || current.state === 'working' || current.state === 'needsInput'
}

export function replyableSessions(snapshot: PetSnapshot): PetSessionSummary[] {
  if (snapshot.sessions?.length) return snapshot.sessions
  if (!snapshot.sessionId) return []
  return [{
    id: snapshot.sessionId,
    title: '',
    state: snapshot.state,
    unread: snapshot.state === 'complete' || snapshot.state === 'error' || snapshot.state === 'needsInput',
    updatedAt: snapshot.time,
    ...(snapshot.text ? { text: snapshot.text } : {}),
  }]
}

export function recentReplyableSessions(snapshot: PetSnapshot, limit = 4): PetSessionSummary[] {
  return replyableSessions(snapshot)
    .slice()
    .sort((left, right) => right.updatedAt - left.updatedAt || left.id.localeCompare(right.id))
    .slice(0, Math.max(0, limit))
}

export function bubbleSessions(
  snapshot: PetSnapshot,
  dismissedSessionIds: { has(sessionId: string): boolean },
  composerSessionId?: string,
): PetSessionSummary[] {
  return replyableSessions(snapshot).filter((session) => {
    if (session.id === composerSessionId) return true
    if (dismissedSessionIds.has(session.id)) return false
    return session.unread || !passiveStates.has(session.state)
  })
}

export function sessionActivitiesForPanel(session: PetSessionSummary): PetSessionActivity[] | undefined {
  if (!session.activities?.length) return undefined
  const terminal = session.activities.slice().reverse().find((activity) => activity.kind === 'complete' || activity.kind === 'error')
  if (session.state === 'complete' || (session.state === 'idle' && terminal?.kind === 'complete')) {
    const beforeTerminal = terminal ? session.activities.slice(0, session.activities.indexOf(terminal)) : session.activities
    return [beforeTerminal.slice().reverse().find((activity) => activity.kind === 'assistant') ?? terminal ?? session.activities.at(-1)!]
  }
  if (session.state === 'needsInput' || session.state === 'error' || (session.state === 'idle' && terminal?.kind === 'error')) {
    return [terminal ?? session.activities.at(-1)!]
  }
  return session.activities
}
