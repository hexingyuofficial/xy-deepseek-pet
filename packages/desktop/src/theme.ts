import { Ajv2020 } from 'ajv/dist/2020.js'
import { unzipSync } from 'fflate'
import { copyFile, cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { AnimationPacing } from './animation-timing.js'
import { webpDimensions } from './webp-dimensions.js'

export type ThemeAnimation =
  | {
      kind: 'frames'
      files: string[]
      fps?: number
      frameDurationsMs?: number[]
      pacing?: AnimationPacing
      loop: boolean
    }
  | {
      kind: 'sheet'
      file: string
      frameWidth: number
      frameHeight: number
      frameCount: number
      columns: number
      frameOffset?: number
      fps?: number
      frameDurationsMs?: number[]
      pacing?: AnimationPacing
      loop: boolean
    }

export interface ThemeManifest {
  schemaVersion: 1 | 2
  id: string
  name: string
  version: string
  license: string
  author?: string
  walkBaseFacing?: 'left' | 'right'
  canvas: { width: number; height: number }
  animations: Record<string, ThemeAnimation>
  completionVariants?: {
    regular: ThemeAnimation[]
    jackpot?: ThemeAnimation[]
  }
  errorSequences?: Array<{
    enter: ThemeAnimation
    loop: ThemeAnimation
    exit: ThemeAnimation
  }>
}

export interface LoadedTheme {
  manifest: ThemeManifest
  baseUrl: string
  directory: string
}

export interface ThemeSummary {
  id: string
  name: string
  license: string
  author?: string
  directory: string
}

const MAX_ARCHIVE_BYTES = 20 * 1024 * 1024
const MAX_UNCOMPRESSED_BYTES = 60 * 1024 * 1024
const MAX_FILES = 64
const ALLOWED_IMPORT_EXTENSIONS = new Set(['.json', '.png', '.webp', '.avif'])
const ALLOWED_IMPORT_METADATA = new Set(['README', 'README.md', 'LICENSE', 'LICENSE.md', 'provenance.json'])
const PETDEX_ROWS = {
  idle: 0,
  walk: 1,
  walkRight: 1,
  walkLeft: 2,
  error: 5,
  needsInput: 6,
  thinking: 7,
  working: 7,
  complete: 8,
  offline: 0,
} as const

function isInside(root: string, candidate: string): boolean {
  const rel = relative(root, candidate)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

function assertSafeRelativePath(path: string): void {
  if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').includes('..') || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
    throw new Error(`Unsafe theme path: ${path}`)
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

function sanitizeId(value: string): string {
  const id = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)
  return id || 'imported-pet'
}

function allAnimations(manifest: ThemeManifest): ThemeAnimation[] {
  return [
    ...Object.values(manifest.animations),
    ...(manifest.completionVariants?.regular ?? []),
    ...(manifest.completionVariants?.jackpot ?? []),
    ...(manifest.errorSequences?.flatMap((sequence) => [sequence.enter, sequence.loop, sequence.exit]) ?? []),
  ]
}

export class ThemeManager {
  readonly userThemeRoot: string
  readonly builtinThemeRoot: string
  private readonly schemaPath: string
  private validator: ((value: unknown) => boolean) | undefined
  private validationErrors: (() => unknown) | undefined

  constructor(options: { userData: string; repositoryRoot: string }) {
    this.userThemeRoot = join(options.userData, 'themes')
    this.builtinThemeRoot = join(options.repositoryRoot, 'themes')
    this.schemaPath = join(options.repositoryRoot, 'schemas', 'theme.schema.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.userThemeRoot, { recursive: true })
    const schema = JSON.parse(await readFile(this.schemaPath, 'utf8')) as object
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    const validate = ajv.compile(schema)
    this.validator = (value) => validate(value) as boolean
    this.validationErrors = () => validate.errors
  }

  async list(): Promise<ThemeSummary[]> {
    const summaries = new Map<string, ThemeSummary>()
    for (const root of [this.builtinThemeRoot, this.userThemeRoot]) {
      if (!(await pathExists(root))) continue
      for (const entry of await readdir(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        try {
          const loaded = await this.loadDirectory(join(root, entry.name))
          summaries.set(loaded.manifest.id, {
            id: loaded.manifest.id,
            name: loaded.manifest.name,
            license: loaded.manifest.license,
            ...(loaded.manifest.author ? { author: loaded.manifest.author } : {}),
            directory: loaded.directory,
          })
        } catch {
          // Invalid themes remain invisible until the user explicitly imports them.
        }
      }
    }
    return [...summaries.values()].sort((a, b) => a.name.localeCompare(b.name))
  }

  async load(id: string): Promise<LoadedTheme> {
    for (const root of [this.userThemeRoot, this.builtinThemeRoot]) {
      const candidate = join(root, id)
      if (await pathExists(candidate)) return this.loadDirectory(candidate)
    }
    const first = (await this.list())[0]
    if (!first) throw new Error('No valid themes are installed')
    return this.loadDirectory(first.directory)
  }

  async loadDirectory(directory: string): Promise<LoadedTheme> {
    const manifestPath = join(directory, 'theme.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as ThemeManifest
    if (!this.validator?.(manifest)) {
      throw new Error(`Invalid theme manifest: ${JSON.stringify(this.validationErrors?.())}`)
    }
    await this.verifyAssets(directory, manifest)
    return {
      manifest,
      baseUrl: `${pathToFileURL(directory).href}/`,
      directory,
    }
  }

  async importPath(sourcePath: string): Promise<LoadedTheme> {
    const source = await lstat(sourcePath)
    if (source.isSymbolicLink()) throw new Error('Symlink imports are not supported')

    let directory = sourcePath
    let cleanup: (() => Promise<void>) | undefined
    if (source.isFile()) {
      if (extname(sourcePath).toLowerCase() !== '.zip') throw new Error('Choose a theme directory or ZIP file')
      if (source.size > MAX_ARCHIVE_BYTES) throw new Error('Archive exceeds the 20 MB compressed limit')
      directory = await this.extractZip(sourcePath)
      cleanup = () => rm(directory, { recursive: true, force: true })
    }

    try {
      const packageRoot = await this.findPackageRoot(directory)
      if (await pathExists(join(packageRoot, 'theme.json'))) return await this.importNativeTheme(packageRoot)
      return await this.importPetdex(packageRoot)
    } finally {
      await cleanup?.()
    }
  }

  private async verifyAssets(directory: string, manifest: ThemeManifest): Promise<void> {
    for (const animation of allAnimations(manifest)) {
      const paths = animation.kind === 'frames' ? animation.files : [animation.file]
      const frameCount = animation.kind === 'frames' ? animation.files.length : animation.frameCount
      if (animation.frameDurationsMs && animation.frameDurationsMs.length !== frameCount) {
        throw new Error('frameDurationsMs must match frame count')
      }
      for (const path of paths) {
        assertSafeRelativePath(path)
        const candidate = resolve(directory, path)
        if (!isInside(directory, candidate)) throw new Error(`Theme asset escapes its directory: ${path}`)
        const info = await lstat(candidate)
        if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Theme asset is not a regular file: ${path}`)
      }
    }
  }

  private async importNativeTheme(source: string): Promise<LoadedTheme> {
    const loaded = await this.loadDirectory(source)
    const target = join(this.userThemeRoot, loaded.manifest.id)
    const staging = `${target}.staging-${Date.now()}`
    await rm(staging, { recursive: true, force: true })
    await mkdir(staging, { recursive: true })

    const declaredAssets = new Set(
      allAnimations(loaded.manifest).flatMap((animation) =>
        animation.kind === 'frames' ? animation.files : [animation.file],
      ),
    )
    for (const path of ['theme.json', ...declaredAssets]) {
      assertSafeRelativePath(path)
      const sourceFile = resolve(source, path)
      const sourceInfo = await lstat(sourceFile)
      if (!sourceInfo.isFile() || sourceInfo.isSymbolicLink()) throw new Error(`Theme file is not a regular file: ${path}`)
      const targetFile = resolve(staging, path)
      if (!isInside(staging, targetFile)) throw new Error(`Theme file escapes staging directory: ${path}`)
      await mkdir(dirname(targetFile), { recursive: true })
      await copyFile(sourceFile, targetFile)
    }

    for (const filename of ['README', 'README.md', 'LICENSE', 'LICENSE.md', 'provenance.json']) {
      const sourceFile = join(source, filename)
      if (!(await pathExists(sourceFile))) continue
      const sourceInfo = await lstat(sourceFile)
      if (!sourceInfo.isFile() || sourceInfo.isSymbolicLink()) throw new Error(`Theme metadata is not a regular file: ${filename}`)
      await copyFile(sourceFile, join(staging, filename))
    }
    await this.loadDirectory(staging)
    await rm(target, { recursive: true, force: true })
    await cp(staging, target, { recursive: true })
    await rm(staging, { recursive: true, force: true })
    return this.loadDirectory(target)
  }

  private async importPetdex(source: string): Promise<LoadedTheme> {
    const metadataPath = join(source, 'pet.json')
    if (!(await pathExists(metadataPath))) throw new Error('No theme.json or Petdex pet.json found')
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as Record<string, unknown>
    const sourceId = typeof metadata.id === 'string' ? metadata.id : typeof metadata.slug === 'string' ? metadata.slug : ''
    const displayName = typeof metadata.displayName === 'string' ? metadata.displayName : sourceId
    const version = metadata.spriteVersionNumber
    if (!sourceId || !displayName || (version !== 1 && version !== 2)) throw new Error('Unsupported Petdex metadata')
    const sheetName = typeof metadata.spritesheetPath === 'string' ? metadata.spritesheetPath : 'spritesheet.webp'
    assertSafeRelativePath(sheetName)
    const sheetPath = resolve(source, sheetName)
    if (!isInside(source, sheetPath)) throw new Error('Petdex spritesheet escapes its package')

    const sheetBytes = await readFile(sheetPath)
    const size = webpDimensions(sheetBytes)
    if (!size) throw new Error('Petdex spritesheet is not a supported WebP image')
    const expectedHeight = version === 1 ? 1872 : 2288
    if (size.width !== 1536 || size.height !== expectedHeight) {
      throw new Error(`Expected a 1536 x ${expectedHeight} Petdex atlas, got ${size.width} x ${size.height}`)
    }

    const id = `petdex-${sanitizeId(sourceId)}`
    const target = join(this.userThemeRoot, id)
    const staging = `${target}.staging-${Date.now()}`
    await rm(staging, { recursive: true, force: true })
    await mkdir(staging, { recursive: true })
    const importedSheet = `spritesheet${extname(sheetName).toLowerCase()}`
    await copyFile(sheetPath, join(staging, importedSheet))

    const animationFor = (state: keyof typeof PETDEX_ROWS, loop: boolean): ThemeAnimation => ({
      kind: 'sheet',
      file: importedSheet,
      frameWidth: 192,
      frameHeight: 208,
      frameCount: 8,
      columns: 8,
      frameOffset: PETDEX_ROWS[state] * 8,
      fps: 8,
      loop,
    })
    const author = typeof metadata.author === 'string' ? metadata.author : undefined
    const declaredLicense = typeof metadata.license === 'string' ? metadata.license : 'Unknown - local use only'
    const manifest: ThemeManifest = {
      schemaVersion: 1,
      id,
      name: `${displayName} (Petdex)`,
      version: '1.0.0',
      license: declaredLicense,
      ...(author ? { author } : {}),
      canvas: { width: 192, height: 208 },
      animations: {
        idle: animationFor('idle', true),
        walk: animationFor('walk', true),
        walkRight: animationFor('walkRight', true),
        walkLeft: animationFor('walkLeft', true),
        thinking: animationFor('thinking', true),
        working: animationFor('working', true),
        needsInput: animationFor('needsInput', true),
        complete: animationFor('complete', false),
        error: animationFor('error', false),
        offline: animationFor('offline', true),
      },
    }
    await writeFile(join(staging, 'theme.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    await writeFile(
      join(staging, 'provenance.json'),
      `${JSON.stringify(
        {
          sourceFormat: `Codex/Petdex v${version}`,
          sourceId,
          displayName,
          author: author ?? null,
          license: typeof metadata.license === 'string' ? metadata.license : null,
          importedAt: new Date().toISOString(),
          notice: 'Importer support does not grant redistribution rights.',
        },
        null,
        2,
      )}\n`,
    )
    await this.loadDirectory(staging)
    await rm(target, { recursive: true, force: true })
    await cp(staging, target, { recursive: true })
    await rm(staging, { recursive: true, force: true })
    return this.loadDirectory(target)
  }

  private async extractZip(zipPath: string): Promise<string> {
    const output = await mkdtemp(join(tmpdir(), 'harness-pet-import-'))
    const entries = unzipSync(new Uint8Array(await readFile(zipPath)))
    const names = Object.keys(entries)
    if (names.length > MAX_FILES) throw new Error(`Archive exceeds the ${MAX_FILES}-file limit`)
    let total = 0
    for (const [name, data] of Object.entries(entries)) {
      if (name.endsWith('/')) continue
      const normalized = name.replace(/\/$/, '')
      if (!normalized) continue
      assertSafeRelativePath(normalized)
      const extension = extname(normalized).toLowerCase()
      if (!ALLOWED_IMPORT_EXTENSIONS.has(extension) && !ALLOWED_IMPORT_METADATA.has(basename(normalized))) {
        throw new Error(`Unsupported archive entry: ${name}`)
      }
      total += data.byteLength
      if (total > MAX_UNCOMPRESSED_BYTES) throw new Error('Archive exceeds the 60 MB expanded limit')
      const destination = resolve(output, normalized)
      if (!isInside(output, destination)) throw new Error(`Archive entry escapes extraction root: ${name}`)
      await mkdir(dirname(destination), { recursive: true })
      await writeFile(destination, data)
    }
    return output
  }

  private async findPackageRoot(directory: string): Promise<string> {
    if ((await pathExists(join(directory, 'theme.json'))) || (await pathExists(join(directory, 'pet.json')))) return directory
    const children = await readdir(directory, { withFileTypes: true })
    const directories = children.filter((child) => child.isDirectory())
    if (directories.length === 1) {
      const nested = join(directory, directories[0]!.name)
      if ((await pathExists(join(nested, 'theme.json'))) || (await pathExists(join(nested, 'pet.json')))) return nested
    }
    throw new Error(`No supported pet package found in ${basename(directory)}`)
  }
}
