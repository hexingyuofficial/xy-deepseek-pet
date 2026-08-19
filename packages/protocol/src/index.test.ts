import { describe, expect, it } from 'vitest'
import { boundedStatusText, consumePetSettingsUrl, initialSnapshot, isBridgeClientMessage, isBridgeServerMessage, petSettingsUrl, reducePetEvent } from './index.js'

describe('pet state reducer', () => {
  it('creates and consumes a settings deep link without dropping other URL state', () => {
    const target = petSettingsUrl('http://127.0.0.1:3080/?profile=web#current')
    expect(target).toBe('http://127.0.0.1:3080/?profile=web&xyPet=settings#current')
    expect(consumePetSettingsUrl(target)).toEqual({
      requested: true,
      cleanUrl: 'http://127.0.0.1:3080/?profile=web#current',
    })
  })

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
    expect(isBridgeClientMessage({ type: 'approval-decision', requestId: 'approval-one', sessionId: 'session-one', outcome: 'allowed-once' })).toBe(true)
    expect(isBridgeClientMessage({
      type: 'question-answer',
      requestId: 'question-one',
      sessionId: 'session-one',
      answers: [{ id: 'editor', selected: ['VS Code'] }],
    })).toBe(true)
    expect(isBridgeClientMessage({ type: 'open-client', sessionId: 'session-one' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'treasure-found' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'shutdown-service' })).toBe(true)
    expect(isBridgeClientMessage({ type: 'theme-import-result', requestId: 'import-one', ok: true, themeId: 'whale' })).toBe(true)
    expect(isBridgeServerMessage({ type: 'theme-import', requestId: 'import-one', path: '/tmp/pet.zip' })).toBe(true)
    expect(isBridgeServerMessage({ type: 'quit' })).toBe(true)
    expect(
      isBridgeServerMessage({
        type: 'snapshot',
        snapshot: {
          ...initialSnapshot(0),
          sessions: [{
            id: 'one',
            title: 'Session one',
            state: 'needsInput',
            unread: true,
            updatedAt: 1,
            text: 'Approval required: write_file',
            turn: 2,
            activities: [{ id: 'approval-one', kind: 'needsInput', text: 'Approval required: write_file', time: 1 }],
            approval: { requestId: 'approval-one', toolName: 'write_file' },
            question: {
              requestId: 'question-one',
              questions: [{
                id: 'editor',
                header: 'Editor',
                question: 'Which editor should be used?',
                options: [{ label: 'VS Code', description: 'Use the existing workspace.' }],
              }],
            },
          }],
        },
      }),
    ).toBe(true)
    expect(isBridgeServerMessage({ type: 'approval-result', requestId: 'approval-one', ok: true })).toBe(true)
    expect(isBridgeServerMessage({ type: 'question-result', requestId: 'question-one', ok: true })).toBe(true)
  })

  it('rejects malformed or oversized question data', () => {
    const snapshot = (question: unknown) => ({
      type: 'snapshot',
      snapshot: {
        ...initialSnapshot(0),
        sessions: [{ id: 'one', title: '', state: 'needsInput', unread: true, updatedAt: 1, question }],
      },
    })
    expect(isBridgeServerMessage(snapshot({ requestId: 'q', questions: [{ id: 'one', question: 'Pick one' }] }))).toBe(true)
    expect(isBridgeServerMessage(snapshot({ requestId: 'q', questions: [] }))).toBe(false)
    expect(isBridgeServerMessage(snapshot({ requestId: 'q', questions: [{ id: 'one', question: 'x'.repeat(601) }] }))).toBe(false)
    expect(isBridgeClientMessage({ type: 'question-answer', requestId: 'q', sessionId: 'one', answers: [] })).toBe(false)
    expect(isBridgeClientMessage({
      type: 'question-answer', requestId: 'q', sessionId: 'one', answers: [{ id: 'one', selected: ['x'.repeat(121)] }],
    })).toBe(false)
  })

  it('rejects oversized or unsafe activity timelines', () => {
    const message = (activities: unknown[]) => ({
      type: 'snapshot',
      snapshot: {
        ...initialSnapshot(0),
        sessions: [{ id: 'one', title: '', state: 'thinking', unread: false, updatedAt: 1, activities }],
      },
    })
    expect(isBridgeServerMessage(message([{ id: 'thinking-1', kind: 'thinking', text: 'Thinking', time: 1 }]))).toBe(true)
    expect(isBridgeServerMessage(message([{ id: 'raw', kind: 'tool-payload', text: '{}', time: 1 }]))).toBe(false)
    expect(isBridgeServerMessage(message(Array.from({ length: 17 }, (_, index) => ({ id: String(index), kind: 'thinking', text: 'Thinking', time: index }))))).toBe(false)
    expect(isBridgeServerMessage(message([{ id: 'answer', kind: 'assistant', text: 'x'.repeat(8_000), time: 1 }]))).toBe(true)
    expect(isBridgeServerMessage(message([{ id: 'long', kind: 'assistant', text: 'x'.repeat(8_001), time: 1 }]))).toBe(false)
  })

  it('accepts the cosmetic sleep presentation state', () => {
    expect(isBridgeServerMessage({ type: 'snapshot', snapshot: { ...initialSnapshot(0), state: 'sleep' } })).toBe(true)
  })
})
