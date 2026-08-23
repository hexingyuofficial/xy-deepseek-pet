import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { soundFileDropChannel } from './settings-view.js'

describe('sound settings UI coverage', () => {
  const source = readFileSync(fileURLToPath(new URL('./settings-view.ts', import.meta.url)), 'utf8')

  it('keeps every user-facing sound capability in the settings view', () => {
    for (const integration of [
      'draft.masterVolume',
      'draft.masterMute',
      'draft.channels[channel]',
      'next.channels[channel].enabled',
      'next.channels[channel].soundId',
      'next.channels[channel].volume',
      'next.minimumTurnDurationMs',
      'next.toolCooldownMs',
      'next.toolCoalesceMs',
      'remote.importSound',
      'remote.removeSound',
      'remote.restoreBuiltIns',
      'remote.preview',
    ]) expect(source).toContain(integration)
  })

  it('routes only supported sound drop targets', () => {
    expect(soundFileDropChannel('turnComplete')).toBe('turnComplete')
    expect(soundFileDropChannel('toolSuccess')).toBe('toolSuccess')
    expect(soundFileDropChannel('toolFailure')).toBe('toolFailure')
    expect(soundFileDropChannel('theme')).toBeUndefined()
  })
})
