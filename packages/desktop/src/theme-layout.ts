export interface ThemeCanvasSize {
  width: number
  height: number
}

export interface ThemeDisplayBox {
  width: number
  height: number
  clearance: number
}

const MAX_DISPLAY_WIDTH = 228
const MAX_DISPLAY_HEIGHT = 198
const FLOATING_UI_GAP = 8

export function themeDisplayBox(canvas: ThemeCanvasSize): ThemeDisplayBox {
  const width = Math.max(1, canvas.width)
  const height = Math.max(1, canvas.height)
  const fit = Math.min(MAX_DISPLAY_WIDTH / width, MAX_DISPLAY_HEIGHT / height)
  const displayWidth = width * fit
  const displayHeight = height * fit
  return {
    width: displayWidth,
    height: displayHeight,
    clearance: displayHeight + FLOATING_UI_GAP,
  }
}
