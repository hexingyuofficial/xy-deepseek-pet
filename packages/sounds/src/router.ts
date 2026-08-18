import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { SoundChannel, SoundConfig } from './config.js'

export interface SoundRequest {
  eventId: string
  channel: SoundChannel
  sessionId: string
  turn: number
  occurredAt: number
}

class BoundedKeys {
  private readonly values = new Set<string>()
  private readonly order: string[] = []

  constructor(private readonly capacity: number) {}

  add(key: string): boolean {
    if (this.values.has(key)) return false
    this.values.add(key)
    this.order.push(key)
    if (this.order.length > this.capacity) {
      const oldest = this.order.shift()
      if (oldest !== undefined) this.values.delete(oldest)
    }
    return true
  }
}

export class SoundEventRouter {
  private readonly seenEvents = new BoundedKeys(8_192)
  private readonly seenToolCalls = new BoundedKeys(8_192)
  private readonly turnStartedAt = new Map<string, number>()

  constructor(private readonly config: SoundConfig) {}

  route(sessionId: string, event: SessionEvent): SoundRequest | undefined {
    if (!this.seenEvents.add(`${sessionId}:${event.seq}`)) return undefined

    if (event.type === 'turn/start') {
      this.turnStartedAt.set(this.turnKey(sessionId, event.data.turn), event.time)
      return undefined
    }

    if (event.type === 'turn/end') {
      const turnKey = this.turnKey(sessionId, event.data.turn)
      const startedAt = this.turnStartedAt.get(turnKey)
      this.turnStartedAt.delete(turnKey)
      if (event.data.reason.kind !== 'completed') return undefined
      if (startedAt !== undefined && event.time - startedAt < this.config.minimumTurnDurationMs) return undefined
      return this.request('turnComplete', sessionId, event.data.turn, event.seq, event.time)
    }

    if (event.type !== 'tool/result') return undefined
    const callId = String(event.data.message.source.callId)
    if (!this.seenToolCalls.add(`${sessionId}:${event.data.turn}:${callId}`)) return undefined
    const channel: SoundChannel = event.data.message.content[0].isError === true || event.data.error !== undefined
      ? 'toolFailure'
      : 'toolSuccess'
    return this.request(channel, sessionId, event.data.turn, event.seq, event.time)
  }

  private request(
    channel: SoundChannel,
    sessionId: string,
    turn: number,
    sequence: number,
    occurredAt: number,
  ): SoundRequest | undefined {
    if (this.config.masterMute || !this.config.channels[channel].enabled) return undefined
    return { eventId: `${sessionId}:${sequence}`, channel, sessionId, turn, occurredAt }
  }

  private turnKey(sessionId: string, turn: number): string {
    return `${sessionId}:${turn}`
  }
}
