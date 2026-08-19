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

function clamp(value: number, minimum: number, maximum: number): number {
  if (minimum > maximum) return (minimum + maximum) / 2
  return Math.min(maximum, Math.max(minimum, value))
}

export function bubbleDragLimits(petSize: Size): Point {
  return {
    x: clamp(petSize.width * 0.45, 40, 120),
    y: clamp(petSize.height * 0.3, 32, 80),
  }
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
  const minimumX = Math.max(-maximum.x, inset - baseRect.left)
  const maximumX = Math.min(maximum.x, viewport.width - inset - baseRect.right)
  const minimumY = Math.max(-maximum.y, inset - baseRect.top)
  const maximumY = Math.min(maximum.y, viewport.height - inset - baseRect.bottom)
  return {
    x: clamp(desired.x, minimumX, maximumX),
    y: clamp(desired.y, minimumY, maximumY),
  }
}
