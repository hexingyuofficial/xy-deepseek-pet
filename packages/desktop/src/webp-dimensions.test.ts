import { describe, expect, it } from 'vitest'
import { webpDimensions } from './webp-dimensions.js'

function container(chunk: string, payload: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.max(30, 20 + payload.length))
  bytes.set(Buffer.from('RIFF'), 0)
  bytes.set(Buffer.from('WEBP'), 8)
  bytes.set(Buffer.from(chunk), 12)
  bytes.set(payload, 20)
  return bytes
}

describe('webpDimensions', () => {
  it('reads the lossless header used by Petdex atlases', () => {
    const bytes = container('VP8L', [0x2f, 0xff, 0xc5, 0x3b, 0x12])
    expect(webpDimensions(bytes)).toEqual({ width: 1536, height: 2288 })
  })

  it('reads extended and lossy WebP dimensions', () => {
    const extended = container('VP8X', new Array(10).fill(0))
    extended.set([0xff, 0x05, 0x00, 0xef, 0x08, 0x00], 24)
    expect(webpDimensions(extended)).toEqual({ width: 1536, height: 2288 })

    const lossy = container('VP8 ', [0, 0, 0, 0x9d, 0x01, 0x2a, 0x00, 0x06, 0xf0, 0x08])
    expect(webpDimensions(lossy)).toEqual({ width: 1536, height: 2288 })
  })

  it('rejects unsupported or malformed data', () => {
    expect(webpDimensions(new Uint8Array(30))).toBeUndefined()
    expect(webpDimensions(container('VP8L', [0, 0, 0, 0, 0]))).toBeUndefined()
  })
})
