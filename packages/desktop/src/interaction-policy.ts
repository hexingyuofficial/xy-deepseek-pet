import type { PetState } from '@xy-deepseek-pet/protocol'

export function preservesActiveAnimation(state: PetState): boolean {
  return state === 'thinking' || state === 'working' || state === 'needsInput'
}

export function shouldDismissComposer(
  targetSessionId: string | undefined,
  targetInsideComposer: boolean,
  preserveForVoiceGesture = false,
): boolean {
  return targetSessionId !== undefined && !targetInsideComposer && !preserveForVoiceGesture
}

export function shouldPausePointerChase(regionHovered: boolean, regionContainsFocus: boolean): boolean {
  return regionHovered || regionContainsFocus
}

export function canStartVoiceInput(state: PetState, enabled: boolean, dragging: boolean, dragDistance: number): boolean {
  return enabled && dragging && dragDistance <= 4 && !preservesActiveAnimation(state)
}

export function shouldRecoverLostPointerRelease(dragging: boolean, buttons: number): boolean {
  return dragging && (buttons & 1) === 0
}

export const VOICE_LONG_PRESS_MS = 500

export type InteractionAction = 'none' | 'voice' | 'openRecentChat' | 'openHarness'

export function gestureAction(
  gesture: 'doubleClick' | 'longPress',
  doubleClickAction: InteractionAction,
  longPressAction: InteractionAction,
): InteractionAction {
  return gesture === 'doubleClick' ? doubleClickAction : longPressAction
}
