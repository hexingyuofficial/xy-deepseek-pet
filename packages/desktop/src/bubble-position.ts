export interface Point {
  x: number
  y: number
}

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

export interface Size {
  width: number
  height: number
}

export type BubbleSide = 'top' | 'right' | 'bottom' | 'left'

function clamp(value: number, minimum: number, maximum: number): number {
  if (minimum > maximum) return (minimum + maximum) / 2
  return Math.min(maximum, Math.max(minimum, value))
}

function constrainAxisOffset(
  desired: number,
  baseStart: number,
  baseEnd: number,
  viewportLength: number,
  maximum: number,
  inset: number,
): number {
  const viewportMinimum = inset - baseStart
  const viewportMaximum = viewportLength - inset - baseEnd
  if (viewportMinimum > viewportMaximum) {
    // The bubble is larger than the usable viewport. Centering is the only
    // placement that clips both edges evenly and remains stable while dragging.
    return (viewportMinimum + viewportMaximum) / 2
  }

  const nearbyMinimum = -maximum
  const nearbyMaximum = maximum
  const minimum = Math.max(nearbyMinimum, viewportMinimum)
  const maximumAllowed = Math.min(nearbyMaximum, viewportMaximum)
  if (minimum <= maximumAllowed) return clamp(desired, minimum, maximumAllowed)

  // Near a window edge the pet-relative range and the visible viewport can be
  // disjoint. Keeping the complete bubble visible takes priority over range.
  return clamp(desired, viewportMinimum, viewportMaximum)
}

export function bubbleDragLimits(petSize: Size): Point {
  return {
    x: clamp(petSize.width * 0.45, 40, 120),
    y: clamp(petSize.height * 0.3, 32, 80),
  }
}

export function bubbleSideForCenter(center: Point, pet: Rect): BubbleSide {
  const petCenter = {
    x: (pet.left + pet.right) / 2,
    y: (pet.top + pet.bottom) / 2,
  }
  const horizontalRadius = Math.max(1, (pet.right - pet.left) / 2)
  const verticalRadius = Math.max(1, (pet.bottom - pet.top) / 2)
  const horizontal = (center.x - petCenter.x) / horizontalRadius
  const vertical = (center.y - petCenter.y) / verticalRadius
  if (Math.abs(horizontal) > Math.abs(vertical)) return horizontal < 0 ? 'left' : 'right'
  return vertical < 0 ? 'top' : 'bottom'
}

export function petPlacementAdjusted(previous: Point, next: Point, threshold = 0.5): boolean {
  return Math.abs(previous.x - next.x) > threshold || Math.abs(previous.y - next.y) > threshold
}

export function constrainBubbleOffset(
  desired: Point,
  baseRect: Rect,
  viewport: Size,
  maximum: Point,
  inset = 8,
): Point {
  return {
    x: constrainAxisOffset(desired.x, baseRect.left, baseRect.right, viewport.width, maximum.x, inset),
    y: constrainAxisOffset(desired.y, baseRect.top, baseRect.bottom, viewport.height, maximum.y, inset),
  }
}
