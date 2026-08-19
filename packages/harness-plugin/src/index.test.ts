import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { HarnessPetRuntime } from './index.js'
import { createDesktopLauncher } from './desktop-launcher.js'

vi.mock('./desktop-launcher.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./desktop-launcher.js')>()
  return {
    ...actual,
    createDesktopLauncher: vi.fn(actual.createDesktopLauncher),
  }
})

function runtimeFixture() {
  const session = { id: 'session-12345678', header: { cwd: '/work/whale-project' }, events: [] as any[] }
  const agent = { id: session.id, session, status: 'idle', followup: vi.fn() }
  const apiProxy = {
    events: { mux: vi.fn(async function* () {}) },
    respond: vi.fn(async () => ({ accepted: true as const })),
  }
  const ctx = {
    logger: () => ({ info: vi.fn(), warn: vi.fn() }),
    apiProxy,
    agents: {
      get: () => agent,
      roots: () => [agent],
    },
  }
  return { runtime: new HarnessPetRuntime(ctx as never), session, agent, apiProxy }
}

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('Harness pet session summaries', () => {
  it('closes a running macOS pet before replacing its launcher and reopens it', async () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    const { runtime } = runtimeFixture()
    const status = vi.spyOn(runtime, 'desktopStatus').mockReturnValueOnce(true).mockReturnValue(false)
    const close = vi.spyOn(runtime, 'closeDesktop').mockReturnValue(true)
    const open = vi.spyOn(runtime, 'openDesktop').mockReturnValue(true)
    vi.mocked(createDesktopLauncher).mockReturnValueOnce({ displayName: 'DeepSeek Harness', platform: 'macOS' })

    await expect(runtime.createLauncher('DeepSeek Harness', 'calm', '', '')).resolves.toEqual({
      displayName: 'DeepSeek Harness',
      platform: 'macOS',
    })

    expect(status).toHaveBeenCalledTimes(2)
    expect(close).toHaveBeenCalledOnce()
    expect(createDesktopLauncher).toHaveBeenCalledOnce()
    expect(open).toHaveBeenCalledOnce()
    expect(close.mock.invocationCallOrder[0]!).toBeLessThan(vi.mocked(createDesktopLauncher).mock.invocationCallOrder[0]!)
    expect(vi.mocked(createDesktopLauncher).mock.invocationCallOrder[0]!).toBeLessThan(open.mock.invocationCallOrder[0]!)
  })

  it('reopens a running macOS pet when launcher replacement fails', async () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    const { runtime } = runtimeFixture()
    vi.spyOn(runtime, 'desktopStatus').mockReturnValueOnce(true).mockReturnValue(false)
    vi.spyOn(runtime, 'closeDesktop').mockReturnValue(true)
    const open = vi.spyOn(runtime, 'openDesktop').mockReturnValue(true)
    vi.mocked(createDesktopLauncher).mockImplementationOnce(() => { throw new Error('replacement failed') })

    await expect(runtime.createLauncher('DeepSeek Harness', 'calm', '', '')).rejects.toThrow('replacement failed')
    expect(open).toHaveBeenCalledOnce()
  })

  it('reopens a running macOS pet when it does not close before the timeout', async () => {
    vi.useFakeTimers()
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    const { runtime } = runtimeFixture()
    vi.spyOn(runtime, 'desktopStatus').mockReturnValue(true)
    vi.spyOn(runtime, 'closeDesktop').mockReturnValue(true)
    const open = vi.spyOn(runtime, 'openDesktop').mockReturnValue(true)

    const replacement = runtime.createLauncher('DeepSeek Harness', 'calm', '', '')
    const rejection = expect(replacement).rejects.toThrow('Close the desktop pet')
    await vi.advanceTimersByTimeAsync(5_100)

    await rejection
    expect(createDesktopLauncher).not.toHaveBeenCalled()
    expect(open).toHaveBeenCalledOnce()
  })

  it('logs a bounded diagnostic when the desktop process exits unsuccessfully', async () => {
    const root = await mkdtemp(join(tmpdir(), 'xy-pet-desktop-exit-'))
    const entry = join(root, 'fail.mjs')
    const logger = { info: vi.fn(), warn: vi.fn() }
    const ctx = {
      logger: () => logger,
      agents: { get: () => undefined, roots: () => [] },
    }
    const runtime = new HarnessPetRuntime(ctx as never, {
      desktopCommand: process.execPath,
      desktopEntry: entry,
    })
    try {
      await writeFile(entry, "process.stderr.write('Electron runtime unavailable\\n'); process.exit(7)\n")
      await runtime.start()
      expect(runtime.openDesktop()).toBe(true)
      await vi.waitFor(() => {
        expect(logger.warn).toHaveBeenCalledWith('desktop exited with code 7: Electron runtime unavailable')
      })
    } finally {
      await runtime.stop()
      await rm(root, { recursive: true, force: true })
    }
  })

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
    await vi.advanceTimersByTimeAsync(500)

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

  it('restores the latest Harness-generated title from an existing session log', () => {
    const { runtime, session, agent } = runtimeFixture()
    session.events.push({
      type: 'session/title',
      seq: 8,
      time: 20,
      data: { title: '  Download the project  ', messageSeqs: [1], source: { kind: 'fallback' } },
    })

    runtime.onAgentCreated(agent as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/start',
      time: 21,
      data: { turn: 2 },
    } as never)

    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ title: 'Download the project' })
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

  it('builds a bounded public activity waterfall and coalesces streamed assistant text', async () => {
    vi.useFakeTimers()
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 50, data: { turn: 3 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/call', time: 51, data: { turn: 3, step: 1, callId: 'tool-one', name: 'read_file', arguments: '{"secret":"never surface"}' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/result', time: 52, data: { turn: 3, step: 1, message: { content: [{ type: 'tool-result', toolCallId: 'tool-one', content: ['private result'] }] } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk', time: 53, data: { chunk: { type: 'text-delta', index: 0, text: 'Public ' } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk', time: 54, data: { chunk: { type: 'text-delta', index: 0, text: 'answer' } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/end', time: 55, data: { reason: { kind: 'completed' } },
    } as never)
    await vi.advanceTimersByTimeAsync(500)

    const activities = (runtime as any).snapshot.sessions[0].activities
    expect(activities.map(({ kind, text }: any) => [kind, text])).toEqual([
      ['thinking', 'Thinking'],
      ['tool', 'Using read_file'],
      ['thinking', 'Thinking'],
      ['assistant', 'Public answer'],
      ['complete', 'Done'],
    ])
    expect(JSON.stringify(activities)).not.toContain('secret')
    expect(JSON.stringify(activities)).not.toContain('private result')
  })

  it('shows the newest public assistant segment after tools in the compact summary', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 60, data: { turn: 4 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk', time: 61, data: { chunk: { type: 'text-delta', index: 0, text: '好嘞，先让我搜索一下。' } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/call', time: 62, data: { turn: 4, step: 1, callId: 'search-one', name: 'search' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/result', time: 63, data: { turn: 4, step: 1, message: { content: [{ type: 'tool-result', toolCallId: 'search-one', content: [] }] } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk', time: 64, data: { chunk: { type: 'text-delta', index: 0, text: '找到了！' } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/chunk', time: 65, data: { chunk: { type: 'text-delta', index: 0, text: '下面分两段介绍。' } },
    } as never)

    const summary = (runtime as any).snapshot.sessions[0]
    expect(summary.text).toBe('找到了！下面分两段介绍。')
    expect(summary.activities.filter(({ kind }: any) => kind === 'assistant').map(({ text }: any) => text)).toEqual([
      '好嘞，先让我搜索一下。',
      '找到了！下面分两段介绍。',
    ])
  })

  it('keeps one official turn identity through tools and resumed thinking', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start',
      time: 30,
      data: { turn: 7 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/call',
      time: 31,
      data: { turn: 7, step: 1, callId: 'tool-one', name: 'read_file' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/result',
      time: 32,
      data: { turn: 7, step: 1, message: { content: [{ type: 'tool-result', toolCallId: 'tool-one', content: [] }] } },
    } as never)

    expect((runtime as any).snapshot).toMatchObject({ state: 'thinking', turn: 7 })
    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ state: 'thinking', turn: 7 })
  })

  it('keeps every tool and resumed-thinking step across internal turns', () => {
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 70, data: { turn: 1 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/call', time: 71, data: { turn: 1, step: 1, callId: 'tool-one', name: 'read_file' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/result', time: 72, data: { turn: 1, step: 1, message: { content: [{ type: 'tool-result', toolCallId: 'tool-one', content: [] }] } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 73, data: { turn: 2 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/call', time: 74, data: { turn: 2, step: 1, callId: 'tool-two', name: 'write_file' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/result', time: 75, data: { turn: 2, step: 1, message: { content: [{ type: 'tool-result', toolCallId: 'tool-two', content: [] }] } },
    } as never)

    expect((runtime as any).snapshot.sessions[0].activities.map(({ kind, text }: any) => [kind, text])).toEqual([
      ['thinking', 'Thinking'],
      ['tool', 'Using read_file'],
      ['thinking', 'Thinking'],
      ['tool', 'Using write_file'],
      ['thinking', 'Thinking'],
    ])
  })

  it('does not publish completion when an internal turn continues during settling', async () => {
    vi.useFakeTimers()
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 80, data: { turn: 1 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/end', time: 81, data: { reason: { kind: 'completed' } },
    } as never)
    await vi.advanceTimersByTimeAsync(250)
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 82, data: { turn: 2 },
    } as never)
    await vi.advanceTimersByTimeAsync(500)

    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ state: 'thinking', turn: 2, unread: false })
    expect((runtime as any).snapshot.sessions[0].activities.some(({ kind }: any) => kind === 'complete')).toBe(false)
  })

  it('waits for a late agent idle signal without losing the completion', async () => {
    vi.useFakeTimers()
    const { runtime, session, agent } = runtimeFixture()
    ;(agent as any).status = 'running'
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 85, data: { turn: 1 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/message', time: 86, data: { message: { content: [{ type: 'text', text: 'Final answer' }] } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/end', time: 87, data: { reason: { kind: 'completed' } },
    } as never)
    await vi.advanceTimersByTimeAsync(1_000)
    expect((runtime as any).snapshot.sessions[0].state).toBe('thinking')

    runtime.onAgentStatus(agent as never, 'idle')
    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ state: 'complete', text: 'Final answer', unread: true })
  })

  it('does not complete or discard a pending choice when its model turn ends', async () => {
    vi.useFakeTimers()
    const { runtime, session, agent } = runtimeFixture()
    ;(runtime as any).onApiFrame({
      rpcId: 'question-between-turns',
      payload: {
        type: 'question/requested',
        sessionId: agent.id,
        questions: [{ id: 'choice', question: 'Pick one', options: [{ label: 'A' }, { label: 'B' }] }],
      },
    })
    runtime.onSessionEvent(session as never, {
      type: 'turn/end', time: 90, data: { reason: { kind: 'completed' } },
    } as never)
    await vi.advanceTimersByTimeAsync(1_000)

    expect((runtime as any).snapshot.sessions[0]).toMatchObject({
      state: 'needsInput',
      question: { requestId: 'question-between-turns' },
    })
    expect((runtime as any).pendingQuestionAnswers.has('question-between-turns')).toBe(true)
    expect((runtime as any).snapshot.sessions[0].activities.some(({ kind }: any) => kind === 'complete')).toBe(false)
  })

  it('does not complete between a tool call and its result', async () => {
    vi.useFakeTimers()
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start', time: 100, data: { turn: 1 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'tool/call', time: 101, data: { turn: 1, step: 1, callId: 'tool-pending', name: 'read_file' },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/end', time: 102, data: { reason: { kind: 'completed' } },
    } as never)
    await vi.advanceTimersByTimeAsync(1_000)

    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ state: 'working', text: 'Using read_file' })
    expect((runtime as any).activeToolCalls.get(session.id)?.has('tool-pending')).toBe(true)
    expect((runtime as any).snapshot.sessions[0].activities.some(({ kind }: any) => kind === 'complete')).toBe(false)
  })

  it('does not borrow another active session turn while sessions interleave', () => {
    const sessions = [
      { id: 'session-one', header: {}, events: [] },
      { id: 'session-two', header: {}, events: [] },
    ]
    const agents = sessions.map((session) => ({ id: session.id, session, status: 'running', followup: vi.fn() }))
    const ctx = {
      logger: () => ({ info: vi.fn(), warn: vi.fn() }),
      agents: {
        get: (id: string) => agents.find((agent) => agent.id === id),
        roots: () => [...agents],
      },
    }
    const runtime = new HarnessPetRuntime(ctx as never)

    runtime.onSessionEvent(sessions[0] as never, {
      type: 'turn/start',
      time: 40,
      data: { turn: 5 },
    } as never)
    runtime.onSessionEvent(sessions[1] as never, {
      type: 'turn/start',
      time: 41,
      data: { turn: 10 },
    } as never)
    runtime.onSessionEvent(sessions[0] as never, {
      type: 'tool/call',
      time: 42,
      data: { turn: 5, step: 1, callId: 'tool-one', name: 'read_file' },
    } as never)

    expect((runtime as any).snapshot).toMatchObject({ sessionId: 'session-one', state: 'working', turn: 5 })

    runtime.onSessionEvent(sessions[0] as never, {
      type: 'tool/result',
      time: 43,
      data: { turn: 5, step: 1, message: { content: [{ type: 'tool-result', toolCallId: 'tool-one', content: [] }] } },
    } as never)
    expect((runtime as any).snapshot).toMatchObject({ sessionId: 'session-one', state: 'thinking', turn: 5 })
  })

  it('submits a mirrored pet approval through the official Web approval request', async () => {
    const { runtime, agent, apiProxy } = runtimeFixture()
    const socket = { send: vi.fn() }
    ;(runtime as any).authenticatedDesktop = () => socket
    ;(runtime as any).onApiFrame({
      rpcId: 'rpc-one',
      payload: {
        type: 'approval/requested',
        sessionId: agent.id,
        approvalId: 'approval-one',
        toolName: 'write_file',
        reason: 'private command and path',
      },
    })
    const summary = (runtime as any).snapshot.sessions[0]
    expect(summary).toMatchObject({
      state: 'needsInput',
      approval: { toolName: 'write_file', requestId: 'rpc-one' },
    })
    expect(JSON.stringify((runtime as any).snapshot)).not.toContain('private command and path')

    await (runtime as any).decideApproval(socket, {
      type: 'approval-decision',
      requestId: summary.approval.requestId,
      sessionId: agent.id,
      outcome: 'allowed-once',
    })
    expect(apiProxy.respond).toHaveBeenCalledWith({
      type: 'client-response',
      rpcId: 'rpc-one',
      result: {
        ok: true,
        value: { sessionId: agent.id, approvalId: 'approval-one', outcome: 'allowed-once' },
      },
    })
    expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"approval-result"'))
  })

  it('closes the mirrored pet approval when the official Web client answers', () => {
    const { runtime, agent, apiProxy } = runtimeFixture()
    ;(runtime as any).onApiFrame({
      rpcId: 'rpc-web',
      payload: { type: 'approval/requested', sessionId: agent.id, approvalId: 'approval-web', toolName: 'bash' },
    })
    expect((runtime as any).snapshot.sessions[0].approval).toBeDefined()

    ;(runtime as any).onApiFrame({
      rpcId: 'resolved-web',
      payload: { type: 'approval/resolved', sessionId: agent.id, approvalId: 'approval-web', outcome: 'rejected' },
    })

    expect((runtime as any).snapshot.sessions[0].approval).toBeUndefined()
    expect((runtime as any).pendingApprovalAnswers.size).toBe(0)
    expect(apiProxy.respond).not.toHaveBeenCalled()
  })

  it('mirrors official questions and submits the answer through the official request', async () => {
    const { runtime, agent, apiProxy } = runtimeFixture()
    const socket = { send: vi.fn() }
    ;(runtime as any).authenticatedDesktop = () => socket
    ;(runtime as any).onApiFrame({
      rpcId: 'question-rpc',
      payload: {
        type: 'question/requested',
        sessionId: agent.id,
        questions: [{
          id: 'editor',
          header: 'Editor',
          question: 'Which editor should be used?',
          detail: 'Choose the editor for this workspace.',
          options: [{ label: 'VS Code', description: 'Use the current setup.' }, { label: 'Zed' }],
          multiSelect: false,
        }],
        hiddenReasoning: 'must never cross the bridge',
      },
    })

    const summary = (runtime as any).snapshot.sessions[0]
    expect(summary).toMatchObject({
      state: 'needsInput',
      text: 'Choice required',
      question: {
        requestId: 'question-rpc',
        questions: [{ id: 'editor', question: 'Which editor should be used?' }],
      },
    })
    expect(JSON.stringify((runtime as any).snapshot)).not.toContain('hiddenReasoning')

    await (runtime as any).answerQuestion(socket, {
      type: 'question-answer',
      requestId: 'question-rpc',
      sessionId: agent.id,
      answers: [{ id: 'editor', selected: ['VS Code'] }],
    })

    expect(apiProxy.respond).toHaveBeenCalledWith({
      type: 'client-response',
      rpcId: 'question-rpc',
      result: {
        ok: true,
        value: { sessionId: agent.id, answer: { answers: [{ id: 'editor', selected: ['VS Code'] }] } },
      },
    })
    expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"question-result"'))
    expect((runtime as any).snapshot.sessions[0].question).toBeUndefined()
  })

  it('closes a mirrored question when the Web client answers it', () => {
    const { runtime, agent, apiProxy } = runtimeFixture()
    ;(runtime as any).onApiFrame({
      rpcId: 'question-web',
      payload: {
        type: 'question/requested',
        sessionId: agent.id,
        questions: [{ id: 'choice', question: 'Pick one', options: [{ label: 'A' }, { label: 'B' }] }],
      },
    })
    expect((runtime as any).snapshot.sessions[0].question).toBeDefined()

    ;(runtime as any).onApiFrame({
      rpcId: 'resolved-question-web',
      payload: { type: 'question/resolved', sessionId: agent.id, questionRpcId: 'question-web', outcome: 'answered' },
    })

    expect((runtime as any).snapshot.sessions[0].question).toBeUndefined()
    expect((runtime as any).pendingQuestionAnswers.size).toBe(0)
    expect(apiProxy.respond).not.toHaveBeenCalled()
  })

  it('rejects invalid question answers and does not surface malformed official question payloads', async () => {
    const { runtime, agent, apiProxy } = runtimeFixture()
    const socket = { send: vi.fn() }
    ;(runtime as any).authenticatedDesktop = () => socket
    ;(runtime as any).onApiFrame({
      rpcId: 'malformed-question',
      payload: {
        type: 'question/requested',
        sessionId: agent.id,
        questions: [{ id: 'duplicate', question: 'One' }, { id: 'duplicate', question: 'Two' }],
        rawPayload: 'private tool input',
      },
    })
    expect((runtime as any).pendingQuestionAnswers.size).toBe(0)
    expect(JSON.stringify((runtime as any).snapshot)).not.toContain('private tool input')

    ;(runtime as any).onApiFrame({
      rpcId: 'valid-question',
      payload: {
        type: 'question/requested',
        sessionId: agent.id,
        questions: [{ id: 'choice', question: 'Pick one', options: [{ label: 'A' }, { label: 'B' }] }],
      },
    })
    await (runtime as any).answerQuestion(socket, {
      type: 'question-answer', requestId: 'valid-question', sessionId: agent.id,
      answers: [{ id: 'choice', selected: ['not-an-option'] }],
    })
    expect(apiProxy.respond).not.toHaveBeenCalled()
    expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('answer is invalid'))
  })

  it('rejects approval decisions from a different session or desktop connection', async () => {
    const { runtime, agent } = runtimeFixture()
    const owner = { send: vi.fn() }
    const stranger = { send: vi.fn() }
    ;(runtime as any).authenticatedDesktop = () => owner
    ;(runtime as any).onApiFrame({
      rpcId: 'rpc-owner',
      payload: { type: 'approval/requested', sessionId: agent.id, approvalId: 'approval-owner', toolName: 'write_file' },
    })
    const requestId = 'rpc-owner'
    await (runtime as any).decideApproval(stranger, {
      type: 'approval-decision', requestId, sessionId: agent.id, outcome: 'allowed-once',
    })
    await (runtime as any).decideApproval(owner, {
      type: 'approval-decision', requestId, sessionId: 'another-session', outcome: 'allowed-once',
    })

    expect((runtime as any).pendingApprovalAnswers.has(requestId)).toBe(true)
    expect(stranger.send).toHaveBeenCalledWith(expect.stringContaining('no longer available'))
    expect(owner.send).toHaveBeenCalledWith(expect.stringContaining('no longer available'))

    await (runtime as any).decideApproval(owner, {
      type: 'approval-decision', requestId, sessionId: agent.id, outcome: 'rejected',
    })
    expect((runtime as any).pendingApprovalAnswers.size).toBe(0)
  })

  it('removes a withdrawn official approval without submitting a decision', () => {
    const { runtime, agent, apiProxy } = runtimeFixture()
    ;(runtime as any).onApiFrame({
      rpcId: 'rpc-cancelled',
      payload: { type: 'approval/requested', sessionId: agent.id, approvalId: 'approval-cancelled', toolName: 'write_file' },
    })
    ;(runtime as any).onApiFrame({
      rpcId: 'resolved-cancelled',
      payload: { type: 'approval/resolved', sessionId: agent.id, approvalId: 'approval-cancelled', outcome: 'cancelled' },
    })

    expect((runtime as any).pendingApprovalAnswers.size).toBe(0)
    expect(apiProxy.respond).not.toHaveBeenCalled()
  })

  it('routes concurrent replies only to the explicitly selected root session', () => {
    const sessions = [
      { id: 'session-one', header: {}, events: [] },
      { id: 'session-two', header: {}, events: [] },
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

  it('retains an acknowledged idle session as a reply target without surfacing its text', async () => {
    vi.useFakeTimers()
    const { runtime, session } = runtimeFixture()
    runtime.onSessionEvent(session as never, {
      type: 'turn/start',
      time: 1,
      data: { turn: 1 },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'assistant/message',
      time: 2,
      data: { message: { content: [{ type: 'text', text: 'Visible reply' }] } },
    } as never)
    runtime.onSessionEvent(session as never, {
      type: 'turn/end',
      time: 3,
      data: { reason: { kind: 'completed' } },
    } as never)
    await vi.advanceTimersByTimeAsync(500)

    ;(runtime as any).acknowledge(session.id)

    expect((runtime as any).snapshot.sessions[0]).toMatchObject({ id: session.id, state: 'idle', unread: false })
    expect((runtime as any).snapshot.sessions[0].text).toBeUndefined()
  })
})
