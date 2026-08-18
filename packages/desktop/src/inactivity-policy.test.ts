import { describe, expect, it } from 'vitest'
import { SLEEP_AFTER_MS, shouldEnterSleep, stateAfterInteraction } from './inactivity-policy.js'

describe('inactivity sleep policy', () => {
  it('sleeps only after ten idle minutes', () => {
    expect(shouldEnterSleep('idle', 1_000, 1_000 + SLEEP_AFTER_MS - 1)).toBe(false)
    expect(shouldEnterSleep('idle', 1_000, 1_000 + SLEEP_AFTER_MS)).toBe(true)
    expect(shouldEnterSleep('thinking', 1_000, 1_000 + SLEEP_AFTER_MS)).toBe(false)
  })

  it('wakes a sleeping presentation without changing business states', () => {
    expect(stateAfterInteraction('sleep')).toBe('idle')
    expect(stateAfterInteraction('error')).toBe('error')
  })
})
