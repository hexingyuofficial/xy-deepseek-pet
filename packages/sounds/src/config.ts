export const SOUND_CHANNELS = ['turnComplete', 'toolSuccess', 'toolFailure'] as const
export type SoundChannel = (typeof SOUND_CHANNELS)[number]

export interface ChannelConfigInput {
  enabled?: boolean
  soundId?: string
  volume?: number
}

export interface Config {
  masterMute?: boolean
  masterVolume?: number
  turnComplete?: ChannelConfigInput
  toolSuccess?: ChannelConfigInput
  toolFailure?: ChannelConfigInput
  minimumTurnDurationMs?: number
  toolCooldownMs?: number
  toolCoalesceMs?: number
  maximumQueueSize?: number
  rootSessionsOnly?: boolean
}

export interface ChannelConfig {
  enabled: boolean
  soundId: string
  volume: number
}

export interface SoundConfig {
  masterMute: boolean
  masterVolume: number
  channels: Record<SoundChannel, ChannelConfig>
  minimumTurnDurationMs: number
  toolCooldownMs: number
  toolCoalesceMs: number
  maximumQueueSize: number
  rootSessionsOnly: boolean
}

const DEFAULT_CHANNELS: Record<SoundChannel, ChannelConfig> = {
  turnComplete: { enabled: true, soundId: 'xy-placeholder-complete', volume: 1 },
  toolSuccess: { enabled: false, soundId: 'xy-placeholder-tool-success', volume: 0.7 },
  toolFailure: { enabled: false, soundId: 'xy-placeholder-tool-failure', volume: 0.9 },
}

function finiteNumber(value: unknown, fallback: number, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(maximum, Math.max(minimum, value))
}

function resolveChannel(channel: SoundChannel, input: ChannelConfigInput | undefined): ChannelConfig {
  const fallback = DEFAULT_CHANNELS[channel]
  const soundId = typeof input?.soundId === 'string' && input.soundId.trim() ? input.soundId.trim() : fallback.soundId
  return {
    enabled: input?.enabled ?? fallback.enabled,
    soundId,
    volume: finiteNumber(input?.volume, fallback.volume, 0, 1),
  }
}

export function resolveSoundConfig(input: Config = {}): SoundConfig {
  return {
    masterMute: input.masterMute ?? false,
    masterVolume: finiteNumber(input.masterVolume, 1, 0, 1),
    channels: {
      turnComplete: resolveChannel('turnComplete', input.turnComplete),
      toolSuccess: resolveChannel('toolSuccess', input.toolSuccess),
      toolFailure: resolveChannel('toolFailure', input.toolFailure),
    },
    minimumTurnDurationMs: finiteNumber(input.minimumTurnDurationMs, 0, 0, 60_000),
    toolCooldownMs: finiteNumber(input.toolCooldownMs, 1_500, 0, 60_000),
    toolCoalesceMs: finiteNumber(input.toolCoalesceMs, 400, 0, 10_000),
    maximumQueueSize: Math.round(finiteNumber(input.maximumQueueSize, 3, 1, 20)),
    rootSessionsOnly: input.rootSessionsOnly ?? true,
  }
}
