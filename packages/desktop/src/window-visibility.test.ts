import { describe, expect, it } from 'vitest'
import { MAC_PET_ACTIVATION_POLICY, macWindowVisibilityPolicy, summonWindowActivation } from './window-visibility.js'

describe('desktop window visibility policy', () => {
  it('focuses a summoned chat but leaves a pet-only summon inactive', () => {
    expect(summonWindowActivation(true)).toBe('active')
    expect(summonWindowActivation(false)).toBe('inactive')
  })
  it('uses the UIElement-compatible activation policy required by full-screen Spaces', () => {
    expect(MAC_PET_ACTIVATION_POLICY).toBe('accessory')
  })
  it('uses the full-screen-compatible level outside text entry', () => {
    expect(macWindowVisibilityPolicy(true)).toEqual({
      visibleOnAllWorkspaces: true,
      visibleOnFullScreen: true,
      skipTransformProcessType: true,
      alwaysOnTopLevel: 'screen-saver',
    })
  })

  it('stays on normal Spaces without joining full-screen Spaces when disabled', () => {
    expect(macWindowVisibilityPolicy(false)).toEqual({
      visibleOnAllWorkspaces: true,
      visibleOnFullScreen: false,
      skipTransformProcessType: true,
      alwaysOnTopLevel: 'floating',
    })
  })

  it('drops to the floating level while text input is active so IME panels stay above it', () => {
    expect(macWindowVisibilityPolicy(true, true)).toEqual({
      visibleOnAllWorkspaces: true,
      visibleOnFullScreen: true,
      skipTransformProcessType: true,
      alwaysOnTopLevel: 'floating',
    })
  })
})
