import { describe, expect, it } from 'vitest'
import { canStartVoiceInput, gestureAction, preservesActiveAnimation, shouldDismissComposer, shouldPausePointerChase, shouldRecoverLostPointerRelease, VOICE_LONG_PRESS_MS } from './interaction-policy.js'

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

  it('keeps the voice composer open while a pet gesture stops recording', () => {
    expect(shouldDismissComposer('session-one', false, true)).toBe(false)
  })

  it('pauses pointer chasing while a pet surface is hovered or contains keyboard focus', () => {
    expect(shouldPausePointerChase(true, false)).toBe(true)
    expect(shouldPausePointerChase(false, true)).toBe(true)
    expect(shouldPausePointerChase(false, false)).toBe(false)
  })

  it('starts voice input only for a stationary hold outside active turns', () => {
    expect(canStartVoiceInput('idle', true, true, 4)).toBe(true)
    expect(canStartVoiceInput('thinking', true, true, 0)).toBe(false)
    expect(canStartVoiceInput('working', true, true, 0)).toBe(false)
    expect(canStartVoiceInput('needsInput', true, true, 0)).toBe(false)
    expect(canStartVoiceInput('idle', false, true, 0)).toBe(false)
    expect(canStartVoiceInput('idle', true, true, 5)).toBe(false)
  })

  it('recovers a drag when a remote session drops pointerup but reports no pressed button', () => {
    expect(shouldRecoverLostPointerRelease(true, 0)).toBe(true)
    expect(shouldRecoverLostPointerRelease(true, 2)).toBe(true)
    expect(shouldRecoverLostPointerRelease(true, 1)).toBe(false)
    expect(shouldRecoverLostPointerRelease(true, 3)).toBe(false)
    expect(shouldRecoverLostPointerRelease(false, 0)).toBe(false)
  })

  it('keeps double-click and long-press actions independent with a 0.5 second hold', () => {
    expect(VOICE_LONG_PRESS_MS).toBe(500)
    expect(gestureAction('doubleClick', 'openHarness', 'voice')).toBe('openHarness')
    expect(gestureAction('longPress', 'openHarness', 'voice')).toBe('voice')
    expect(gestureAction('doubleClick', 'voice', 'openHarness')).toBe('voice')
    expect(gestureAction('doubleClick', 'openRecentChat', 'voice')).toBe('openRecentChat')
    expect(gestureAction('longPress', 'voice', 'openRecentChat')).toBe('openRecentChat')
    expect(gestureAction('doubleClick', 'none', 'voice')).toBe('none')
    expect(gestureAction('longPress', 'voice', 'none')).toBe('none')
  })
})
