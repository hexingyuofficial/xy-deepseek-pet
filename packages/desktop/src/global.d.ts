import type { HarnessPetRendererApi } from './preload.js'

declare global {
  interface Window {
    harnessPet: HarnessPetRendererApi
  }
}

export {}
