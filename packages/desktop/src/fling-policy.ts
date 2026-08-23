import type { WorkArea } from './window-layout.js'
import type { WindowDock } from './window-layout.js'

export interface FlingSample {
  x: number
  y: number
  time: number
}

export interface FlingMotion {
  x: number
  y: number
  velocityX: number
  velocityY: number
}

export interface FlingStep extends FlingMotion {
  stopped: boolean
}

export interface PetCollisionBox {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

const SAMPLE_WINDOW_MS = 120
const MIN_SAMPLE_SPAN_MS = 24
const MIN_FLING_SPEED = 420
const MAX_FLING_SPEED = 4_000
const STOP_SPEED = 28
const EDGE_RESTITUTION = 0.82

function reflectAxis(
  position: number,
  velocity: number,
  minimum: number,
  maximum: number,
): { position: number; velocity: number } {
  if (maximum <= minimum) return { position: minimum, velocity: 0 }

  let nextPosition = position
  let nextVelocity = velocity
  // A large frame can cross an edge more than once. Folding the overshoot back
  // into the range keeps collision behavior independent of timer cadence.
  while (nextPosition < minimum || nextPosition > maximum) {
    if (nextPosition < minimum) {
      nextPosition = minimum + (minimum - nextPosition)
      nextVelocity = Math.abs(nextVelocity) * EDGE_RESTITUTION
    } else {
      nextPosition = maximum - (nextPosition - maximum)
      nextVelocity = -Math.abs(nextVelocity) * EDGE_RESTITUTION
    }
  }

  // Electron may report a rounded position exactly on an edge. If its velocity
  // still points outwards, treat that contact as a collision instead of letting
  // the normal component disappear into repeated clamping.
  if (nextPosition <= minimum && nextVelocity < 0) {
    nextPosition = minimum
    nextVelocity = Math.abs(nextVelocity) * EDGE_RESTITUTION
  } else if (nextPosition >= maximum && nextVelocity > 0) {
    nextPosition = maximum
    nextVelocity = -Math.abs(nextVelocity) * EDGE_RESTITUTION
  }

  return { position: nextPosition, velocity: nextVelocity }
}

export function flingDeceleration(resistance: number): number {
  const level = Math.min(100, Math.max(0, resistance)) / 100
  return 260 + level * 1_940
}

export function estimateFlingVelocity(samples: readonly FlingSample[]): { x: number; y: number } | undefined {
  if (samples.length < 2) return undefined
  const latest = samples.at(-1)!
  const recent = samples.filter((sample) => latest.time - sample.time <= SAMPLE_WINDOW_MS)
  const earliest = recent[0]
  if (!earliest) return undefined
  const elapsed = latest.time - earliest.time
  if (elapsed < MIN_SAMPLE_SPAN_MS) return undefined
  let x = (latest.x - earliest.x) * 1_000 / elapsed
  let y = (latest.y - earliest.y) * 1_000 / elapsed
  const speed = Math.hypot(x, y)
  if (speed < MIN_FLING_SPEED) return undefined
  if (speed > MAX_FLING_SPEED) {
    const scale = MAX_FLING_SPEED / speed
    x *= scale
    y *= scale
  }
  return { x, y }
}

export function flingUsesMovementAnimation(state: string): boolean {
  return state === 'idle' || state === 'walk'
}

export function petCollisionBox(
  windowSize: { width: number; height: number },
  petSize: { width: number; height: number },
  dock: WindowDock,
): PetCollisionBox {
  const width = Math.min(windowSize.width, Math.max(1, petSize.width))
  const height = Math.min(windowSize.height, Math.max(1, petSize.height))
  const offsetX = dock === 'left'
    ? 0
    : dock === 'right'
      ? windowSize.width - width
      : (windowSize.width - width) / 2
  return { offsetX, offsetY: windowSize.height - height, width, height }
}

export function clampToVisiblePet(
  position: { x: number; y: number },
  pet: PetCollisionBox,
  workArea: WorkArea,
): { x: number; y: number } {
  const minimumX = workArea.x - pet.offsetX
  const minimumY = workArea.y - pet.offsetY
  const maximumX = workArea.x + workArea.width - pet.offsetX - pet.width
  const maximumY = workArea.y + workArea.height - pet.offsetY - pet.height
  return {
    x: Math.min(maximumX, Math.max(minimumX, position.x)),
    y: Math.min(maximumY, Math.max(minimumY, position.y)),
  }
}

export function facingForFling(velocityX: number, previous: 'left' | 'right', threshold = 20): 'left' | 'right' {
  if (velocityX < -threshold) return 'left'
  if (velocityX > threshold) return 'right'
  return previous
}

export function positionPreservingVisiblePet(
  position: { x: number; y: number },
  previous: PetCollisionBox,
  next: PetCollisionBox,
): { x: number; y: number } {
  return {
    x: position.x + previous.offsetX - next.offsetX,
    y: position.y + previous.offsetY - next.offsetY,
  }
}

export function stepFling(
  motion: FlingMotion,
  elapsedSeconds: number,
  pet: PetCollisionBox,
  workArea: WorkArea,
  resistance: number,
): FlingStep {
  const elapsed = Math.min(0.05, Math.max(0, elapsedSeconds))
  const speed = Math.hypot(motion.velocityX, motion.velocityY)
  const nextSpeed = Math.max(0, speed - flingDeceleration(resistance) * elapsed)
  const velocityScale = speed > 0 ? nextSpeed / speed : 0
  let velocityX = motion.velocityX * velocityScale
  let velocityY = motion.velocityY * velocityScale
  let x = motion.x + (motion.velocityX + velocityX) * 0.5 * elapsed
  let y = motion.y + (motion.velocityY + velocityY) * 0.5 * elapsed

  const minimumX = workArea.x - pet.offsetX
  const minimumY = workArea.y - pet.offsetY
  const maximumX = workArea.x + workArea.width - pet.offsetX - pet.width
  const maximumY = workArea.y + workArea.height - pet.offsetY - pet.height
  const horizontal = reflectAxis(x, velocityX, minimumX, maximumX)
  const vertical = reflectAxis(y, velocityY, minimumY, maximumY)
  x = horizontal.position
  y = vertical.position
  velocityX = horizontal.velocity
  velocityY = vertical.velocity

  const stopped = Math.hypot(velocityX, velocityY) < STOP_SPEED
  return {
    x,
    y,
    velocityX: stopped ? 0 : velocityX,
    velocityY: stopped ? 0 : velocityY,
    stopped,
  }
}
