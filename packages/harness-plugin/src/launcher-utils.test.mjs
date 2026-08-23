import { describe, expect, it } from 'vitest'
import { cleanElectronRuntimeEnv, isHarnessHtml, parseBridgeDescriptor, parseLauncherLock, safeHarnessUrl } from '../runtime/launcher-utils.mjs'

describe('launcher safety helpers', () => {
  it('does not propagate Electron host flags to child runtimes', () => {
    expect(cleanElectronRuntimeEnv({
      ELECTRON_RUN_AS_NODE: '1',
      ELECTRON_NO_ATTACH_CONSOLE: '1',
      PATH: '/usr/bin',
    }, {
      XY_DEEPSEEK_PET_BRIDGE_FILE: '/tmp/bridge.json',
    })).toEqual({
      PATH: '/usr/bin',
      XY_DEEPSEEK_PET_BRIDGE_FILE: '/tmp/bridge.json',
    })
  })

  it('distinguishes Harness from an unrelated HTTP service', () => {
    expect(isHarnessHtml('<title>DeepSeek Harness</title>')).toBe(true)
    expect(isHarnessHtml('<h1>another local app</h1>')).toBe(false)
  })

  it('opens only loopback HTTP client URLs', () => {
    expect(safeHarnessUrl('http://localhost:3080/session/1')).toBe('http://localhost:3080/session/1')
    expect(safeHarnessUrl('file:///tmp/payload')).toBe('http://127.0.0.1:3080/')
    expect(safeHarnessUrl('https://example.com')).toBe('http://127.0.0.1:3080/')
  })

  it('rejects stale, exposed, and dead bridge descriptors', () => {
    const raw = JSON.stringify({ version: 1, pid: 42, port: 9000, token: 'x'.repeat(64), clientUrl: 'file:///tmp/no' })
    const base = { now: 10_000, mtimeMs: 9_000, platform: 'darwin', uid: 501, currentUid: 501, mode: 0o100600, processAlive: () => true, defaultClientUrl: 'http://127.0.0.1:3080/' }
    expect(parseBridgeDescriptor(raw, base)?.clientUrl).toBe('http://127.0.0.1:3080/')
    expect(parseBridgeDescriptor(raw, { ...base, mode: 0o100644 })).toBeUndefined()
    expect(parseBridgeDescriptor(raw, { ...base, processAlive: () => false })).toBeUndefined()
  })

  it('recovers malformed, dead, and expired launcher locks', () => {
    expect(parseLauncherLock('{', 100_000, () => true)).toBeUndefined()
    expect(parseLauncherLock(JSON.stringify({ pid: 42, createdAt: 1 }), 100_000, () => true)).toBeUndefined()
    expect(parseLauncherLock(JSON.stringify({ pid: 42, createdAt: 99_000 }), 100_000, () => false)).toBeUndefined()
    expect(parseLauncherLock(JSON.stringify({ pid: 42, createdAt: 99_000 }), 100_000, () => true)).toEqual({ pid: 42, createdAt: 99_000 })
  })
})
