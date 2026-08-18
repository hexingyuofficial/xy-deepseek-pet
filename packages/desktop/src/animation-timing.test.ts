import { describe, expect, it } from 'vitest'
import { animationFrameIndices, nextAnimationDeadline, pacedFrameDuration } from './animation-timing.js'

describe('animation timing', () => {
  it('subtracts rendering time from the next frame delay', () => {
    expect(nextAnimationDeadline(1_000, 16, 1_006)).toEqual({ deadline: 1_016, delay: 10 })
  })

  it('keeps the timeline moving without skipping an overdue frame', () => {
    expect(nextAnimationDeadline(1_000, 16, 1_025)).toEqual({ deadline: 1_016, delay: 0 })
  })

  it('skips only alternating lead-in frames and preserves the complete ending', () => {
    expect(animationFrameIndices(10, 'fast-start-showcase')).toEqual([0, 2, 4, 5, 6, 7, 8, 9])
  })

  it('slows only the final showcase frames', () => {
    expect(pacedFrameDuration(1000 / 60, 7, 10, 'fast-start-showcase')).toBeCloseTo(1000 / 60)
    expect(pacedFrameDuration(1000 / 60, 8, 10, 'fast-start-showcase')).toBeCloseTo(1000 / 28)
  })
})
