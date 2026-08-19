import type { PetState } from '@xy-deepseek-pet/protocol'
import type { ThemeAnimation, ThemeManifest } from './theme.js'

export const JACKPOT_PROBABILITY = 0.001

export interface TurnActivityDecision {
  remember: boolean
  enterThinking: boolean
}

export function turnActivityDecision(
  state: PetState,
  sessionId: string | undefined,
  turn: number | undefined,
  lastObservedTurn: number | undefined,
): TurnActivityDecision {
  const active = state === 'thinking' || state === 'working' || state === 'needsInput'
  if (!active || !sessionId || turn === undefined || turn === lastObservedTurn) {
    return { remember: false, enterThinking: false }
  }
  return { remember: true, enterThinking: state === 'thinking' }
}

export function completionFollowupState(
  currentState: PetState,
  completionIsCurrent: boolean,
): PetState | undefined {
  if (!completionIsCurrent) return undefined
  return currentState === 'complete' ? 'idle' : currentState
}

export function shouldPlayStateChange(
  previousState: PetState | undefined,
  nextState: PetState,
  holdingPress: boolean,
  completionActive: boolean,
): boolean {
  if (previousState === nextState || holdingPress) return false
  const activeTurnStates: readonly PetState[] = ['thinking', 'working', 'needsInput']
  if (previousState && activeTurnStates.includes(previousState) && activeTurnStates.includes(nextState)) return false
  return !(previousState === 'complete' && nextState === 'idle' && completionActive)
}

export function shouldSwitchWalkFacing(
  previousState: PetState | undefined,
  nextState: PetState,
  previousFacing: 'left' | 'right' | undefined,
  nextFacing: 'left' | 'right',
): boolean {
  return previousState === 'walk'
    && nextState === 'walk'
    && previousFacing !== undefined
    && previousFacing !== nextFacing
}

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

export function isJackpotCompletionAnimation(manifest: ThemeManifest, animation: ThemeAnimation): boolean {
  return manifest.completionVariants?.jackpot?.includes(animation) === true
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
