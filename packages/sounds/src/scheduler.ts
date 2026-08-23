import { resolveBuiltinSound } from './assets.js'
import type { SoundChannel, SoundConfig } from './config.js'
import type { PlayableSound, SoundPlayer } from './player.js'
import type { SoundRequest } from './router.js'

const PRIORITY: Record<SoundChannel, number> = {
  turnComplete: 3,
  toolFailure: 2,
  toolSuccess: 1,
}

interface QueuedSound {
  request: SoundRequest
  volume: number
  asset: PlayableSound
}

export type SoundResolver = (soundId: string, channel: SoundChannel) => PlayableSound | undefined

export class SoundScheduler {
  private queue: QueuedSound[] = []
  private lastToolStartedAt = Number.NEGATIVE_INFINITY
  private readonly lastAcceptedByChannel = new Map<SoundChannel, number>()
  private drainPromise: Promise<void> | undefined
  private waitTimer: NodeJS.Timeout | undefined
  private waitResolver: (() => void) | undefined
  private active: QueuedSound | undefined
  private stopped = false

  constructor(
    private readonly config: SoundConfig,
    private readonly player: SoundPlayer,
    private readonly now: () => number = Date.now,
    private readonly resolveSound: SoundResolver = resolveBuiltinSound,
  ) {}

  enqueue(request: SoundRequest): boolean {
    if (this.stopped || this.config.masterMute) return false
    const channelConfig = this.config.channels[request.channel]
    if (!channelConfig.enabled) return false
    const asset = this.resolveSound(channelConfig.soundId, request.channel)
    if (!asset) return false

    if (request.channel !== 'turnComplete') {
      const lastAccepted = this.lastAcceptedByChannel.get(request.channel)
      if (lastAccepted !== undefined && request.occurredAt - lastAccepted < this.config.toolCoalesceMs) return false
      this.lastAcceptedByChannel.set(request.channel, request.occurredAt)
    } else {
      this.queue = this.queue.filter(
        (queued) => queued.request.sessionId !== request.sessionId || queued.request.turn !== request.turn,
      )
      if (this.active?.request.channel !== undefined && this.active.request.channel !== 'turnComplete') {
        this.player.stop()
      }
    }

    this.queue.push({
      request,
      asset,
      volume: Math.min(1, this.config.masterVolume * channelConfig.volume),
    })
    this.queue.sort((left, right) => PRIORITY[right.request.channel] - PRIORITY[left.request.channel])
    if (this.queue.length > this.config.maximumQueueSize) this.queue.length = this.config.maximumQueueSize
    this.startDrain()
    return true
  }

  async idle(): Promise<void> {
    await this.drainPromise
  }

  stop(): void {
    this.stopped = true
    this.queue = []
    if (this.waitTimer) clearTimeout(this.waitTimer)
    this.waitTimer = undefined
    this.waitResolver?.()
    this.waitResolver = undefined
    this.player.stop()
  }

  private startDrain(): void {
    if (this.drainPromise) return
    this.drainPromise = this.drain().finally(() => {
      this.drainPromise = undefined
      if (this.queue.length > 0 && !this.stopped) this.startDrain()
    })
  }

  private async drain(): Promise<void> {
    while (!this.stopped) {
      const next = this.queue.shift()
      if (!next) return
      if (next.request.channel !== 'turnComplete') {
        const delayMs = Math.max(0, this.lastToolStartedAt + this.config.toolCooldownMs - this.now())
        if (delayMs > 0) await this.wait(delayMs)
        if (this.stopped) return
        this.lastToolStartedAt = this.now()
      }
      this.active = next
      await this.player.play(next.asset, next.volume).catch(() => undefined)
      if (this.active === next) this.active = undefined
    }
  }

  private wait(delayMs: number): Promise<void> {
    return new Promise((resolveWait) => {
      this.waitResolver = resolveWait
      this.waitTimer = setTimeout(() => {
        this.waitTimer = undefined
        this.waitResolver = undefined
        resolveWait()
      }, delayMs)
    })
  }
}
