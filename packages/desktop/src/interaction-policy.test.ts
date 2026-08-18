import { describe, expect, it } from 'vitest'
import { preservesActiveAnimation, shouldDismissComposer } from './interaction-policy.js'

describe('desktop interaction policy', () => {
  it('keeps thinking and tool work loops invariant under local pet gestures', () => {
    expect(preservesActiveAnimation('thinking')).toBe(true)
    expect(preservesActiveAnimation('working')).toBe(true)
    expect(preservesActiveAnimation('idle')).toBe(false)
    expect(preservesActiveAnimation('error')).toBe(false)
  })

  it('dismisses an active composer only for an outside activation', () => {
    expect(shouldDismissComposer('session-one', false)).toBe(true)
    expect(shouldDismissComposer('session-one', true)).toBe(false)
    expect(shouldDismissComposer(undefined, false)).toBe(false)
  })
})
