import { describe, expect, it } from 'vitest'
import { displaySessionTitle, formatSessionAge } from './session-display.js'

describe('session bubble relative time', () => {
  const now = 1_000_000

  it('uses compact Chinese labels', () => {
    expect(formatSessionAge(now - 10_000, now, 'zh-CN')).toBe('刚刚')
    expect(formatSessionAge(now - 5 * 60_000, now, 'zh-CN')).toBe('5分钟前')
    expect(formatSessionAge(now - 2 * 60 * 60_000, now, 'zh-CN')).toBe('2小时前')
  })

  it('uses compact English labels', () => {
    expect(formatSessionAge(now - 45_000, now, 'en')).toBe('45s ago')
    expect(formatSessionAge(now - 3 * 24 * 60 * 60_000, now, 'en')).toBe('3d ago')
  })
})

describe('session bubble title', () => {
  it('keeps the real Harness title and localizes only the missing-title fallback', () => {
    expect(displaySessionTitle('  Hello   world  ', 'zh-CN')).toBe('Hello world')
    expect(displaySessionTitle('', 'zh-CN')).toBe('未命名会话')
    expect(displaySessionTitle('', 'en')).toBe('Untitled session')
  })
})
