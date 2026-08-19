export interface ScreenPoint {
  x: number
  y: number
}

export const ELECTRON_COORDINATE_MIN = -2_147_483_648
export const ELECTRON_COORDINATE_MAX = 2_147_483_647

export function normalizeWindowCoordinate(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(ELECTRON_COORDINATE_MAX, Math.max(ELECTRON_COORDINATE_MIN, Math.round(value)))
}

export function normalizeWindowPosition(position: ScreenPoint, fallback: ScreenPoint = { x: 0, y: 0 }): ScreenPoint {
  return {
    x: normalizeWindowCoordinate(position.x, fallback.x),
    y: normalizeWindowCoordinate(position.y, fallback.y),
  }
}

export function isScreenPoint(value: unknown): value is ScreenPoint {
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return typeof point.x === 'number' && Number.isFinite(point.x) &&
    typeof point.y === 'number' && Number.isFinite(point.y)
}

export function draggedWindowPosition(startCursor: ScreenPoint, startWindow: ScreenPoint, cursor: ScreenPoint): ScreenPoint {
  return normalizeWindowPosition({
    x: startWindow.x + cursor.x - startCursor.x,
    y: startWindow.y + cursor.y - startCursor.y,
  })
}
