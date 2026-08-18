import { z } from 'zod'

const channel = z.enum(['turnComplete', 'toolSuccess', 'toolFailure'])
const channelConfig = z.object({
  enabled: z.boolean(),
  soundId: z.string().min(1).max(128),
  volume: z.number().min(0).max(1),
})
const soundConfig = z.object({
  masterMute: z.boolean(),
  masterVolume: z.number().min(0).max(1),
  channels: z.object({
    turnComplete: channelConfig,
    toolSuccess: channelConfig,
    toolFailure: channelConfig,
  }),
  minimumTurnDurationMs: z.number().min(0).max(60_000),
  toolCooldownMs: z.number().min(0).max(60_000),
  toolCoalesceMs: z.number().min(0).max(10_000),
  maximumQueueSize: z.number().int().min(1).max(20),
  rootSessionsOnly: z.boolean(),
})
const soundView = z.object({
  id: z.string(),
  displayName: z.string(),
  builtIn: z.boolean(),
  channels: z.array(channel),
  bytes: z.number().optional(),
  durationSeconds: z.number().optional(),
})
const snapshot = z.object({
  config: soundConfig,
  sounds: z.array(soundView),
  limits: z.object({ maximumBytes: z.number(), maximumSeconds: z.number() }),
})

const strict = (typeSymbol: string, schema: z.ZodType) => ({ mode: 'strict' as const, typeSymbol, schema })

export const SOUND_REMOTE_DESCRIPTORS = [
  {
    id: 'xy-deepseek-sounds#xySounds/snapshot', service: 'xySounds', namespace: 'xySounds', method: 'snapshot',
    invocation: { kind: 'direct' as const }, parameters: [],
    result: strict('xy-deepseek-sounds#SoundSettingsSnapshot', snapshot),
  },
  {
    id: 'xy-deepseek-sounds#xySounds/update', service: 'xySounds', namespace: 'xySounds', method: 'update',
    invocation: { kind: 'direct' as const },
    parameters: [{ name: 'config', wire: 'config', source: 'json' as const, codec: strict('xy-deepseek-sounds#SoundConfig', soundConfig) }],
    result: strict('xy-deepseek-sounds#SoundSettingsSnapshot', snapshot),
  },
  {
    id: 'xy-deepseek-sounds#xySounds/importSound', service: 'xySounds', namespace: 'xySounds', method: 'importSound',
    invocation: { kind: 'direct' as const },
    parameters: [
      { name: 'fileName', wire: 'fileName', source: 'json' as const, codec: strict('xy-deepseek-sounds#import:fileName', z.string().min(1).max(255)) },
      { name: 'dataBase64', wire: 'dataBase64', source: 'json' as const, codec: strict('xy-deepseek-sounds#import:dataBase64', z.string().min(1).max(14_000_000)) },
    ],
    result: strict('xy-deepseek-sounds#SoundSettingsSnapshot', snapshot),
  },
  {
    id: 'xy-deepseek-sounds#xySounds/removeSound', service: 'xySounds', namespace: 'xySounds', method: 'removeSound',
    invocation: { kind: 'direct' as const },
    parameters: [{ name: 'id', wire: 'id', source: 'json' as const, codec: strict('xy-deepseek-sounds#soundId', z.string().min(1).max(128)) }],
    result: strict('xy-deepseek-sounds#SoundSettingsSnapshot', snapshot),
  },
  {
    id: 'xy-deepseek-sounds#xySounds/restoreBuiltIns', service: 'xySounds', namespace: 'xySounds', method: 'restoreBuiltIns',
    invocation: { kind: 'direct' as const }, parameters: [],
    result: strict('xy-deepseek-sounds#SoundSettingsSnapshot', snapshot),
  },
  {
    id: 'xy-deepseek-sounds#xySounds/preview', service: 'xySounds', namespace: 'xySounds', method: 'preview',
    invocation: { kind: 'direct' as const },
    parameters: [
      { name: 'channel', wire: 'channel', source: 'json' as const, codec: strict('xy-deepseek-sounds#SoundChannel', channel) },
      { name: 'soundId', wire: 'soundId', source: 'json' as const, codec: strict('xy-deepseek-sounds#soundId', z.string().min(1).max(128)) },
    ],
    result: strict('xy-deepseek-sounds#preview:result', z.undefined()),
  },
] as const

export const SOUND_CONFIG_SCHEMA = soundConfig
export const SOUND_SETTINGS_SNAPSHOT_SCHEMA = snapshot
