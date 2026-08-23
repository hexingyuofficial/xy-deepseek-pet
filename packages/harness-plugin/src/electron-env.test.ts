import { describe, expect, it } from 'vitest'
import { cleanElectronRuntimeEnv } from './electron-env.js'

describe('Electron child environment', () => {
  it('removes inherited host flags and keeps the child marker', () => {
    expect(cleanElectronRuntimeEnv({
      ELECTRON_RUN_AS_NODE: '1',
      ELECTRON_NO_ATTACH_CONSOLE: '1',
      PATH: '/usr/bin',
    }, {
      XY_DEEPSEEK_PET_CHILD: '1',
    })).toEqual({
      PATH: '/usr/bin',
      XY_DEEPSEEK_PET_CHILD: '1',
    })
  })
})
