import { describe, expect, it } from 'vitest'
import {
  clampToVisiblePet,
  estimateFlingVelocity,
  facingForFling,
  flingDeceleration,
  flingUsesMovementAnimation,
  petCollisionBox,
  positionPreservingVisiblePet,
  stepFling,
} from './fling-policy.js'

const workArea = { x: 0, y: 0, width: 1_440, height: 900 }
const centeredPet = petCollisionBox({ width: 360, height: 348 }, { width: 183, height: 198 }, 'center')

describe('desktop pet fling policy', () => {
  it('uses the recent release tangent and ignores older drag history', () => {
    expect(estimateFlingVelocity([
      { x: 0, y: 0, time: 0 },
      { x: 100, y: 100, time: 800 },
      { x: 160, y: 70, time: 900 },
    ])).toEqual({ x: 600, y: -300 })
  })

  it('does not fling after a slow release', () => {
    expect(estimateFlingVelocity([
      { x: 10, y: 10, time: 0 },
      { x: 25, y: 10, time: 100 },
    ])).toBeUndefined()
  })

  it('maps higher resistance to stronger deceleration', () => {
    expect(flingDeceleration(100)).toBeGreaterThan(flingDeceleration(0))
    expect(flingDeceleration(-10)).toBe(flingDeceleration(0))
    expect(flingDeceleration(110)).toBe(flingDeceleration(100))
  })

  it('never replaces active Harness work with the movement animation', () => {
    expect(flingUsesMovementAnimation('idle')).toBe(true)
    expect(flingUsesMovementAnimation('walk')).toBe(true)
    expect(flingUsesMovementAnimation('thinking')).toBe(false)
    expect(flingUsesMovementAnimation('working')).toBe(false)
    expect(flingUsesMovementAnimation('needsInput')).toBe(false)
  })

  it('slows without gravity and preserves diagonal direction away from edges', () => {
    const step = stepFling(
      { x: 400, y: 300, velocityX: 1_000, velocityY: -500 },
      0.016,
      centeredPet,
      workArea,
      50,
    )
    expect(step.x).toBeGreaterThan(400)
    expect(step.y).toBeLessThan(300)
    expect(step.velocityX).toBeGreaterThan(0)
    expect(step.velocityY).toBeLessThan(0)
  })

  it('reflects at every display edge without a collision counter', () => {
    const first = stepFling(
      { x: 1_160, y: -140, velocityX: 1_000, velocityY: -700 },
      0.05,
      centeredPet,
      workArea,
      0,
    )
    expect(first.x).toBeCloseTo(1_168.5)
    expect(first.y).toBe(-150)
    expect(first.velocityX).toBeLessThan(0)
    expect(first.velocityY).toBeGreaterThan(0)
  })

  it('bounces on the same frame that the visible pet reaches the screen top', () => {
    const step = stepFling(
      { x: 500, y: 2, velocityX: 300, velocityY: -1_000 },
      0.016,
      { offsetX: 0, offsetY: 0, width: 183, height: 198 },
      workArea,
      0,
    )
    expect(step.y).toBe(0)
    expect(step.velocityY).toBeGreaterThan(0)
  })

  it('reflects upward motion instead of sliding along a false horizontal boundary', () => {
    const step = stepFling(
      { x: 500, y: 1, velocityX: 900, velocityY: -1_200 },
      0.016,
      { offsetX: 0, offsetY: 0, width: 183, height: 198 },
      workArea,
      0,
    )
    expect(step.y).toBe(0)
    expect(step.velocityY).toBeGreaterThan(0)
    expect(step.velocityX).toBeGreaterThan(0)
  })

  it('comes to rest through resistance', () => {
    const step = stepFling(
      { x: 400, y: 300, velocityX: 35, velocityY: 0 },
      0.05,
      centeredPet,
      workArea,
      100,
    )
    expect(step.stopped).toBe(true)
    expect(step.velocityX).toBe(0)
  })

  it('lets the transparent window leave the screen until the visible pet reaches the edge', () => {
    expect(centeredPet).toEqual({ offsetX: 88.5, offsetY: 150, width: 183, height: 198 })
    expect(clampToVisiblePet({ x: -500, y: -500 }, centeredPet, workArea)).toEqual({ x: -88.5, y: -150 })
    expect(clampToVisiblePet({ x: 2_000, y: 2_000 }, centeredPet, workArea)).toEqual({ x: 1_168.5, y: 552 })
  })

  it('faces along horizontal travel and preserves facing for a vertical throw', () => {
    expect(facingForFling(-400, 'right')).toBe('left')
    expect(facingForFling(400, 'left')).toBe('right')
    expect(facingForFling(0, 'left')).toBe('left')
  })

  it('keeps the visible pet fixed when the dock layout changes after a fling', () => {
    const leftPet = petCollisionBox({ width: 360, height: 348 }, { width: 183, height: 198 }, 'left')
    const previousPosition = { x: -88.5, y: 100 }
    const nextPosition = positionPreservingVisiblePet(previousPosition, centeredPet, leftPet)
    expect(nextPosition).toEqual({ x: 0, y: 100 })
    expect(previousPosition.x + centeredPet.offsetX).toBe(nextPosition.x + leftPet.offsetX)
  })
})
