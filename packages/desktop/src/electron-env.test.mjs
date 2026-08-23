import { describe, expect, it } from 'vitest'
import { cleanElectronRuntimeEnv } from '../bin/electron-env.mjs'

describe('Electron runtime environment', () => {
  it('removes inherited Electron host flags while preserving application values', () => {
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
})
