export interface ShortcutKeyInput {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
}

export function shortcutFromKey(input: ShortcutKeyInput): string | undefined {
  if (!/^[a-z0-9]$/i.test(input.key)) return undefined
  const modifiers = [
    ...(input.metaKey || input.ctrlKey ? ['CommandOrControl'] : []),
    ...(input.altKey ? ['Alt'] : []),
    ...(input.shiftKey ? ['Shift'] : []),
  ]
  if (modifiers.length === 0) return undefined
  return [...modifiers, input.key.toUpperCase()].join('+')
}
