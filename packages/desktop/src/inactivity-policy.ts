import type { PetState } from '@xy-deepseek-pet/protocol'

export const SLEEP_AFTER_MS = 10 * 60 * 1000

export function shouldEnterSleep(state: PetState, lastInteractionAt: number, now: number): boolean {
  return state === 'idle' && now - lastInteractionAt >= SLEEP_AFTER_MS
}

export function stateAfterInteraction(state: PetState): PetState {
  return state === 'sleep' ? 'idle' : state
}
