import { describe, expect, it } from 'vitest'
import { preservesActiveAnimation, shouldDismissComposer, shouldPausePointerChase } from './interaction-policy.js'

describe('desktop interaction policy', () => {
  it('keeps the active turn underwater through work, questions, and approvals', () => {
    expect(preservesActiveAnimation('thinking')).toBe(true)
    expect(preservesActiveAnimation('working')).toBe(true)
    expect(preservesActiveAnimation('needsInput')).toBe(true)
    expect(preservesActiveAnimation('idle')).toBe(false)
    expect(preservesActiveAnimation('error')).toBe(false)
  })

  it('dismisses an active composer only for an outside activation', () => {
    expect(shouldDismissComposer('session-one', false)).toBe(true)
    expect(shouldDismissComposer('session-one', true)).toBe(false)
    expect(shouldDismissComposer(undefined, false)).toBe(false)
  })

  it('pauses pointer chasing while a pet surface is hovered or contains keyboard focus', () => {
    expect(shouldPausePointerChase(true, false)).toBe(true)
    expect(shouldPausePointerChase(false, true)).toBe(true)
    expect(shouldPausePointerChase(false, false)).toBe(false)
  })
})
