import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { strToU8, zipSync } from 'fflate'
import { ThemeManager } from './theme.js'

const PETDEX_WEBP = Buffer.from(
  'UklGRrQAAABXRUJQVlA4TKgAAAAv/8U7EgcQEREQkCT93x8Y0f+M//znP//5z3/+85///Oc///nPf/7zn//85z//+c9//vOf//znP//5z3/+85///Oc///nPf/7zn//85z//+c9//vOf//znP//5z3/+85///Oc///nPf/7zn//85z//+c9//vOf//znP//5z3/+85///Oc///nPf/7zn//85z//+c9//vOf//znP//5z3/+85///Of/aQA=',
  'base64',
)

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function manager(): Promise<{ manager: ThemeManager; root: string }> {
  const root = await mkdtemp(join(tmpdir(), 'xy-pet-theme-test-'))
  roots.push(root)
  const manager = new ThemeManager({ userData: root, repositoryRoot: resolve(import.meta.dirname, '../../..') })
  await manager.initialize()
  return { manager, root }
}

async function archive(root: string, entries: Record<string, Uint8Array>): Promise<string> {
  const path = join(root, 'theme.zip')
  await writeFile(path, zipSync(entries))
  return path
}

describe('ThemeManager imports', () => {
  it('maps a Petdex v2 atlas into offset sheet animations', async () => {
    const fixture = await manager()
    const path = await archive(fixture.root, {
      'pet.json': strToU8(JSON.stringify({ id: 'boba', displayName: 'Boba', spriteVersionNumber: 2 })),
      'spritesheet.webp': PETDEX_WEBP,
    })

    const loaded = await fixture.manager.importPath(path)
    expect(loaded.manifest.id).toBe('petdex-boba')
    expect(loaded.manifest.animations.idle).toMatchObject({ kind: 'sheet', frameOffset: 0 })
    expect(loaded.manifest.animations.thinking).toMatchObject({ kind: 'sheet', frameOffset: 56 })
    expect(loaded.manifest.animations.complete).toMatchObject({ kind: 'sheet', frameOffset: 64 })
  })

  it('defaults legacy Petdex metadata without spriteVersionNumber to v1', async () => {
    const fixture = await manager()
    const v1Sheet = Buffer.from(PETDEX_WEBP)
    v1Sheet[23] = 0xd3
    v1Sheet[24] = (v1Sheet[24]! & 0xf0) | 0x01
    const path = await archive(fixture.root, {
      'pet.json': strToU8(JSON.stringify({ id: 'legacy', displayName: 'Legacy pet' })),
      'spritesheet.webp': v1Sheet,
    })

    const loaded = await fixture.manager.importPath(path)
    expect(loaded.manifest.id).toBe('petdex-legacy')
    expect(loaded.manifest.animations.idle).toMatchObject({ kind: 'sheet', frameOffset: 0 })
  })

  it('still rejects an explicitly unsupported Petdex sprite version', async () => {
    const fixture = await manager()
    const path = await archive(fixture.root, {
      'pet.json': strToU8(JSON.stringify({ id: 'future', displayName: 'Future pet', spriteVersionNumber: 3 })),
      'spritesheet.webp': PETDEX_WEBP,
    })

    await expect(fixture.manager.importPath(path)).rejects.toThrow('Unsupported Petdex metadata')
  })

  it('rejects traversal and executable archive entries', async () => {
    const fixture = await manager()
    const metadata = strToU8(JSON.stringify({ id: 'safe', displayName: 'Safe', spriteVersionNumber: 2 }))
    await expect(fixture.manager.importPath(await archive(fixture.root, {
      '../escape.png': new Uint8Array([1]),
      'pet.json': metadata,
      'spritesheet.webp': PETDEX_WEBP,
    }))).rejects.toThrow(/Unsafe theme path|escapes extraction root/)

    await expect(fixture.manager.importPath(await archive(fixture.root, {
      'pet.json': metadata,
      'spritesheet.webp': PETDEX_WEBP,
      'run.js': strToU8('alert(1)'),
    }))).rejects.toThrow('Unsupported archive entry')
  })

  it('rejects invalid Petdex image data', async () => {
    const fixture = await manager()
    const path = await archive(fixture.root, {
      'pet.json': strToU8(JSON.stringify({ id: 'broken', displayName: 'Broken', spriteVersionNumber: 2 })),
      'spritesheet.webp': new Uint8Array(64),
    })
    await expect(fixture.manager.importPath(path)).rejects.toThrow('not a supported WebP image')
  })
})
