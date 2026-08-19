import { describe, expect, it } from 'vitest'
import { canWander, chaseStep, mouseChaseStopRadius, petVisualAnchor, selectWanderOffset, wanderIntervalMs } from './wander-policy.js'

function randomSequence(...values: number[]): () => number {
  let index = 0
  return () => values[index++] ?? 0
}

describe('desktop wandering policy', () => {
  it('maps the fun frequency slider from occasional to frequent', () => {
    expect(wanderIntervalMs(0)).toBe(60_000)
    expect(wanderIntervalMs(100)).toBe(8_000)
  })

  it('does not wander while the pointer is interacting with a pet surface', () => {
    const idle = {
      walkingEnabled: true,
      mouseChaseEnabled: false,
      reducedMotion: false,
      interactionPaused: false,
      dragging: false,
      state: 'idle',
    }
    expect(canWander(idle)).toBe(true)
    expect(canWander({ ...idle, interactionPaused: true })).toBe(false)
  })

  it('can move diagonally up and left', () => {
    expect(selectWanderOffset(35, randomSequence(0.1, 0.5, 0.4, 0.5))).toEqual({
      x: -42,
      y: -24,
      facing: 'left',
    })
  })

  it('can move diagonally down and right', () => {
    expect(selectWanderOffset(100, randomSequence(0.9, 1, 0.9, 1))).toEqual({
      x: 112,
      y: 69,
      facing: 'right',
    })
  })

  it('still allows horizontal movement', () => {
    expect(selectWanderOffset(35, randomSequence(0.9, 0, 0.1))).toEqual({
      x: 24,
      y: 0,
      facing: 'right',
    })
  })

  it('takes bounded steps toward the pointer and leaves a clear click radius', () => {
    expect(chaseStep({ x: 0, y: 0 }, { x: 200, y: 0 }, 40)).toEqual({ x: 7, y: 0, facing: 'right' })
    expect(chaseStep({ x: 0, y: 0 }, { x: 100, y: 0 }, 100)).toEqual({ x: 4, y: 0, facing: 'right' })
    expect(chaseStep({ x: 5, y: 0 }, { x: 100, y: 0 }, 100)).toBeUndefined()
    expect(chaseStep({ x: 3.6, y: 0 }, { x: 100, y: 0 }, 100)).toBeUndefined()
  })

  it('grows the click radius for large pets without shrinking it for tiny pets', () => {
    expect(mouseChaseStopRadius(0.2)).toBe(96)
    expect(mouseChaseStopRadius(1)).toBe(96)
    expect(mouseChaseStopRadius(2)).toBe(192)
  })

  it('adds substantial clearance for the transparent window footprint while chasing', () => {
    const size = { width: 360, height: 348 }
    const radius = mouseChaseStopRadius(0.65, size)
    expect(radius).toBeGreaterThan(Math.hypot(size.width / 2, size.height / 2))
    expect(radius).toBe(283)
  })

  it('tracks the visible pet center when the transparent window is docked', () => {
    const base = {
      windowPosition: { x: 100, y: 50 },
      windowSize: { width: 360, height: 348 },
      petSize: { width: 128, height: 128 },
    }
    expect(petVisualAnchor({ ...base, dock: 'left' })).toEqual({ x: 164, y: 334 })
    expect(petVisualAnchor({ ...base, dock: 'center' })).toEqual({ x: 280, y: 334 })
    expect(petVisualAnchor({ ...base, dock: 'right' })).toEqual({ x: 396, y: 334 })
  })

  it('chases toward the pointer from a docked pet instead of the window center', () => {
    const anchor = petVisualAnchor({
      windowPosition: { x: 0, y: 0 },
      windowSize: { width: 360, height: 348 },
      petSize: { width: 128, height: 128 },
      dock: 'left',
    })
    expect(chaseStep(anchor, { x: 160, y: 100 }, 40, 96)?.facing).toBe('right')
  })
})
