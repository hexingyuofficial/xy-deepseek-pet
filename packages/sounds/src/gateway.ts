import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { MAX_SOUND_BYTES } from './library.js'
import type { SoundChannel, SoundConfig } from './config.js'
import type { SoundController, SoundSettingsSnapshot } from './controller.js'

export function decodeSoundBase64(data: string): Buffer {
  if (data.length > 14_000_000 || data.length === 0 || data.length % 4 !== 0) {
    throw new Error('Invalid base64 sound payload')
  }
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0
  for (let index = 0; index < data.length - padding; index += 1) {
    const code = data.charCodeAt(index)
    const valid = (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
      || (code >= 48 && code <= 57) || code === 43 || code === 47
    if (!valid) throw new Error('Invalid base64 sound payload')
  }
  for (let index = data.length - padding; index < data.length; index += 1) {
    if (data.charCodeAt(index) !== 61) throw new Error('Invalid base64 sound payload')
  }
  const bytes = Buffer.from(data, 'base64')
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_SOUND_BYTES) throw new Error('Sound must be no larger than 10 MiB')
  return bytes
}

export class SoundSettingsGateway extends TypertRemoteService {
  constructor(ctx: Context, private readonly controller: SoundController) {
    super(ctx, 'xySounds')
  }

  @Remote
  snapshot(): SoundSettingsSnapshot { return this.controller.snapshot() }

  @Remote
  update(config: SoundConfig): Promise<SoundSettingsSnapshot> { return this.controller.update(config) }

  @Remote
  importSound(fileName: string, dataBase64: string): Promise<SoundSettingsSnapshot> {
    return this.controller.importSound(decodeSoundBase64(dataBase64), fileName)
  }

  @Remote
  removeSound(id: string): Promise<SoundSettingsSnapshot> { return this.controller.removeSound(id) }

  @Remote
  restoreBuiltIns(): Promise<SoundSettingsSnapshot> { return this.controller.restoreBuiltIns() }

  @Remote
  preview(channel: SoundChannel, soundId: string): Promise<void> {
    return this.controller.preview(channel, soundId)
  }
}
