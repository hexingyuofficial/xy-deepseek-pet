import { renameSync, rmSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const [input, frameCountText, columnsText, mode = 'uniform', targetCountText = '61'] = process.argv.slice(2)

if (!input || !frameCountText || !columnsText) {
  throw new Error('Usage: node scripts/resample-sprite-sheet.mjs <sheet> <frame-count> <columns> [uniform|showcase|failure] [target-count]')
}

const frameCount = Number(frameCountText)
const columns = Number(columnsText)
const targetCount = Number(targetCountText)
if (![frameCount, columns, targetCount].every(Number.isInteger) || frameCount < 1 || columns < 1 || targetCount < 1 || targetCount > frameCount) {
  throw new Error('Frame count, columns, and target count must be valid positive integers')
}
if (!['uniform', 'showcase', 'failure'].includes(mode)) throw new Error(`Unknown resampling mode: ${mode}`)

function evenlySpaced(start, end, count) {
  if (count === 1) return [start]
  return Array.from({ length: count }, (_, index) => Math.round(start + ((end - start) * index) / (count - 1)))
}

function selectedFrames() {
  if (targetCount === frameCount) return evenlySpaced(0, frameCount - 1, targetCount)
  if (mode === 'uniform') return evenlySpaced(0, frameCount - 1, targetCount)

  if (mode === 'showcase') {
    const finalStart = Math.floor(frameCount * 0.8)
    const final = evenlySpaced(finalStart, frameCount - 1, frameCount - finalStart)
    const lead = evenlySpaced(0, finalStart - 1, targetCount - final.length)
    return [...lead, ...final]
  }

  const fastOutput = Math.max(2, Math.round(targetCount * 0.125))
  const mediumOutput = Math.max(2, Math.round(targetCount * 0.4))
  const finalOutput = targetCount - fastOutput - mediumOutput
  const fastSourceEnd = Math.floor(frameCount * 0.25) - 1
  const mediumSourceEnd = frameCount - finalOutput - 1
  return [
    ...evenlySpaced(0, fastSourceEnd, fastOutput),
    ...evenlySpaced(fastSourceEnd + 1, mediumSourceEnd, mediumOutput),
    ...evenlySpaced(mediumSourceEnd + 1, frameCount - 1, finalOutput),
  ]
}

const frames = selectedFrames()
if (new Set(frames).size !== frames.length || frames[0] !== 0 || frames.at(-1) !== frameCount - 1) {
  throw new Error(`Invalid ${mode} frame selection: ${frames.join(',')}`)
}

const rows = Math.ceil(frameCount / columns)
const outputColumns = Math.min(60, targetCount)
const outputRows = Math.ceil(targetCount / outputColumns)
const extension = extname(input)
const temporary = join(dirname(input), `.${basename(input, extension)}.resampled${extension}`)
const select = frames.map((frame) => `eq(n\\,${frame})`).join('+')
const filter = `untile=${columns}x${rows},trim=end_frame=${frameCount},select='${select}',tile=${outputColumns}x${outputRows}`
const result = spawnSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error', '-i', input,
  '-vf', filter, '-vsync', '0', '-frames:v', '1',
  '-c:v', 'libwebp', '-lossless', '1', '-compression_level', '6', temporary,
], { encoding: 'utf8' })

if (result.status !== 0) {
  rmSync(temporary, { force: true })
  throw new Error(result.stderr || `ffmpeg exited with status ${result.status}`)
}

renameSync(temporary, input)
console.log(`${input}: ${frameCount} -> ${targetCount} frames (${mode}); selected ${frames.join(',')}`)
