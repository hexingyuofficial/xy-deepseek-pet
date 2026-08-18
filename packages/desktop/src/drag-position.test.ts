import { describe, expect, it } from 'vitest'
import { draggedWindowPosition, isScreenPoint } from './drag-position.js'

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
})
