import type { PetSnapshot } from '@xy-deepseek-pet/protocol'
import { describe, expect, it } from 'vitest'
import { bubbleSessions, recentReplyableSessions, replyableSessions, sessionActivitiesForPanel } from './session-selection.js'

const snapshot: PetSnapshot = {
  state: 'idle',
  facing: 'right',
  connected: true,
  sequence: 1,
  time: 100,
  sessions: [{ id: 'recent', title: 'Recent session', state: 'idle', unread: false, updatedAt: 90 }],
}

describe('desktop session selection', () => {
  it('lists only a few recent sessions in stable newest-first order', () => {
    const sessions = [
      { id: 'old', title: 'Old', state: 'idle' as const, unread: false, updatedAt: 1 },
      { id: 'new-b', title: 'New B', state: 'complete' as const, unread: true, updatedAt: 3 },
      { id: 'middle', title: 'Middle', state: 'thinking' as const, unread: false, updatedAt: 2 },
      { id: 'new-a', title: 'New A', state: 'complete' as const, unread: true, updatedAt: 3 },
    ]
    expect(recentReplyableSessions({ ...snapshot, sessions }, 3).map(({ id }) => id)).toEqual(['new-a', 'new-b', 'middle'])
  })
  it('keeps an idle recent session available for the right-click reply action', () => {
    expect(replyableSessions(snapshot)[0]?.id).toBe('recent')
    expect(bubbleSessions(snapshot, new Set())).toEqual([])
  })

  it('shows a selected composer even when its ordinary bubble was dismissed', () => {
    expect(bubbleSessions(snapshot, new Set(['recent']), 'recent')[0]?.id).toBe('recent')
  })

  it('keeps a dismissed unread session completely hidden', () => {
    const unread = { ...snapshot, sessions: [{ ...snapshot.sessions![0]!, unread: true }] }
    expect(bubbleSessions(unread, new Set(['recent']))).toEqual([])
  })

  it('falls back to the aggregate session when no summaries are present', () => {
    expect(replyableSessions({ ...snapshot, sessionId: 'aggregate', sessions: [] })[0]?.id).toBe('aggregate')
  })

  it('shows live progress while active but only the latest answer after completion', () => {
    const activities = [
      { id: 'thinking', kind: 'thinking' as const, text: 'Thinking', time: 1 },
      { id: 'tool', kind: 'tool' as const, text: 'Using read_file', time: 2 },
      { id: 'answer', kind: 'assistant' as const, text: 'Latest full answer', time: 3 },
      { id: 'done', kind: 'complete' as const, text: 'Done', time: 4 },
    ]
    const session = { ...snapshot.sessions![0]!, state: 'thinking' as const, activities }
    expect(sessionActivitiesForPanel(session)).toEqual(activities)
    expect(sessionActivitiesForPanel({ ...session, state: 'complete' })).toEqual([activities[2]])
    expect(sessionActivitiesForPanel({ ...session, state: 'idle' })).toEqual([activities[2]])
  })
})
