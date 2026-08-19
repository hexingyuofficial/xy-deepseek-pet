import { describe, expect, it } from 'vitest'
import { resolveSubmenuPosition } from './submenu-position.js'

describe('submenu position', () => {
  it('opens to the right of its parent when space is available', () => {
    expect(resolveSubmenuPosition(
      { left: 48, top: 62, right: 202, bottom: 90 },
      { width: 136, height: 116 },
      { width: 360, height: 500 },
    )).toEqual({ left: 208, top: 62, side: 'right' })
  })

  it('opens to the left near the right edge', () => {
    expect(resolveSubmenuPosition(
      { left: 198, top: 62, right: 352, bottom: 90 },
      { width: 136, height: 116 },
      { width: 360, height: 500 },
    )).toEqual({ left: 56, top: 62, side: 'left' })
  })

  it('keeps the complete submenu inside the vertical viewport', () => {
    expect(resolveSubmenuPosition(
      { left: 48, top: 440, right: 202, bottom: 468 },
      { width: 136, height: 116 },
      { width: 500, height: 500 },
    ).top).toBe(376)
  })
})
