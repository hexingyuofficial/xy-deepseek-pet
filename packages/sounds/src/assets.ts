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
    displayName: 'XY Complete',
    file: 'default-complete.wav',
    channels: ['turnComplete'],
  },
  {
    id: 'xy-placeholder-tool-success',
    displayName: 'XY Tool Success',
    file: 'default-tool-success.wav',
    channels: ['toolSuccess'],
  },
  {
    id: 'xy-placeholder-tool-failure',
    displayName: 'XY Tool Failure',
    file: 'default-tool-failure.wav',
    channels: ['toolFailure'],
  },
]

export function resolveBuiltinSound(soundId: string, channel: SoundChannel): (SoundAsset & { path: string }) | undefined {
  const asset = BUILTIN_SOUNDS.find((candidate) => candidate.id === soundId && candidate.channels.includes(channel))
  if (!asset) return undefined
  return { ...asset, path: fileURLToPath(new URL(`../assets/${asset.file}`, import.meta.url)) }
}
