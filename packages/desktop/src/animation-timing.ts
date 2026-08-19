export interface AnimationDeadline {
  deadline: number
  delay: number
}

export type AnimationPacing = 'fast-start-showcase'

export function animationFrameIndices(frameCount: number, pacing?: AnimationPacing): number[] {
  if (pacing !== 'fast-start-showcase') return Array.from({ length: frameCount }, (_, index) => index)
  const fastEnd = Math.floor(frameCount * 0.55)
  const indices: number[] = []
  for (let index = 0; index < fastEnd; index += 2) indices.push(index)
  for (let index = fastEnd; index < frameCount; index += 1) indices.push(index)
  return indices
}

export function visibleAnimationFrameIndices(
  indices: readonly number[],
  visible: readonly number[],
): number[] {
  const visibleSet = new Set(visible)
  return indices.filter((index) => visibleSet.has(index))
}

export function pacedFrameDuration(
  authoredDurationMs: number,
  frameIndex: number,
  frameCount: number,
  pacing?: AnimationPacing,
): number {
  if (pacing !== 'fast-start-showcase' || frameIndex < Math.floor(frameCount * 0.8)) return authoredDurationMs
  return Math.max(authoredDurationMs, 1000 / 28)
}

export function nextAnimationDeadline(deadline: number, frameDurationMs: number, now: number): AnimationDeadline {
  const nextDeadline = deadline + frameDurationMs
  return {
    deadline: nextDeadline,
    delay: Math.max(0, nextDeadline - now),
  }
}
