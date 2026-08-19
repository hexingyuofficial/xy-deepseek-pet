import { describe, expect, it } from 'vitest'
import { themeDisplayBox } from './theme-layout.js'

describe('themeDisplayBox', () => {
  it('keeps the complete Petdex 192 x 208 canvas visible', () => {
    const box = themeDisplayBox({ width: 192, height: 208 })
    expect(box.height).toBe(198)
    expect(box.width).toBeCloseTo(182.77, 2)
    expect(box.clearance).toBe(206)
  })

  it('fits wide native canvases without changing their aspect ratio', () => {
    const box = themeDisplayBox({ width: 384, height: 192 })
    expect(box.width).toBe(228)
    expect(box.height).toBe(114)
    expect(box.width / box.height).toBe(2)
  })
})
