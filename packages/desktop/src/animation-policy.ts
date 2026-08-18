import type { ThemeAnimation, ThemeManifest } from './theme.js'

export const JACKPOT_PROBABILITY = 0.001

function itemAt<T>(items: readonly T[], random: number): T | undefined {
  if (items.length === 0) return undefined
  const bounded = Math.min(Math.max(random, 0), 1 - Number.EPSILON)
  return items[Math.floor(bounded * items.length)]
}

export function selectCompletionAnimation(
  manifest: ThemeManifest,
  jackpotRoll = Math.random(),
  variantRoll = Math.random(),
): ThemeAnimation {
  const fallback = manifest.animations.complete ?? manifest.animations.idle
  if (!fallback) throw new Error('Theme is missing complete and idle animations')
  const regular = manifest.completionVariants?.regular ?? [fallback]
  const jackpot = manifest.completionVariants?.jackpot ?? []
  if (jackpot.length > 0 && jackpotRoll < JACKPOT_PROBABILITY) {
    return itemAt(jackpot, variantRoll) ?? fallback
  }
  return itemAt(regular, variantRoll) ?? fallback
}

export function selectErrorSequence(
  manifest: ThemeManifest,
  random = Math.random(),
): { enter: ThemeAnimation; loop?: ThemeAnimation; exit?: ThemeAnimation } {
  const sequences = manifest.errorSequences ?? []
  const selected = itemAt(sequences, random)
  if (selected) return selected
  const fallback = manifest.animations.error ?? manifest.animations.idle
  if (!fallback) throw new Error('Theme is missing error and idle animations')
  return { enter: fallback }
}
