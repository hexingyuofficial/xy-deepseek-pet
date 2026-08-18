import { describe, expect, it } from 'vitest'
import { boundedStatusText, initialSnapshot, isBridgeClientMessage, isBridgeServerMessage, reducePetEvent } from './index.js'

describe('pet state reducer', () => {
  it('separates disconnect from task errors', () => {
    const running = reducePetEvent(initialSnapshot(0), { type: 'agent/running', sessionId: 'one', time: 1 })
    expect(running.state).toBe('thinking')
    expect(reducePetEvent(running, { type: 'bridge/disconnected', time: 2 }).state).toBe('offline')
  })

  it('maps working and completion transitions', () => {
    const thinking = reducePetEvent(initialSnapshot(0), { type: 'agent/running', sessionId: 'one', time: 1 })
    const working = reducePetEvent(thinking, { type: 'step/working', sessionId: 'one', time: 2 })
    const complete = reducePetEvent(working, { type: 'turn/complete', sessionId: 'one', time: 3 })
    expect([thinking.state, working.state, complete.state]).toEqual(['thinking', 'working', 'complete'])
  })

  it('bounds whitespace-normalized surfaced text', () => {
    expect(boundedStatusText(`  hello\n  world ${'x'.repeat(400)}`)?.length).toBe(280)
  })

  it('accepts targeted chat, acknowledgement, and bounded session summaries', () => {
    expect(isBridgeClientMessage({ type: 'chat', requestId: 'one', sessionId: 'session-one', text: 'hello' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'acknowledge', sessionId: 'session-one' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'open-client', sessionId: 'session-one' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'shutdown-service' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'theme-import-result', requestId: 'import-one', ok: true, themeId: 'whale' })).toBe(true)
    expect(isBridgeServerMessage({ type: 'theme-import', requestId: 'import-one', path: '/tmp/pet.zip' })).toBe(true)
    expect(isBridgeServerMessage({ type: 'quit' })).toBe(true)
    expect(
      isBridgeServerMessage({
        type: 'snapshot',
        snapshot: {
          ...initialSnapshot(0),
          sessions: [{ id: 'one', title: 'Session one', state: 'thinking', unread: false, updatedAt: 1, text: 'Working' }],
        },
      }),
    ).toBe(true)
  })

  it('accepts the cosmetic sleep presentation state', () => {
    expect(isBridgeServerMessage({ type: 'snapshot', snapshot: { ...initialSnapshot(0), state: 'sleep' } })).toBe(true)
  })
})
