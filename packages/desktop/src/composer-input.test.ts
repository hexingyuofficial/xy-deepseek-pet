import { describe, expect, it } from 'vitest'
import { shouldSubmitComposer } from './composer-input.js'

describe('compact composer keyboard input', () => {
  it('submits a plain Enter press', () => {
    expect(shouldSubmitComposer({ key: 'Enter', shiftKey: false, isComposing: false, keyCode: 13 })).toBe(true)
  })

  it('keeps Shift+Enter as a newline', () => {
    expect(shouldSubmitComposer({ key: 'Enter', shiftKey: true, isComposing: false, keyCode: 13 })).toBe(false)
  })

  it('does not submit while an IME is composing', () => {
    expect(shouldSubmitComposer({ key: 'Enter', shiftKey: false, isComposing: true, keyCode: 229 })).toBe(false)
  })
})
