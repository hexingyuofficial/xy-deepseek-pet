import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const sampleRate = 44_100
const outputDirectory = resolve(import.meta.dirname, '../assets')

const definitions = [
  {
    id: 'xy-placeholder-complete',
    displayName: 'Placeholder Complete',
    channels: ['turnComplete'],
    file: 'placeholder-complete.wav',
    notes: [523.25, 659.25, 783.99],
    noteMs: 105,
  },
  {
    id: 'xy-placeholder-tool-success',
    displayName: 'Placeholder Tool Success',
    channels: ['toolSuccess'],
    file: 'placeholder-tool-success.wav',
    notes: [659.25, 880],
    noteMs: 90,
  },
  {
    id: 'xy-placeholder-tool-failure',
    displayName: 'Placeholder Tool Failure',
    channels: ['toolFailure'],
    file: 'placeholder-tool-failure.wav',
    notes: [329.63, 220],
    noteMs: 145,
  },
]

function makeWave(notes, noteMs) {
  const samplesPerNote = Math.round((sampleRate * noteMs) / 1000)
  const sampleCount = samplesPerNote * notes.length
  const dataBytes = sampleCount * 2
  const buffer = Buffer.alloc(44 + dataBytes)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataBytes, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataBytes, 40)

  for (let index = 0; index < sampleCount; index += 1) {
    const noteIndex = Math.floor(index / samplesPerNote)
    const noteSample = index % samplesPerNote
    const phase = noteSample / sampleRate
    const edge = Math.min(noteSample / 220, (samplesPerNote - noteSample - 1) / 440, 1)
    const envelope = Math.max(0, edge)
    const value = Math.sin(2 * Math.PI * notes[noteIndex] * phase) * envelope * 0.22
    buffer.writeInt16LE(Math.round(value * 32_767), 44 + index * 2)
  }
  return buffer
}

await mkdir(outputDirectory, { recursive: true })
const assets = []
for (const definition of definitions) {
  const bytes = makeWave(definition.notes, definition.noteMs)
  await writeFile(resolve(outputDirectory, definition.file), bytes)
  assets.push({
    id: definition.id,
    displayName: definition.displayName,
    file: definition.file,
    channels: definition.channels,
    author: 'XY DeepSeek Pet contributors',
    source: 'original-project-asset',
    license: 'CC0-1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    edits: 'Deterministically generated mono 44.1 kHz PCM placeholder tone.',
    sha256: createHash('sha256').update(bytes).digest('hex'),
  })
}

await writeFile(
  resolve(outputDirectory, 'provenance.json'),
  `${JSON.stringify({ schemaVersion: 1, assets }, null, 2)}\n`,
)
