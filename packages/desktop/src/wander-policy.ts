export const DEFAULT_WANDER_FREQUENCY = 70
export const DEFAULT_WANDER_DISTANCE = 35
export const DEFAULT_MOUSE_CHASE_SPEED = 40
export const MIN_MOUSE_CHASE_STOP_RADIUS = 96
export const MOUSE_CHASE_WINDOW_CLEARANCE = 32

export interface WanderOffset {
  x: number
  y: number
  facing: 'left' | 'right'
}

export interface AutonomousMovementContext {
  walkingEnabled: boolean
  mouseChaseEnabled: boolean
  reducedMotion: boolean
  interactionPaused: boolean
  dragging: boolean
  state: string
}

export interface PetAnchorLayout {
  windowPosition: { x: number; y: number }
  windowSize: { width: number; height: number }
  petSize: { width: number; height: number }
  dock: 'left' | 'center' | 'right'
}

function normalizedLevel(value: number): number {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
}

export function wanderIntervalMs(frequency: number): number {
  return Math.round(60_000 - normalizedLevel(frequency) * 520)
}

export function canWander(context: AutonomousMovementContext): boolean {
  return context.walkingEnabled &&
    !context.mouseChaseEnabled &&
    !context.reducedMotion &&
    !context.interactionPaused &&
    !context.dragging &&
    context.state === 'idle'
}

export function petVisualAnchor(layout: PetAnchorLayout): { x: number; y: number } {
  const { windowPosition, windowSize, petSize, dock } = layout
  const x = dock === 'left'
    ? windowPosition.x + petSize.width / 2
    : dock === 'right'
      ? windowPosition.x + windowSize.width - petSize.width / 2
      : windowPosition.x + windowSize.width / 2
  return {
    x,
    y: windowPosition.y + windowSize.height - petSize.height / 2,
  }
}

export function selectWanderOffset(distance: number, random: () => number = Math.random): WanderOffset {
  const level = normalizedLevel(distance)
  const horizontalDirection = random() >= 0.5 ? 1 : -1
  const minimumHorizontal = 16 + Math.round(level * 0.23)
  const maximumHorizontal = 32 + Math.round(level * 0.8)
  const horizontalDistance = minimumHorizontal + Math.round(random() * (maximumHorizontal - minimumHorizontal))
  const verticalRoll = random()
  const verticalDirection = verticalRoll < 0.25 ? 0 : verticalRoll < 0.625 ? -1 : 1
  const minimumVertical = 8 + Math.round(level * 0.11)
  const maximumVertical = 18 + Math.round(level * 0.51)
  const verticalDistance = verticalDirection === 0
    ? 0
    : minimumVertical + Math.round(random() * (maximumVertical - minimumVertical))

  return {
    x: horizontalDirection * horizontalDistance,
    y: verticalDirection * verticalDistance,
    facing: horizontalDirection < 0 ? 'left' : 'right',
  }
}

export function mouseChaseStopRadius(
  scale: number,
  windowSize?: { width: number; height: number },
): number {
  const safeScale = Number.isFinite(scale) ? Math.min(2, Math.max(0.2, scale)) : 1
  const petRadius = MIN_MOUSE_CHASE_STOP_RADIUS * Math.max(1, safeScale)
  const windowRadius = windowSize
    ? Math.hypot(Math.max(0, windowSize.width) / 2, Math.max(0, windowSize.height) / 2) + MOUSE_CHASE_WINDOW_CLEARANCE
    : 0
  return Math.ceil(Math.max(petRadius, windowRadius))
}

export function chaseStep(
  from: { x: number; y: number },
  target: { x: number; y: number },
  speed: number,
  stopRadius = MIN_MOUSE_CHASE_STOP_RADIUS,
): WanderOffset | undefined {
  const deltaX = target.x - from.x
  const deltaY = target.y - from.y
  const distance = Math.hypot(deltaX, deltaY)
  if (distance <= stopRadius) return undefined
  const maximumStep = 2 + normalizedLevel(speed) * 0.13
  const step = Math.min(maximumStep, distance - stopRadius)
  const x = Math.round(deltaX / distance * step)
  const y = Math.round(deltaY / distance * step)
  if (x === 0 && y === 0) return undefined
  return {
    x,
    y,
    facing: deltaX < 0 ? 'left' : 'right',
  }
}
