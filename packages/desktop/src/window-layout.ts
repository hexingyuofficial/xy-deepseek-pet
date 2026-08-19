export type WindowDock = 'left' | 'center' | 'right'

export interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}

export interface WorkArea {
  x: number
  y: number
  width: number
  height: number
}

export interface PetPlacement {
  windowPosition: { x: number; y: number }
  petOffset: { x: number; y: number }
  petPosition: { x: number; y: number }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function resolvePetOffset(
  petPosition: { x: number; y: number },
  windowPosition: { x: number; y: number },
  windowSize: { width: number; height: number },
  petSize: { width: number; height: number },
): { x: number; y: number } {
  const width = Math.min(windowSize.width, Math.max(1, petSize.width))
  const height = Math.min(windowSize.height, Math.max(1, petSize.height))
  return {
    x: clamp(petPosition.x - windowPosition.x, 0, windowSize.width - width),
    y: clamp(petPosition.y - windowPosition.y, 0, windowSize.height - height),
  }
}

export function resolvePetPlacement(
  desiredPetPosition: { x: number; y: number },
  windowSize: { width: number; height: number },
  petSize: { width: number; height: number },
  displayBounds: WorkArea,
  preferredOffset: { x: number; y: number },
): PetPlacement {
  const width = Math.min(windowSize.width, Math.max(1, petSize.width))
  const height = Math.min(windowSize.height, Math.max(1, petSize.height))
  const preferredX = Math.max(0, (windowSize.width - width) / 2)
  const petPosition = {
    x: clamp(desiredPetPosition.x, displayBounds.x, displayBounds.x + displayBounds.width - width),
    y: clamp(desiredPetPosition.y, displayBounds.y, displayBounds.y + displayBounds.height - height),
  }
  const maximumWindowX = Math.max(displayBounds.x, displayBounds.x + displayBounds.width - windowSize.width)
  const maximumWindowY = Math.max(displayBounds.y, displayBounds.y + displayBounds.height - windowSize.height)
  const windowPosition = {
    x: Math.round(clamp(petPosition.x - preferredX, displayBounds.x, maximumWindowX)),
    y: Math.round(clamp(petPosition.y - preferredOffset.y, displayBounds.y, maximumWindowY)),
  }
  return {
    windowPosition,
    petOffset: resolvePetOffset(petPosition, windowPosition, windowSize, petSize),
    petPosition,
  }
}

export function clampWindowPosition(
  position: { x: number; y: number },
  size: { width: number; height: number },
  workArea: WorkArea,
): { x: number; y: number } {
  const maximumX = Math.max(workArea.x, workArea.x + workArea.width - size.width)
  const maximumY = Math.max(workArea.y, workArea.y + workArea.height - size.height)
  return {
    x: Math.round(Math.min(Math.max(position.x, workArea.x), maximumX)),
    y: Math.round(Math.min(Math.max(position.y, workArea.y), maximumY)),
  }
}

export function selectWindowDock(
  window: WindowRect,
  workArea: WorkArea,
  threshold = 48,
): WindowDock {
  const leftGap = window.x - workArea.x
  const rightGap = workArea.x + workArea.width - (window.x + window.width)
  if (leftGap <= threshold) return 'left'
  if (rightGap <= threshold) return 'right'
  return 'center'
}

export function selectPetWindowDock(
  petPosition: { x: number; y: number },
  petSize: { width: number; height: number },
  windowPosition: { x: number; y: number },
  windowSize: { width: number; height: number },
  threshold = 48,
): WindowDock {
  return selectWindowDock({
    x: petPosition.x - windowPosition.x,
    y: petPosition.y - windowPosition.y,
    width: petSize.width,
    height: petSize.height,
  }, {
    x: 0,
    y: 0,
    width: windowSize.width,
    height: windowSize.height,
  }, threshold)
}
