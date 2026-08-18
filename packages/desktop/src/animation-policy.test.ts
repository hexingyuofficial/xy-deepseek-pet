import { describe, expect, it } from 'vitest'
import { JACKPOT_PROBABILITY, selectCompletionAnimation, selectErrorSequence } from './animation-policy.js'
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
  it('keeps the jackpot branch fixed at one in one thousand', () => {
    expect(JACKPOT_PROBABILITY).toBe(0.001)
    expect((selectCompletionAnimation(manifest(), 0.0009, 0.75) as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('treasure-b.png')
    expect((selectCompletionAnimation(manifest(), 0.001, 0.75) as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('regular-b.png')
  })

  it('selects regular variants and correlated error sequences uniformly', () => {
    expect((selectCompletionAnimation(manifest(), 0.5, 0) as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('regular-a.png')
    const sequence = selectErrorSequence(manifest(), 0.5)
    expect((sequence.enter as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('sink.png')
    expect((sequence.loop! as Extract<ThemeAnimation, { kind: 'frames' }>).files[0]).toBe('float.png')
  })
})
