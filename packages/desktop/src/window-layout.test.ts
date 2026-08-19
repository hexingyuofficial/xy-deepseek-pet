import { describe, expect, it } from 'vitest'
import { clampWindowPosition, resolvePetOffset, resolvePetPlacement, selectPetWindowDock, selectWindowDock } from './window-layout.js'

const workArea = { x: 0, y: 0, width: 1440, height: 900 }

describe('desktop window dock layout', () => {
  it('clamps a window to the display selected for a cross-screen drag', () => {
    expect(clampWindowPosition(
      { x: -2100, y: 980 },
      { width: 360, height: 348 },
      { x: -1920, y: 0, width: 1920, height: 1080 },
    )).toEqual({ x: -1920, y: 732 })
  })

  it('keeps oversized windows anchored to the display origin', () => {
    expect(clampWindowPosition(
      { x: 400, y: 300 },
      { width: 800, height: 600 },
      { x: 0, y: 0, width: 640, height: 480 },
    )).toEqual({ x: 0, y: 0 })
  })

  it('uses the left layout near the left edge', () => {
    expect(selectWindowDock({ x: 40, y: 300, width: 360, height: 348 }, workArea)).toBe('left')
  })

  it('uses the right layout near the right edge', () => {
    expect(selectWindowDock({ x: 1040, y: 300, width: 360, height: 348 }, workArea)).toBe('right')
  })

  it('returns to the centered layout away from either edge', () => {
    expect(selectWindowDock({ x: 520, y: 300, width: 360, height: 348 }, workArea)).toBe('center')
  })

  it('works with displays that have negative coordinates', () => {
    expect(selectWindowDock({ x: -1880, y: 200, width: 360, height: 348 }, { x: -1920, y: 0, width: 1920, height: 1080 })).toBe('left')
  })

  it('docks against the transparent window rather than the whole display', () => {
    const windowPosition = { x: 600, y: 260 }
    const windowSize = { width: 360, height: 348 }
    const petSize = { width: 128.7, height: 128.7 }

    expect(selectPetWindowDock(
      { x: 600, y: 479.3 },
      petSize,
      windowPosition,
      windowSize,
    )).toBe('left')
    expect(selectPetWindowDock(
      { x: 715.65, y: 479.3 },
      petSize,
      windowPosition,
      windowSize,
    )).toBe('center')
    expect(selectPetWindowDock(
      { x: 831.3, y: 479.3 },
      petSize,
      windowPosition,
      windowSize,
    )).toBe('right')
  })

  it('moves the pet inside an on-screen window to reach the top and bottom edges', () => {
    const size = { width: 360, height: 348 }
    const pet = { width: 120, height: 100 }
    const top = resolvePetPlacement({ x: 500, y: 0 }, size, pet, workArea, { x: 120, y: 248 })
    expect(top.windowPosition.y).toBe(0)
    expect(top.petOffset.y).toBe(0)
    expect(top.petPosition.y).toBe(0)

    const bottom = resolvePetPlacement({ x: 500, y: 800 }, size, pet, workArea, top.petOffset)
    expect(bottom.windowPosition.y).toBe(552)
    expect(bottom.petOffset.y).toBe(248)
    expect(bottom.petPosition.y + pet.height).toBe(900)
  })

  it('recenters the transparent window after the pet leaves a display edge', () => {
    const size = { width: 360, height: 348 }
    const pet = { width: 120, height: 100 }
    const placement = resolvePetPlacement(
      { x: 500, y: 700 },
      size,
      pet,
      workArea,
      { x: 0, y: 248 },
    )

    expect(placement.windowPosition.x).toBe(380)
    expect(placement.petOffset.x).toBe(120)
    expect(selectPetWindowDock(placement.petPosition, pet, placement.windowPosition, size)).toBe('center')
  })

  it('uses display bounds dynamically, including negative-coordinate displays', () => {
    const placement = resolvePetPlacement(
      { x: -2_000, y: -100 },
      { width: 360, height: 348 },
      { width: 120, height: 100 },
      { x: -1_920, y: 0, width: 1_920, height: 1_080 },
      { x: 120, y: 248 },
    )
    expect(placement.petPosition).toEqual({ x: -1_920, y: 0 })
    expect(placement.windowPosition).toEqual({ x: -1_920, y: 0 })
    expect(placement.petOffset).toEqual({ x: 0, y: 0 })
  })

  it('reconciles the pet offset when the OS adjusts the requested window position', () => {
    const size = { width: 460, height: 420 }
    const pet = { width: 256, height: 277 }

    expect(resolvePetOffset(
      { x: 1184, y: 623 },
      { x: 980, y: 480 },
      size,
      pet,
    )).toEqual({ x: 204, y: 143 })
  })

  it('keeps the full pet inside the native window after an edge correction', () => {
    const size = { width: 360, height: 348 }
    const pet = { width: 183, height: 198 }
    const offset = resolvePetOffset(
      { x: -1_920, y: 0 },
      { x: -1_880, y: 24 },
      size,
      pet,
    )

    expect(offset).toEqual({ x: 0, y: 0 })
    expect(offset.x + pet.width).toBeLessThanOrEqual(size.width)
    expect(offset.y + pet.height).toBeLessThanOrEqual(size.height)
  })

  it('uses the available window edge when the adjusted window cannot preserve the requested point', () => {
    const size = { width: 360, height: 348 }
    const pet = { width: 183, height: 198 }

    expect(resolvePetOffset(
      { x: 1_257, y: 702 },
      { x: 1_000, y: 500 },
      size,
      pet,
    )).toEqual({ x: 177, y: 150 })
  })

  it('keeps every edge of a scaled pet inside the realized native window', () => {
    const windowSize = { width: 460, height: 445 }
    const petSize = { width: 255.88, height: 277.2 }
    const display = { x: -1_920, y: -120, width: 1_440, height: 900 }
    const targets = [
      { x: display.x, y: display.y },
      { x: display.x + display.width - petSize.width, y: display.y },
      { x: display.x, y: display.y + display.height - petSize.height },
      { x: display.x + display.width - petSize.width, y: display.y + display.height - petSize.height },
    ]

    for (const target of targets) {
      const planned = resolvePetPlacement(target, windowSize, petSize, display, { x: 102, y: 168 })
      const nativePosition = {
        x: planned.windowPosition.x + (target.x === display.x ? 18 : -12),
        y: planned.windowPosition.y + (target.y === display.y ? 24 : -16),
      }
      const offset = resolvePetOffset(planned.petPosition, nativePosition, windowSize, petSize)
      expect(offset.x).toBeGreaterThanOrEqual(0)
      expect(offset.y).toBeGreaterThanOrEqual(0)
      expect(offset.x + petSize.width).toBeLessThanOrEqual(windowSize.width)
      expect(offset.y + petSize.height).toBeLessThanOrEqual(windowSize.height)
    }
  })
})
