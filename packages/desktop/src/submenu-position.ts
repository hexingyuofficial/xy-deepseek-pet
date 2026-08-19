export interface SubmenuRect {
  left: number
  top: number
  right: number
  bottom: number
}

export interface SubmenuSize {
  width: number
  height: number
}

export interface SubmenuPosition {
  left: number
  top: number
  side: 'left' | 'right'
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (minimum > maximum) return minimum
  return Math.min(maximum, Math.max(minimum, value))
}

export function resolveSubmenuPosition(
  trigger: SubmenuRect,
  menu: SubmenuSize,
  viewport: SubmenuSize,
  gap = 6,
  inset = 8,
): SubmenuPosition {
  const right = trigger.right + gap
  const opensRight = right + menu.width <= viewport.width - inset
  return {
    left: opensRight ? right : Math.max(inset, trigger.left - gap - menu.width),
    top: clamp(trigger.top, inset, viewport.height - inset - menu.height),
    side: opensRight ? 'right' : 'left',
  }
}
