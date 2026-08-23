import { describe, expect, it } from 'vitest'
import { bridgeFileForStartup, bridgeFileFromArgs, finderComposePathsFromArgs } from './bridge-startup.js'

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

  it('accepts only bounded absolute Finder compose paths after the explicit marker', () => {
    expect(finderComposePathsFromArgs(['electron', '--finder-compose', '2', '/tmp/a b.wav', '/tmp/c.wav', '/app/dist/main.js']))
      .toEqual(['/tmp/a b.wav', '/tmp/c.wav'])
    expect(finderComposePathsFromArgs(['electron', '--finder-compose', '2', '/tmp/a.wav', 'relative.txt'])).toEqual(['/tmp/a.wav'])
    expect(finderComposePathsFromArgs(['electron', '--finder-compose', '9', '/tmp/a.wav'])).toEqual([])
    expect(finderComposePathsFromArgs(['electron', '--other', '/tmp/a.wav'])).toEqual([])
  })
})
