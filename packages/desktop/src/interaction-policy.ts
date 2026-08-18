import type { PetState } from '@xy-deepseek-pet/protocol'

export function preservesActiveAnimation(state: PetState): boolean {
  return state === 'thinking' || state === 'working'
}

export function shouldDismissComposer(
  targetSessionId: string | undefined,
  targetInsideComposer: boolean,
): boolean {
  return targetSessionId !== undefined && !targetInsideComposer
}
