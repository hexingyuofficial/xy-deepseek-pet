import { describe, expect, it } from 'vitest'
import { bubbleDragLimits, bubbleSideForCenter, constrainBubbleOffset, petPlacementAdjusted } from './bubble-position.js'

describe('bubble position', () => {
  const baseRect = { left: 100, top: 80, right: 380, bottom: 200 }
  const viewport = { width: 640, height: 480 }
  const maximum = { x: 120, y: 80 }

  it('keeps a nearby manual offset unchanged', () => {
    expect(constrainBubbleOffset({ x: 36, y: -24 }, baseRect, viewport, maximum))
      .toEqual({ x: 36, y: -24 })
  })

  it('selects all four pet-relative anchor sides from a dragged bubble center', () => {
    const pet = { left: 100, top: 100, right: 300, bottom: 300 }
    expect(bubbleSideForCenter({ x: 200, y: 40 }, pet)).toBe('top')
    expect(bubbleSideForCenter({ x: 360, y: 200 }, pet)).toBe('right')
    expect(bubbleSideForCenter({ x: 200, y: 360 }, pet)).toBe('bottom')
    expect(bubbleSideForCenter({ x: 40, y: 200 }, pet)).toBe('left')
  })

  it('keeps the bubble within its pet-relative range', () => {
    expect(constrainBubbleOffset({ x: 500, y: -500 }, baseRect, viewport, maximum))
      .toEqual({ x: 120, y: -72 })
  })

  it('keeps the complete bubble inside the viewport', () => {
    expect(constrainBubbleOffset(
      { x: -100, y: 80 },
      { left: 20, top: 300, right: 300, bottom: 450 },
      viewport,
      maximum,
    )).toEqual({ x: -12, y: 22 })
  })

  it('reclamps a larger expanded bubble without display-coordinate assumptions', () => {
    expect(constrainBubbleOffset(
      { x: 70, y: 40 },
      { left: 300, top: 240, right: 620, bottom: 470 },
      viewport,
      maximum,
    )).toEqual({ x: 12, y: 2 })
  })

  it('keeps the complete bubble visible when the nearby range cannot reach the viewport', () => {
    expect(constrainBubbleOffset(
      { x: 0, y: 0 },
      { left: 500, top: 80, right: 808, bottom: 220 },
      viewport,
      maximum,
    )).toEqual({ x: -176, y: 0 })
  })

  it('centers an oversized bubble instead of producing an unstable edge compromise', () => {
    expect(constrainBubbleOffset(
      { x: 100, y: 100 },
      { left: 20, top: 40, right: 700, bottom: 560 },
      viewport,
      maximum,
    )).toEqual({ x: -40, y: -60 })
  })

  it('scales the allowed range but keeps practical limits', () => {
    expect(bubbleDragLimits({ width: 38.4, height: 41.6 })).toEqual({ x: 40, y: 32 })
    expect(bubbleDragLimits({ width: 384, height: 416 })).toEqual({ x: 120, y: 80 })
  })

  it('recognizes a wall-driven pet placement adjustment without reacting to rounding noise', () => {
    expect(petPlacementAdjusted({ x: 81, y: 150 }, { x: 81.2, y: 149.8 })).toBe(false)
    expect(petPlacementAdjusted({ x: 81, y: 150 }, { x: 81, y: 144 })).toBe(true)
  })
})
