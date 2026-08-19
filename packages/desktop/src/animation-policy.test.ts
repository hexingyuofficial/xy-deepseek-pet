import { describe, expect, it } from 'vitest'
import {
  JACKPOT_PROBABILITY,
  completionFollowupState,
  isJackpotCompletionAnimation,
  selectCompletionAnimation,
  selectErrorSequence,
  shouldPlayStateChange,
  shouldSwitchWalkFacing,
  turnActivityDecision,
} from './animation-policy.js'
import type { ThemeAnimation, ThemeManifest } from './theme.js'

const animation = (name: string, loop = false): ThemeAnimation => ({
  kind: 'frames',
  files: [`${name}.png`],
  fps: 1,
  loop,
})

function manifest(): ThemeManifest {
  const idle = animation('idle', true)
  const complete = animation('complete')
  const error = animation('error')
  return {
    schemaVersion: 2,
    id: 'test-theme',
    name: 'Test theme',
    version: '1.0.0',
    license: 'MIT',
    canvas: { width: 64, height: 64 },
    animations: { idle, walk: idle, thinking: idle, working: idle, complete, error, offline: idle },
    completionVariants: {
      regular: [animation('regular-a'), animation('regular-b')],
      jackpot: [animation('treasure-a'), animation('treasure-b')],
    },
    errorSequences: [{ enter: animation('sink'), loop: animation('float', true), exit: animation('recover') }],
  }
}

describe('animation policy', () => {
  it('returns visually to idle after an unread completion without changing session state', () => {
    expect(completionFollowupState('complete', true)).toBe('idle')
  })

  it('lets newer active work interrupt completion and prevents stale follow-up playback', () => {
    expect(shouldPlayStateChange('complete', 'thinking', false, true)).toBe(true)
    expect(shouldPlayStateChange('complete', 'working', false, true)).toBe(true)
    expect(completionFollowupState('thinking', false)).toBeUndefined()
  })

  it('allows acknowledgement to clear unread state without cutting off completion', () => {
    expect(shouldPlayStateChange('complete', 'idle', false, true)).toBe(false)
    expect(shouldPlayStateChange('complete', 'idle', false, false)).toBe(true)
  })

  it('does not interrupt the underwater loop for a question or approval pause', () => {
    expect(shouldPlayStateChange('thinking', 'needsInput', false, false)).toBe(false)
    expect(shouldPlayStateChange('working', 'needsInput', false, false)).toBe(false)
    expect(shouldPlayStateChange('needsInput', 'thinking', false, false)).toBe(false)
    expect(shouldPlayStateChange('needsInput', 'working', false, false)).toBe(false)
  })

  it('switches the walk animation only when an active walk changes direction', () => {
    expect(shouldSwitchWalkFacing('walk', 'walk', 'right', 'left')).toBe(true)
    expect(shouldSwitchWalkFacing('walk', 'walk', 'left', 'left')).toBe(false)
    expect(shouldSwitchWalkFacing('idle', 'walk', 'right', 'left')).toBe(false)
    expect(shouldSwitchWalkFacing('thinking', 'thinking', 'right', 'left')).toBe(false)
    expect(shouldSwitchWalkFacing('working', 'working', 'right', 'left')).toBe(false)
  })

  it('plays thinking entry once per official session turn', () => {
    expect(turnActivityDecision('thinking', 'one', 1, undefined)).toEqual({ remember: true, enterThinking: true })
    expect(turnActivityDecision('working', 'one', 1, 1)).toEqual({ remember: false, enterThinking: false })
    expect(turnActivityDecision('thinking', 'one', 1, 1)).toEqual({ remember: false, enterThinking: false })
    expect(turnActivityDecision('thinking', 'one', 2, 1)).toEqual({ remember: true, enterThinking: true })
    expect(turnActivityDecision('working', 'two', 1, undefined)).toEqual({ remember: true, enterThinking: false })
  })

  it('keeps the jackpot branch fixed at one in one thousand', () => {
    const petTheme = manifest()
    const selected = selectCompletionAnimation(petTheme, 0.0009, 0.75)
    expect(JACKPOT_PROBABILITY).toBe(0.001)
    expect((selected as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('treasure-b.png')
    expect(isJackpotCompletionAnimation(petTheme, selected)).toBe(true)
    expect(isJackpotCompletionAnimation(petTheme, selectCompletionAnimation(petTheme, 0.001, 0.75))).toBe(false)
  })

  it('selects regular variants and correlated error sequences uniformly', () => {
    expect((selectCompletionAnimation(manifest(), 0.5, 0) as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('regular-a.png')
    const sequence = selectErrorSequence(manifest(), 0.5)
    expect((sequence.enter as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('sink.png')
    expect((sequence.loop! as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('float.png')
  })
})
