import { describe, expect, it } from 'vitest'
import { bridgeFileForStartup, bridgeFileFromArgs } from './bridge-startup.js'

describe('desktop bridge startup discovery', () => {
  it('uses an explicit bridge file argument first', () => {
    expect(bridgeFileFromArgs(['electron', '--bridge-file=/tmp/explicit.json'])).toBe('/tmp/explicit.json')
    expect(bridgeFileForStartup(
      ['electron', '--bridge-file=/tmp/explicit.json'],
      { XY_DEEPSEEK_PET_BRIDGE_FILE: '/tmp/environment.json' },
      '/Users/example',
    )).toBe('/tmp/explicit.json')
  })

  it('uses the configured bridge file when no argument is present', () => {
    expect(bridgeFileForStartup(
      ['electron'],
      { XY_DEEPSEEK_PET_BRIDGE_FILE: '/tmp/environment.json' },
      '/Users/example',
    )).toBe('/tmp/environment.json')
  })

  it('falls back to the standard per-user bridge file', () => {
    expect(bridgeFileForStartup(['electron'], {}, '/Users/example'))
      .toBe('/Users/example/.xy-deepseek-pet/bridge.json')
  })
})
