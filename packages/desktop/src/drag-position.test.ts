import { describe, expect, it } from 'vitest'
import {
  ELECTRON_COORDINATE_MAX,
  ELECTRON_COORDINATE_MIN,
  draggedWindowPosition,
  isScreenPoint,
  normalizeWindowCoordinate,
  normalizeWindowPosition,
} from './drag-position.js'

describe('desktop drag coordinates', () => {
  it('rejects missing and non-finite Electron IPC coordinates', () => {
    expect(isScreenPoint(undefined)).toBe(false)
    expect(isScreenPoint({ x: Number.NaN, y: 10 })).toBe(false)
    expect(isScreenPoint({ x: 10, y: Number.POSITIVE_INFINITY })).toBe(false)
  })

  it('keeps the window under the cursor', () => {
    expect(draggedWindowPosition({ x: 100, y: 200 }, { x: 20, y: 30 }, { x: 112.4, y: 193.6 }))
      .toEqual({ x: 32, y: 24 })
  })

  it('normalizes coordinates accepted by Electron', () => {
    expect(normalizeWindowCoordinate(12.6)).toBe(13)
    expect(normalizeWindowCoordinate(Number.POSITIVE_INFINITY, 7)).toBe(7)
    expect(normalizeWindowCoordinate(Number.MAX_VALUE)).toBe(ELECTRON_COORDINATE_MAX)
    expect(normalizeWindowCoordinate(-Number.MAX_VALUE)).toBe(ELECTRON_COORDINATE_MIN)
    expect(normalizeWindowPosition({ x: Number.NaN, y: 4.4 }, { x: 9, y: 8 })).toEqual({ x: 9, y: 4 })
  })

  it('bounds a dragged position instead of passing an extreme native coordinate', () => {
    expect(draggedWindowPosition({ x: 0, y: 0 }, { x: ELECTRON_COORDINATE_MAX, y: ELECTRON_COORDINATE_MIN }, { x: 100, y: -100 }))
      .toEqual({ x: ELECTRON_COORDINATE_MAX, y: ELECTRON_COORDINATE_MIN })
  })
})
