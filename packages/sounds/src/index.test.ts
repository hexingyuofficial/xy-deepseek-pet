import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { describe, expect, it } from 'vitest'
import { BUILTIN_SOUNDS, resolveBuiltinSound } from './assets.js'
import { resolveSoundConfig } from './config.js'
import { platformLaunchSpec, type PlayableSound, type SoundPlayer } from './player.js'
import { SoundEventRouter, type SoundRequest } from './router.js'
import { SoundScheduler } from './scheduler.js'
import { SoundLibrary } from './library.js'
import { SoundController } from './controller.js'
import { decodeSoundBase64 } from './gateway.js'

function sessionEvent(value: unknown): SessionEvent {
  return value as SessionEvent
}

function turnStart(seq: number, turn: number, time: number): SessionEvent {
  return sessionEvent({ type: 'turn/start', seq, time, data: { turn } })
}

function turnEnd(seq: number, turn: number, time: number, kind: string): SessionEvent {
  const reason = kind === 'error' ? { kind, error: { message: 'failed', code: 'TEST' } } : { kind }
  return sessionEvent({ type: 'turn/end', seq, time, data: { turn, reason } })
}

function toolResult(seq: number, turn: number, callId: string, isError: boolean, internalError = false): SessionEvent {
  return sessionEvent({
    type: 'tool/result',
    seq,
    time: seq * 10,
    data: {
      turn,
      step: 1,
      message: {
        role: 'user',
        source: { kind: 'tool', callId },
        content: [{ type: 'tool-result', toolCallId: callId, content: 'opaque result', isError }],
      },
      ...(internalError ? { error: { name: 'ToolError', code: 'TEST' } } : {}),
    },
  })
}

function request(channel: SoundRequest['channel'], sequence: number, occurredAt = sequence * 1_000): SoundRequest {
  return {
    eventId: `session:${sequence}`,
    channel,
    sessionId: 'session',
    turn: 1,
    occurredAt,
  }
}

class RecordingPlayer implements SoundPlayer {
  readonly played: Array<{ id: string; volume: number }> = []
  active = 0
  maximumActive = 0
  stopped = false

  async play(asset: PlayableSound, volume: number): Promise<void> {
    this.active += 1
    this.maximumActive = Math.max(this.maximumActive, this.active)
    this.played.push({ id: asset.id, volume })
    await new Promise((resolve) => setTimeout(resolve, 2))
    this.active -= 1
  }

  stop(): void {
    this.stopped = true
  }
}

class InterruptiblePlayer implements SoundPlayer {
  readonly played: string[] = []
  readonly stopped: string[] = []
  private release: (() => void) | undefined

  play(asset: PlayableSound): Promise<void> {
    this.played.push(asset.id)
    if (asset.channels.includes('turnComplete')) return Promise.resolve()
    return new Promise((resolve) => { this.release = resolve })
  }

  stop(): void {
    this.stopped.push(this.played.at(-1) ?? 'none')
    this.release?.()
    this.release = undefined
  }
}

describe('sound configuration', () => {
  it('enables completion only and clamps volume by default', () => {
    const config = resolveSoundConfig({ masterVolume: 5, toolFailure: { volume: -1 } })
    expect(config.masterVolume).toBe(1)
    expect(config.channels.turnComplete.enabled).toBe(true)
    expect(config.channels.toolSuccess.enabled).toBe(false)
    expect(config.channels.toolFailure).toMatchObject({ enabled: false, volume: 0 })
  })
})

describe('sound event router', () => {
  it('emits completion exactly once and ignores non-completed endings', () => {
    const router = new SoundEventRouter(resolveSoundConfig())
    router.route('one', turnStart(1, 1, 100))
    const completed = turnEnd(2, 1, 500, 'completed')
    expect(router.route('one', completed)?.channel).toBe('turnComplete')
    expect(router.route('one', completed)).toBeUndefined()
    expect(router.route('one', turnEnd(3, 2, 600, 'blocked'))).toBeUndefined()
    expect(router.route('one', turnEnd(4, 3, 700, 'error'))).toBeUndefined()
  })

  it('routes explicit tool outcomes and suppresses replacement results by call id', () => {
    const config = resolveSoundConfig({ toolSuccess: { enabled: true }, toolFailure: { enabled: true } })
    const router = new SoundEventRouter(config)
    expect(router.route('one', toolResult(1, 1, 'call-success', false))?.channel).toBe('toolSuccess')
    expect(router.route('one', toolResult(2, 1, 'call-failure', true))?.channel).toBe('toolFailure')
    expect(router.route('one', toolResult(3, 1, 'call-internal', false, true))?.channel).toBe('toolFailure')
    expect(router.route('one', toolResult(4, 1, 'call-success', false))).toBeUndefined()
  })

  it('supports an optional short-task completion silence window', () => {
    const router = new SoundEventRouter(resolveSoundConfig({ minimumTurnDurationMs: 1_000 }))
    router.route('one', turnStart(1, 4, 100))
    expect(router.route('one', turnEnd(2, 4, 900, 'completed'))).toBeUndefined()
  })
})

describe('sound scheduler', () => {
  it('serializes playback, applies volume, and lets completion supersede queued tool audio', async () => {
    const config = resolveSoundConfig({
      masterVolume: 0.5,
      toolSuccess: { enabled: true, volume: 0.4 },
      toolFailure: { enabled: true },
      toolCooldownMs: 0,
      toolCoalesceMs: 0,
    })
    const player = new RecordingPlayer()
    const scheduler = new SoundScheduler(config, player)
    scheduler.enqueue(request('toolSuccess', 1))
    scheduler.enqueue(request('toolFailure', 2))
    scheduler.enqueue(request('turnComplete', 3))
    await scheduler.idle()
    expect(player.maximumActive).toBe(1)
    expect(player.played.map((item) => item.id)).toEqual([
      'xy-placeholder-tool-success',
      'xy-placeholder-complete',
    ])
    expect(player.played.find((item) => item.id === 'xy-placeholder-tool-success')?.volume).toBeCloseTo(0.2)
  })

  it('coalesces repeated tool outcomes and stops its player', async () => {
    const config = resolveSoundConfig({ toolFailure: { enabled: true }, toolCooldownMs: 0, toolCoalesceMs: 400 })
    const player = new RecordingPlayer()
    const scheduler = new SoundScheduler(config, player)
    expect(scheduler.enqueue(request('toolFailure', 1, 1_000))).toBe(true)
    expect(scheduler.enqueue(request('toolFailure', 2, 1_200))).toBe(false)
    await scheduler.idle()
    scheduler.stop()
    expect(player.played).toHaveLength(1)
    expect(player.stopped).toBe(true)
  })

  it('interrupts an active tool sound when the whole turn completes', async () => {
    const config = resolveSoundConfig({ toolSuccess: { enabled: true }, toolCooldownMs: 0, toolCoalesceMs: 0 })
    const player = new InterruptiblePlayer()
    const scheduler = new SoundScheduler(config, player)
    scheduler.enqueue(request('toolSuccess', 1))
    await new Promise((resolve) => setTimeout(resolve, 0))
    scheduler.enqueue(request('turnComplete', 2))
    await scheduler.idle()
    expect(player.stopped).toEqual(['xy-placeholder-tool-success'])
    expect(player.played).toEqual(['xy-placeholder-tool-success', 'xy-placeholder-complete'])
  })

  it('resolves a custom sound without changing event routing', async () => {
    const custom: PlayableSound = {
      id: 'xy-custom-test', displayName: 'Custom', file: 'custom.wav',
      channels: ['turnComplete'], path: '/tmp/custom.wav',
    }
    const player = new RecordingPlayer()
    const config = resolveSoundConfig({ turnComplete: { soundId: custom.id } })
    const scheduler = new SoundScheduler(config, player, Date.now, (id) => id === custom.id ? custom : undefined)
    expect(scheduler.enqueue(request('turnComplete', 1))).toBe(true)
    await scheduler.idle()
    expect(player.played[0]?.id).toBe(custom.id)
  })
})

describe('sound assets and platform launch', () => {
  it('keeps user-controlled paths out of fixed command text', () => {
    const path = '/tmp/sounds/a file; touch nope.wav'
    const mac = platformLaunchSpec('darwin', path, 0.5)
    const windows = platformLaunchSpec('win32', path, 0.5, 'C:\\Program Files\\XY Sounds\\play-sound.ps1')
    expect(mac?.args.at(-1)).toBe(path)
    expect(windows?.args).toContain(path)
    expect(windows?.args).not.toContain(`-Command ${path}`)
    expect(windows?.args.slice(0, windows.args.indexOf(path)).join(' ')).not.toContain(path)
  })

  it('matches every built-in file to its provenance digest', async () => {
    const provenance = JSON.parse(
      await readFile(new URL('../assets/provenance.json', import.meta.url), 'utf8'),
    ) as { assets: Array<{ id: string; sha256: string }> }
    expect(BUILTIN_SOUNDS).toHaveLength(3)
    for (const asset of BUILTIN_SOUNDS) {
      const resolved = resolveBuiltinSound(asset.id, asset.channels[0]!)
      const bytes = await readFile(resolved!.path)
      const record = provenance.assets.find((candidate) => candidate.id === asset.id)
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(record?.sha256)
    }
  })

  it('imports a validated short WAV into an atomic managed library', async () => {
    const root = await mkdtemp(join(tmpdir(), 'xy-sounds-test-'))
    try {
      const library = new SoundLibrary(root)
      await library.initialize()
      const source = join(root, 'source.wav')
      await writeFile(source, await readFile(new URL('../assets/default-complete.wav', import.meta.url)))
      const imported = await library.importFile(source, '我的完成音 / Complete')
      expect(imported.id).toMatch(/^xy-custom-/)
      expect(imported.displayName).toBe('我的完成音  Complete')
      expect(library.list()).toHaveLength(1)
      await library.remove(imported.id)
      expect(library.list()).toHaveLength(0)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('imports a browser buffer and rejects malformed or oversized payloads', async () => {
    const root = await mkdtemp(join(tmpdir(), 'xy-sounds-buffer-test-'))
    try {
      const library = new SoundLibrary(root)
      await library.initialize()
      const bytes = await readFile(new URL('../assets/default-complete.wav', import.meta.url))
      const imported = await library.importBuffer(bytes, '../my sound.wav')
      expect(imported.displayName).toBe('my sound')
      await expect(library.importBuffer(Buffer.from('not audio'), 'bad.wav')).rejects.toThrow('signature')
      expect(decodeSoundBase64(bytes.toString('base64'))).toEqual(bytes)
      expect(() => decodeSoundBase64('%%%%')).toThrow('Invalid base64')
      expect(() => decodeSoundBase64(Buffer.alloc(10 * 1024 * 1024 + 1).toString('base64'))).toThrow('10 MiB')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('persists custom selection and falls back after deletion', async () => {
    const root = await mkdtemp(join(tmpdir(), 'xy-sounds-controller-test-'))
    const bytes = await readFile(new URL('../assets/default-complete.wav', import.meta.url))
    try {
      const controller = await SoundController.create({}, new RecordingPlayer(), root)
      let snapshot = await controller.importSound(bytes, 'custom.wav')
      const custom = snapshot.sounds.find((sound) => !sound.builtIn)
      expect(custom).toBeDefined()
      const next = structuredClone(snapshot.config)
      next.channels.turnComplete.soundId = custom!.id
      snapshot = await controller.update(next)
      expect(snapshot.config.channels.turnComplete.soundId).toBe(custom!.id)
      expect(snapshot.sounds.every((sound) => !('path' in sound))).toBe(true)
      controller.stop()

      const restored = await SoundController.create({}, new RecordingPlayer(), root)
      expect(restored.config.channels.turnComplete.soundId).toBe(custom!.id)
      snapshot = await restored.removeSound(custom!.id)
      expect(snapshot.config.channels.turnComplete.soundId).toBe('xy-placeholder-complete')
      restored.stop()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
