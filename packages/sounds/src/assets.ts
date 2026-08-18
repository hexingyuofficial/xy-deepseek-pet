import { fileURLToPath } from 'node:url'
import type { SoundChannel } from './config.js'

export interface SoundAsset {
  id: string
  displayName: string
  file: string
  channels: readonly SoundChannel[]
}

export const BUILTIN_SOUNDS: readonly SoundAsset[] = [
  {
    id: 'xy-placeholder-complete',
    displayName: 'Placeholder Complete',
    file: 'placeholder-complete.wav',
    channels: ['turnComplete'],
  },
  {
    id: 'xy-placeholder-tool-success',
    displayName: 'Placeholder Tool Success',
    file: 'placeholder-tool-success.wav',
    channels: ['toolSuccess'],
  },
  {
    id: 'xy-placeholder-tool-failure',
    displayName: 'Placeholder Tool Failure',
    file: 'placeholder-tool-failure.wav',
    channels: ['toolFailure'],
  },
]

export function resolveBuiltinSound(soundId: string, channel: SoundChannel): (SoundAsset & { path: string }) | undefined {
  const asset = BUILTIN_SOUNDS.find((candidate) => candidate.id === soundId && candidate.channels.includes(channel))
  if (!asset) return undefined
  return { ...asset, path: fileURLToPath(new URL(`../assets/${asset.file}`, import.meta.url)) }
}
