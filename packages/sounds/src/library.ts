import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { parseFile } from 'music-metadata'

export const MAX_SOUND_BYTES = 10 * 1024 * 1024
export const MAX_SOUND_SECONDS = 10
const FORMATS = new Set(['.wav', '.mp3', '.ogg'])

export interface ManagedSound {
  id: string
  displayName: string
  extension: '.wav' | '.mp3' | '.ogg'
  path: string
  bytes: number
  durationSeconds: number
  importedAt: string
}

interface LibraryIndex { sounds: ManagedSound[] }

function isInside(root: string, candidate: string): boolean {
  const rootPath = resolve(root)
  const candidatePath = resolve(candidate)
  const relativePath = relative(rootPath, candidatePath)
  return relativePath === '' || (!isAbsolute(relativePath) && relativePath !== '..' && !relativePath.startsWith(`..${sep}`))
}

function safeDisplayName(value: string): string {
  const cleaned = value.normalize('NFC').replace(/[\p{Cc}\p{Cf}\\/]+/gu, '').trim()
  return [...cleaned].slice(0, 80).join('') || 'Imported sound'
}

function hasSignature(buffer: Buffer, extension: string): boolean {
  if (extension === '.wav') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WAVE'
  if (extension === '.ogg') return buffer.subarray(0, 4).toString('ascii') === 'OggS'
  return extension === '.mp3' && (buffer.subarray(0, 3).toString('ascii') === 'ID3' || (buffer.length >= 2 && buffer[0] === 0xff && (buffer[1]! & 0xe0) === 0xe0))
}

export class SoundLibrary {
  readonly root: string
  private readonly indexPath: string
  private index: LibraryIndex = { sounds: [] }

  constructor(userData: string) {
    this.root = join(userData, 'sounds')
    this.indexPath = join(this.root, 'library.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.root, { recursive: true, mode: 0o700 })
    try {
      const parsed = JSON.parse(await readFile(this.indexPath, 'utf8')) as LibraryIndex
      this.index = { sounds: Array.isArray(parsed.sounds) ? parsed.sounds.filter((sound) => this.validRecord(sound)) : [] }
    } catch { this.index = { sounds: [] } }
    await this.persist()
  }

  list(): readonly ManagedSound[] { return this.index.sounds.map((sound) => ({ ...sound })) }

  async importBuffer(bytes: Buffer, fileName: string, displayName = basename(fileName, extname(fileName))): Promise<ManagedSound> {
    if (bytes.byteLength > MAX_SOUND_BYTES) throw new Error('Sound must be no larger than 10 MiB')
    const extension = extname(basename(fileName)).toLowerCase()
    if (!FORMATS.has(extension)) throw new Error('Only WAV, MP3, and OGG sounds are supported')
    if (!hasSignature(bytes, extension)) throw new Error('Sound signature does not match its extension')
    const temporary = join(this.root, `.import-${process.pid}-${Date.now()}${extension}`)
    if (!isInside(this.root, temporary)) throw new Error('Sound import escapes managed directory')
    await writeFile(temporary, bytes, { mode: 0o600 })
    try {
      return await this.importFile(temporary, displayName)
    } finally {
      await rm(temporary, { force: true })
    }
  }

  async importFile(sourcePath: string, displayName = basename(sourcePath, extname(sourcePath))): Promise<ManagedSound> {
    const source = resolve(sourcePath)
    const extension = extname(source).toLowerCase()
    if (!FORMATS.has(extension)) throw new Error('Only WAV, MP3, and OGG sounds are supported')
    const info = await stat(source)
    if (!info.isFile() || info.size > MAX_SOUND_BYTES) throw new Error('Sound must be a regular file no larger than 10 MiB')
    const bytes = await readFile(source)
    if (!hasSignature(bytes, extension)) throw new Error('Sound signature does not match its extension')
    const metadata = await parseFile(source, { duration: true })
    const durationSeconds = metadata.format.duration ?? 0
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_SOUND_SECONDS) throw new Error('Sound must decode to no more than 10 seconds')
    const digest = createHash('sha256').update(bytes).digest('hex')
    const id = `xy-custom-${digest.slice(0, 24)}`
    const target = join(this.root, `${id}${extension}`)
    if (!isInside(this.root, target)) throw new Error('Sound target escapes managed directory')
    const staging = `${target}.partial-${process.pid}-${Date.now()}`
    await copyFile(source, staging)
    await rename(staging, target)
    const record: ManagedSound = { id, displayName: safeDisplayName(displayName), extension: extension as ManagedSound['extension'], path: target, bytes: info.size, durationSeconds, importedAt: new Date().toISOString() }
    this.index.sounds = [...this.index.sounds.filter((sound) => sound.id !== id), record]
    await this.persist()
    return { ...record }
  }

  async remove(id: string): Promise<void> {
    const record = this.index.sounds.find((sound) => sound.id === id)
    if (!record) return
    if (!isInside(this.root, record.path)) throw new Error('Sound record escapes managed directory')
    await rm(record.path, { force: true })
    this.index.sounds = this.index.sounds.filter((sound) => sound.id !== id)
    await this.persist()
  }

  async restoreBuiltIn(id: string): Promise<void> { await this.remove(id) }

  private validRecord(value: unknown): value is ManagedSound {
    if (!value || typeof value !== 'object') return false
    const record = value as Partial<ManagedSound>
    return typeof record.id === 'string' && record.id.startsWith('xy-custom-') && typeof record.path === 'string' && isInside(this.root, record.path) && typeof record.displayName === 'string' && typeof record.bytes === 'number' && typeof record.durationSeconds === 'number' && FORMATS.has(record.extension ?? '')
  }

  private async persist(): Promise<void> {
    const staging = `${this.indexPath}.partial-${process.pid}`
    await writeFile(staging, `${JSON.stringify(this.index, null, 2)}\n`, { mode: 0o600 })
    await rename(staging, this.indexPath)
  }
}
