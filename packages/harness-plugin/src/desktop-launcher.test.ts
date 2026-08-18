import { describe, expect, it } from 'vitest'
import { decodeLauncherPng, launcherNodeExecutable, macLauncherScript, sanitizeLauncherName } from './desktop-launcher.js'

describe('desktop launcher input validation', () => {
  it('accepts readable names and rejects path-like names', () => {
    expect(sanitizeLauncherName('  DeepSeek 小鲸鱼  ')).toBe('DeepSeek 小鲸鱼')
    expect(() => sanitizeLauncherName('../pet')).toThrow()
    expect(() => sanitizeLauncherName('bad/name')).toThrow()
  })

  it('accepts only bounded PNG payloads', () => {
    const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.alloc(24)])
    expect(decodeLauncherPng(png.toString('base64'))).toEqual(png)
    expect(() => decodeLauncherPng(Buffer.alloc(32).toString('base64'))).toThrow()
  })

  it('pins the macOS launcher to an absolute Node executable and quotes paths', () => {
    const script = macLauncherScript("/Applications/Node's/bin/node", "/tmp/pet package/runtime/launch.mjs")
    expect(script).toContain("exec '/Applications/Node'\\''s/bin/node' '/tmp/pet package/runtime/launch.mjs'")
    expect(script).not.toContain('exec node ')
    expect(script).toContain('launcher.log')
    expect(script).toContain('umask 077')
    expect(launcherNodeExecutable()).toMatch(/^([A-Za-z]:[\\/]|\/)/)
  })
})
