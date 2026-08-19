import type { PetState } from '@xy-deepseek-pet/protocol'

export function preservesActiveAnimation(state: PetState): boolean {
  return state === 'thinking' || state === 'working' || state === 'needsInput'
}

export function shouldDismissComposer(
  targetSessionId: string | undefined,
  targetInsideComposer: boolean,
): boolean {
  return targetSessionId !== undefined && !targetInsideComposer
}

export function shouldPausePointerChase(regionHovered: boolean, regionContainsFocus: boolean): boolean {
  return regionHovered || regionContainsFocus
}
