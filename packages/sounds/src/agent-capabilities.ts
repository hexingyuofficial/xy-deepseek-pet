import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { lstat, readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import type { SoundController, SoundSettingsSnapshot } from './controller.js'
import { SOUND_CHANNELS, type SoundChannel } from './config.js'
import { MAX_SOUND_BYTES } from './library.js'

const OPERATIONS = ['status', 'set_sound', 'set_channel_enabled', 'import_sound'] as const

function isChannel(value: string | undefined): value is SoundChannel {
  return SOUND_CHANNELS.includes(value as SoundChannel)
}

function result(message: string, snapshot: SoundSettingsSnapshot) {
  return {
    ok: true,
    message,
    masterMute: snapshot.config.masterMute,
    channels: SOUND_CHANNELS.map((id) => ({ id, ...snapshot.config.channels[id] })),
    availableSounds: snapshot.sounds.map(({ id, displayName, channels }) => ({ id, displayName, channels: [...channels] })),
  }
}

export function registerSoundAgentCapabilities(ctx: Context, controller: SoundController): void {
  ctx.systemPrompt.section({
    name: 'tool:xy-deepseek-sounds',
    order: 146,
    text: 'XY DeepSeek Sounds is installed. Use xy_pet_sounds when the user asks to inspect, enable, disable, select, or import task-complete/tool-success/tool-failure notification sounds. Import only a local audio file the user explicitly selected; sound settings also appear in Harness General settings.',
  })
  ctx.tools.register(defineTool({
    name: 'xy_pet_sounds',
    description: 'Inspect or safely configure XY DeepSeek Pet notification sounds.',
    parameters: {
      operation: { type: 'string', required: true, enum: OPERATIONS, description: OPERATIONS.join(' | ') },
      channel: { type: 'string', enum: SOUND_CHANNELS, description: 'turnComplete | toolSuccess | toolFailure' },
      sound_id: { type: 'string', description: 'Exact available sound ID for set_sound.' },
      enabled: { type: 'boolean', description: 'Whether the selected channel is enabled.' },
      path: { type: 'string', description: 'Local WAV, MP3, or OGG path explicitly supplied or selected by the user.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', required: true },
          message: { type: 'string', required: true },
          masterMute: { type: 'boolean', required: true },
          channels: { type: 'array', required: true, items: { type: 'json' } },
          availableSounds: { type: 'array', required: true, items: { type: 'json' } },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.message }],
    },
    async execute(args, exec) {
      let message = 'XY DeepSeek Sounds status.'
      if (args.operation === 'set_sound') {
        if (!isChannel(args.channel) || !args.sound_id) throw new Error('channel and sound_id are required for set_sound')
        const snapshot = controller.snapshot()
        const sound = snapshot.sounds.find((item) => item.id === args.sound_id && item.channels.includes(args.channel as SoundChannel))
        if (!sound) throw new Error(`Sound ${args.sound_id} is not available for ${args.channel}`)
        const next = structuredClone(snapshot.config)
        next.channels[args.channel].soundId = args.sound_id
        await controller.update(next)
        message = `${args.channel} now uses ${sound.displayName}.`
      } else if (args.operation === 'set_channel_enabled') {
        if (!isChannel(args.channel) || args.enabled === undefined) throw new Error('channel and enabled are required for set_channel_enabled')
        const next = structuredClone(controller.config)
        next.channels[args.channel].enabled = args.enabled
        await controller.update(next)
        message = `${args.channel} notifications ${args.enabled ? 'enabled' : 'disabled'}.`
      } else if (args.operation === 'import_sound') {
        if (!args.path) throw new Error('path is required for import_sound')
        const path = resolve(args.path)
        const metadata = await lstat(path)
        if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size <= 0 || metadata.size > MAX_SOUND_BYTES) {
          throw new Error('Sound must be a regular file no larger than 10 MiB')
        }
        const before = new Set(controller.snapshot().sounds.map((sound) => sound.id))
        const imported = await controller.importSound(await readFile(path, { signal: exec.signal }), basename(path))
        const sound = imported.sounds.find((item) => !before.has(item.id))
        if (!sound) throw new Error('The sound was validated but no imported asset was found')
        if (isChannel(args.channel)) {
          const next = structuredClone(imported.config)
          next.channels[args.channel].soundId = sound.id
          await controller.update(next)
          message = `${sound.displayName} was imported and selected for ${args.channel}.`
        } else {
          message = `${sound.displayName} was imported with ID ${sound.id}.`
        }
      }
      return result(message, controller.snapshot())
    },
  }))
}
