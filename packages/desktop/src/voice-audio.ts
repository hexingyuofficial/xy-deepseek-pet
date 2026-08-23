export const VOICE_SAMPLE_RATE = 16_000
export const MAX_VOICE_SECONDS = 60
export const MAX_VOICE_WAV_BYTES = VOICE_SAMPLE_RATE * 2 * MAX_VOICE_SECONDS + 44
export const VOICE_CUE_FILES = {
  start: 'recording-start.wav',
  stop: 'recording-stop.wav',
} as const

export interface VoiceLevelSummary {
  durationSeconds: number
  peakDb: number
  rmsDb: number
  activeFrameRatio: number
  longestActiveSeconds: number
}

function decibels(amplitude: number): number {
  return amplitude > 0 ? 20 * Math.log10(amplitude) : Number.NEGATIVE_INFINITY
}

export function analyzePcm16Wav(bytes: Uint8Array): VoiceLevelSummary | undefined {
  if (bytes.byteLength < 46) return undefined
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const ascii = (offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length))
  if (ascii(0, 4) !== 'RIFF' || ascii(8, 4) !== 'WAVE' || view.getUint16(20, true) !== 1 || view.getUint16(34, true) !== 16) return undefined
  const channels = view.getUint16(22, true)
  const sampleRate = view.getUint32(24, true)
  const dataBytes = Math.min(view.getUint32(40, true), bytes.byteLength - 44)
  if (channels < 1 || sampleRate < 1 || dataBytes < 2) return undefined
  const sampleCount = Math.floor(dataBytes / 2)
  let peak = 0
  let squareSum = 0
  for (let index = 0; index < sampleCount; index += 1) {
    const amplitude = Math.abs(view.getInt16(44 + index * 2, true) / 0x8000)
    peak = Math.max(peak, amplitude)
    squareSum += amplitude * amplitude
  }
  const samplesPerFrame = Math.max(1, Math.round(sampleRate * channels * 0.02))
  const activeThreshold = 10 ** (-40 / 20)
  let activeFrames = 0
  let consecutiveActiveFrames = 0
  let longestActiveFrames = 0
  const frameCount = Math.ceil(sampleCount / samplesPerFrame)
  for (let frameStart = 0; frameStart < sampleCount; frameStart += samplesPerFrame) {
    const frameEnd = Math.min(sampleCount, frameStart + samplesPerFrame)
    let frameSquareSum = 0
    for (let index = frameStart; index < frameEnd; index += 1) {
      const amplitude = view.getInt16(44 + index * 2, true) / 0x8000
      frameSquareSum += amplitude * amplitude
    }
    const frameRms = Math.sqrt(frameSquareSum / Math.max(1, frameEnd - frameStart))
    if (frameRms >= activeThreshold) {
      activeFrames += 1
      consecutiveActiveFrames += 1
      longestActiveFrames = Math.max(longestActiveFrames, consecutiveActiveFrames)
    } else {
      consecutiveActiveFrames = 0
    }
  }
  return {
    durationSeconds: sampleCount / channels / sampleRate,
    peakDb: decibels(peak),
    rmsDb: decibels(Math.sqrt(squareSum / sampleCount)),
    activeFrameRatio: frameCount > 0 ? activeFrames / frameCount : 0,
    longestActiveSeconds: longestActiveFrames * 0.02,
  }
}

export function downmixAudio(channels: readonly Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array()
  if (channels.length === 1) return channels[0]!.slice()
  const length = Math.min(...channels.map((channel) => channel.length))
  const mixed = new Float32Array(length)
  for (const channel of channels) {
    for (let index = 0; index < length; index += 1) mixed[index] = mixed[index]! + channel[index]! / channels.length
  }
  return mixed
}

export function resampleAudio(input: Float32Array, sourceRate: number, targetRate = VOICE_SAMPLE_RATE): Float32Array {
  if (!Number.isFinite(sourceRate) || sourceRate <= 0 || !Number.isFinite(targetRate) || targetRate <= 0) {
    throw new Error('Audio sample rates must be positive.')
  }
  if (input.length === 0 || sourceRate === targetRate) return input.slice()
  const outputLength = Math.max(1, Math.round(input.length * targetRate / sourceRate))
  const output = new Float32Array(outputLength)
  const ratio = sourceRate / targetRate
  for (let index = 0; index < outputLength; index += 1) {
    const position = index * ratio
    const left = Math.min(input.length - 1, Math.floor(position))
    const right = Math.min(input.length - 1, left + 1)
    const fraction = position - left
    output[index] = input[left]! * (1 - fraction) + input[right]! * fraction
  }
  return output
}

export function normalizeVoiceAudio(input: Float32Array, targetPeak = 0.7, maximumGainDb = 30): Float32Array {
  if (input.length === 0) return input.slice()
  let peak = 0
  for (const sample of input) peak = Math.max(peak, Math.abs(sample))
  // Do not turn an effectively silent microphone into loud room noise.
  if (peak < 0.001 || peak >= targetPeak) return input.slice()
  const maximumGain = 10 ** (maximumGainDb / 20)
  const gain = Math.min(maximumGain, targetPeak / peak)
  return Float32Array.from(input, (sample) => Math.max(-1, Math.min(1, sample * gain)))
}

export function encodePcmWav(samples: Float32Array, sampleRate = VOICE_SAMPLE_RATE): ArrayBuffer {
  if (!Number.isInteger(sampleRate) || sampleRate <= 0) throw new Error('Audio sample rate must be a positive integer.')
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
  }
  writeAscii(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeAscii(8, 'WAVE')
  writeAscii(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]!))
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }
  return buffer
}

export async function mediaBlobToVoiceWav(blob: Blob): Promise<ArrayBuffer> {
  const context = new AudioContext()
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer())
    const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index))
    return encodePcmWav(normalizeVoiceAudio(resampleAudio(downmixAudio(channels), decoded.sampleRate)))
  } finally {
    await context.close()
  }
}
