export interface ScreenPoint {
  x: number
  y: number
}

export function isScreenPoint(value: unknown): value is ScreenPoint {
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return typeof point.x === 'number' && Number.isFinite(point.x) &&
    typeof point.y === 'number' && Number.isFinite(point.y)
}

export function draggedWindowPosition(startCursor: ScreenPoint, startWindow: ScreenPoint, cursor: ScreenPoint): ScreenPoint {
  return {
    x: Math.round(startWindow.x + cursor.x - startCursor.x),
    y: Math.round(startWindow.y + cursor.y - startCursor.y),
  }
}
