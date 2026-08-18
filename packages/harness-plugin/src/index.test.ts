import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { HarnessPetRuntime } from './index.js'

function runtimeFixture() {
  const session = { id: 'session-12345678', header: { cwd: '/work/whale-project' } }
  const agent = { id: session.id, session, status: 'idle', followup: vi.fn() }
  const ctx = {
    logger: () => ({ info: vi.fn(), warn: vi.fn() }),
    agents: {
      get: () => agent,
      roots: () => [agent],
    },
  }
  return { runtime: new HarnessPetRuntime(ctx as never), session, agent }
}

afterEach(() => vi.useRealTimers())

describe('Harness pet session summaries', () => {
  it('does not let a second runtime replace or remove a live rendezvous descriptor', async () => {
    const root = await mkdtemp(join(tmpdir(), 'xy-pet-rendezvous-'))
    const rendezvousPath = join(root, 'bridge.json')
    const first = runtimeFixture().runtime
    const second = runtimeFixture().runtime
    ;(first as any).config.rendezvousPath = rendezvousPath
    ;(second as any).config.rendezvousPath = rendezvousPath
    try {
      await first.start()
      const original = await readFile(rendezvousPath, 'utf8')
      await second.start()
      expect(await readFile(rendezvousPath, 'utf8')).toBe(original)
      await second.stop()
      expect(await readFile(rendezvousPath, 'utf8')).toBe(original)
      await first.stop()
      await expect(readFile(rendezvousPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    } finally {
      await first.stop()
      await second.stop()
      await rm(root, { recursive: true, force: true })
    }
  })

  it('surfaces only the tool name while a tool is running', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'tool/call',
      time: 1,
      data: { name: 'read_file', input: { token: 'must-not-surface' } },
    } as never)

    const summary = (runtime as any).snapshot.sessions[0]
    expect(summary).toMatchObject({ state: 'working', text: 'Using read_file' })
    expect(JSON.stringify(summary)).not.toContain('must-not-surface')
  })

  it('keeps the latest public assistant text when a turn completes', async () => {
    vi.useFakeTimers()
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start',
      time: 1,
      data: {},
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/message',
      time: 2,
      data: { message: { content: [{ type: 'text', text: 'The build is ready.' }, { type: 'reasoning', text: 'private' }] } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/end',
      time: 3,
      data: { reason: { kind: 'completed' } },
    } as never)

    const summary = (runtime as any).snapshot.sessions[0]
    expect(summary).toMatchObject({
      title: '',
      state: 'complete',
      unread: true,
      text: 'The build is ready.',
    })
    expect(JSON.stringify(summary)).not.toContain('private')
    await runtime.stop()
  })

  it('uses the bounded Harness session title when it is published', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'session/title',
      time: 25,
      data: { title: '  Hello   from Harness  ' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/start',
      time: 26,
      data: { turn: 1 },
    } as never)

    expect((runtime as any).snapshot.sessions[0]).toMatchObject({
      title: 'Hello from Harness',
      updatedAt: expect.any(Number),
    })
  })

  it('surfaces question and approval attention without their private payloads', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'tool/call',
      time: 10,
      data: {
        turn: 1,
        step: 1,
        callId: 'question-one',
        name: 'ask_user_question',
        arguments: '{"questions":[{"question":"private full question"}]}',
      },
    } as never)
    expect((runtime as any).snapshot.sessions[0]).toMatchObject({
      state: 'needsInput',
      unread: true,
      text: 'Waiting for your answer',
    })
    expect(JSON.stringify((runtime as any).snapshot)).not.toContain('private full question')

    runtime.onSessionEvent(session as never, {
      type: 'approval/asked',
      time: 11,
      data: { id: 'approval-one', toolName: 'write_file', reason: 'private approval reason' },
    } as never)
    expect((runtime as any).snapshot.sessions[0]).toMatchObject({
      state: 'needsInput',
      unread: true,
      text: 'Approval required: write_file',
    })
    expect(JSON.stringify((runtime as any).snapshot)).not.toContain('private approval reason')

    runtime.onSessionEvent(session as never, {
      type: 'approval/decided',
      time: 12,
      data: { id: 'approval-one', outcome: 'allowed-once' },
    } as never)
    expect((runtime as any).snapshot.sessions[0].text).toBe('Waiting for your answer')

    runtime.onSessionEvent(session as never, {
      type: 'tool/result',
      time: 13,
      data: {
        turn: 1,
        step: 1,
        message: { content: [{ type: 'tool-result', toolCallId: 'question-one', content: [] }] },
      },
    } as never)
    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ state: 'thinking', unread: false, text: 'Thinking' })
  })

  it('streams visible assistant text but never reasoning deltas', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start',
      time: 19,
      data: { turn: 1 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk',
      time: 20,
      data: { chunk: { type: 'reasoning-delta', index: 0, text: 'hidden chain of thought' } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk',
      time: 21,
      data: { chunk: { type: 'text-delta', index: 1, text: 'Public progress' } },
    } as never)
    expect((runtime as any).snapshot.sessions[0].text).toBe('Public progress')
    expect(JSON.stringify((runtime as any).snapshot)).not.toContain('hidden chain of thought')
  })

  it('routes concurrent replies only to the explicitly selected root session', () => {
    const sessions = [
      { id: 'session-one', header: {} },
      { id: 'session-two', header: {} },
    ]
    const agents = sessions.map((session) => ({ id: session.id, session, status: 'idle', followup: vi.fn() }))
    const ctx = {
      logger: () => ({ info: vi.fn(), warn: vi.fn() }),
      agents: {
        get: (id: string) => agents.find((agent) => agent.id === id),
        roots: () => [...agents],
      },
    }
    const runtime = new HarnessPetRuntime(ctx as never)
    const socket = { send: vi.fn() }

    ;(runtime as any).submitChat(socket, 'reply-one', 'message for session two', 'session-two')

    expect(agents[0]!.followup).not.toHaveBeenCalled()
    expect(agents[1]!.followup).toHaveBeenCalledTimes(1)
    expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"ok":true'))

    ;(runtime as any).submitChat(socket, 'reply-two', 'must not fall back', 'missing-session')
    expect(agents[0]!.followup).not.toHaveBeenCalled()
    expect(agents[1]!.followup).toHaveBeenCalledTimes(1)
    expect(socket.send).toHaveBeenLastCalledWith(expect.stringContaining('No active Harness session'))
  })
})
