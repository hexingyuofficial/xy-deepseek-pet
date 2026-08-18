export interface ImageDimensions {
  width: number
  height: number
}

function uint24le(bytes: Uint8Array, offset: number): number {
  return bytes[offset]! | (bytes[offset + 1]! << 8) | (bytes[offset + 2]! << 16)
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length))
}

export function webpDimensions(bytes: Uint8Array): ImageDimensions | undefined {
  if (bytes.byteLength < 30 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return undefined

  const chunk = ascii(bytes, 12, 4)
  if (chunk === 'VP8X') {
    return { width: uint24le(bytes, 24) + 1, height: uint24le(bytes, 27) + 1 }
  }

  if (chunk === 'VP8L') {
    if (bytes.byteLength < 25 || bytes[20] !== 0x2f) return undefined
    return {
      width: 1 + bytes[21]! + ((bytes[22]! & 0x3f) << 8),
      height: 1 + (bytes[22]! >> 6) + (bytes[23]! << 2) + ((bytes[24]! & 0x0f) << 10),
    }
  }

  if (chunk === 'VP8 ') {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return undefined
    return {
      width: (bytes[26]! | (bytes[27]! << 8)) & 0x3fff,
      height: (bytes[28]! | (bytes[29]! << 8)) & 0x3fff,
    }
  }

  return undefined
}
