import { describe, expect, it } from 'vitest'
import { shortcutFromKey } from './shortcut-recorder.js'

describe('shortcut recorder', () => {
  it('records a cross-platform shortcut from macOS or Windows modifiers', () => {
    expect(shortcutFromKey({ key: 'w', metaKey: true, ctrlKey: false, altKey: false, shiftKey: true }))
      .toBe('CommandOrControl+Shift+W')
    expect(shortcutFromKey({ key: '7', metaKey: false, ctrlKey: true, altKey: true, shiftKey: false }))
      .toBe('CommandOrControl+Alt+7')
  })

  it('ignores incomplete and unsupported shortcuts', () => {
    expect(shortcutFromKey({ key: 'p', metaKey: false, ctrlKey: false, altKey: false, shiftKey: false }))
      .toBeUndefined()
    expect(shortcutFromKey({ key: 'Escape', metaKey: false, ctrlKey: false, altKey: false, shiftKey: false }))
      .toBeUndefined()
  })
})
