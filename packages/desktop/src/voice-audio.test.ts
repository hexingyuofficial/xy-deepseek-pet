import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { analyzePcm16Wav, downmixAudio, encodePcmWav, normalizeVoiceAudio, resampleAudio, VOICE_CUE_FILES, VOICE_SAMPLE_RATE } from './voice-audio.js'

describe('voice audio', () => {
  it('downmixes channels without clipping their average', () => {
    expect([...downmixAudio([new Float32Array([1, -1]), new Float32Array([-1, 1])])]).toEqual([0, 0])
  })

  it('resamples to the requested duration', () => {
    const source = Float32Array.from({ length: 48_000 }, (_, index) => index / 48_000)
    const result = resampleAudio(source, 48_000)
    expect(result).toHaveLength(VOICE_SAMPLE_RATE)
    expect(result[8_000]).toBeCloseTo(0.5, 3)
  })

  it('raises quiet speech with bounded gain and leaves near-silence alone', () => {
    expect([...normalizeVoiceAudio(new Float32Array([0.01, -0.01]))]).toEqual([
      expect.closeTo(0.3162, 3),
      expect.closeTo(-0.3162, 3),
    ])
    expect([...normalizeVoiceAudio(new Float32Array([0.0005, -0.0005]))]).toEqual([
      expect.closeTo(0.0005, 6),
      expect.closeTo(-0.0005, 6),
    ])
  })

  it('encodes mono 16-bit PCM WAV data', () => {
    const result = encodePcmWav(new Float32Array([-1, 0, 1]))
    const view = new DataView(result)
    expect(new TextDecoder().decode(result.slice(0, 4))).toBe('RIFF')
    expect(new TextDecoder().decode(result.slice(8, 12))).toBe('WAVE')
    expect(view.getUint16(20, true)).toBe(1)
    expect(view.getUint16(22, true)).toBe(1)
    expect(view.getUint32(24, true)).toBe(VOICE_SAMPLE_RATE)
    expect(view.getUint16(34, true)).toBe(16)
    expect(view.getInt16(44, true)).toBe(-0x8000)
    expect(view.getInt16(48, true)).toBe(0x7fff)
  })

  it('reports duration and signal level without retaining recorded audio', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 0])
    const summary = analyzePcm16Wav(new Uint8Array(encodePcmWav(samples, 4)))
    expect(summary?.durationSeconds).toBe(1)
    expect(summary?.peakDb).toBeCloseTo(-6.02, 1)
    expect(summary?.rmsDb).toBeCloseTo(-9.03, 1)
    expect(summary?.activeFrameRatio).toBe(0.5)
    expect(summary?.longestActiveSeconds).toBe(0.04)
    expect(analyzePcm16Wav(new Uint8Array([1, 2, 3]))).toBeUndefined()
  })

  it('reports sustained activity in 20ms frames', () => {
    const samples = new Float32Array(VOICE_SAMPLE_RATE)
    samples.fill(0.02, 3_840, 11_840)
    const summary = analyzePcm16Wav(new Uint8Array(encodePcmWav(samples)))
    expect(summary?.activeFrameRatio).toBeCloseTo(0.5, 2)
    expect(summary?.longestActiveSeconds).toBeCloseTo(0.5, 2)
  })

  it('ships valid start and stop recording cues', async () => {
    for (const file of Object.values(VOICE_CUE_FILES)) {
      const bytes = await readFile(new URL(`../assets/voice/${file}`, import.meta.url))
      expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF')
      expect(bytes.subarray(8, 12).toString('ascii')).toBe('WAVE')
    }
  })
})
