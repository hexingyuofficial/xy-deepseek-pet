import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'

const requiredFiles = [
  'LICENSE',
  'README.md',
  'README.en.md',
  'schemas/theme.schema.json',
  'examples/minimal-theme/theme.json',
  'examples/minimal-theme/sprites/whale.webp',
  'themes/whale-default/theme.json',
  'packages/harness-plugin/cordis.patch.yml',
  'packages/harness-plugin/runtime/launch.mjs',
  'packages/harness-plugin/runtime/launcher-utils.mjs',
  'packages/harness-plugin/assets/whale-calm.png',
  'packages/sounds/cordis.patch.yml',
  'packages/sounds/assets/provenance.json',
]

for (const file of requiredFiles) {
  await stat(new URL(`../${file}`, import.meta.url))
}

for (const file of ['packages/harness-plugin/assets/whale-calm.png']) {
  const bytes = await readFile(new URL(`../${file}`, import.meta.url))
  if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${file} is not a valid PNG`)
}

const schema = JSON.parse(await readFile(new URL('../schemas/theme.schema.json', import.meta.url), 'utf8'))
const theme = JSON.parse(await readFile(new URL('../examples/minimal-theme/theme.json', import.meta.url), 'utf8'))
const states = ['idle', 'walk', 'thinking', 'working', 'complete', 'error', 'offline']

if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
  throw new Error('Theme schema must declare JSON Schema draft 2020-12')
}
if (theme.schemaVersion !== 1) throw new Error('Example theme schemaVersion must be 1')

for (const state of states) {
  const animation = theme.animations[state]
  if (!animation) throw new Error(`Example theme is missing ${state}`)

  const hasFps = animation.fps !== undefined
  const hasDurations = animation.frameDurationsMs !== undefined
  if (hasFps === hasDurations) throw new Error(`${state} must declare exactly one timing mode`)
  if (hasFps && !(animation.fps > 0 && animation.fps <= 60)) throw new Error(`${state} has invalid fps`)

  if (hasDurations) {
    const expectedFrames = animation.kind === 'frames' ? animation.files.length : animation.frameCount
    if (animation.frameDurationsMs.length !== expectedFrames) {
      throw new Error(`${state} frameDurationsMs length must match its frame count`)
    }
  }

  const paths = animation.kind === 'frames' ? animation.files : [animation.file]
  for (const path of paths) {
    if (path.startsWith('/') || path.includes('..') || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
      throw new Error(`${state} contains an unsafe asset path`)
    }
    await stat(new URL(`../examples/minimal-theme/${path}`, import.meta.url))
  }
}

if (theme.animations.complete.loop || theme.animations.error.loop) {
  throw new Error('Complete and error example animations must be one-shot')
}

if (!schema.properties.animations.properties.walkLeft || !schema.properties.animations.properties.walkRight) {
  throw new Error('Theme schema must expose optional directional walk animations')
}

const soundProvenance = JSON.parse(await readFile(new URL('../packages/sounds/assets/provenance.json', import.meta.url), 'utf8'))
if (soundProvenance.schemaVersion !== 1 || !Array.isArray(soundProvenance.assets) || soundProvenance.assets.length < 3) {
  throw new Error('Sound provenance must contain the three placeholder assets')
}
for (const asset of soundProvenance.assets) {
  if (asset.license !== 'CC0-1.0' || !Array.isArray(asset.channels) || asset.channels.length === 0) {
    throw new Error(`${asset.id ?? 'unknown sound'} is missing CC0 provenance or channel compatibility`)
  }
  const bytes = await readFile(new URL(`../packages/sounds/assets/${asset.file}`, import.meta.url))
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== asset.sha256) throw new Error(`${asset.id} has a stale SHA-256 digest`)
}

const publicPackages = [
  ['packages/harness-plugin/package.json', 'xy-deepseek-pet'],
  ['packages/desktop/package.json', '@xy-deepseek-pet/desktop'],
  ['packages/sounds/package.json', 'xy-deepseek-sounds'],
]
for (const [file, expectedName] of publicPackages) {
  const manifest = JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'))
  if (manifest.name !== expectedName || manifest.version !== '0.1.0' || manifest.private === true) {
    throw new Error(`${file} must describe the public ${expectedName}@0.1.0 package`)
  }
  if (manifest.publishConfig?.access !== 'public' || manifest.license !== 'MIT') {
    throw new Error(`${file} is missing public publish metadata`)
  }
}

const petPackage = JSON.parse(await readFile(new URL('../packages/harness-plugin/package.json', import.meta.url), 'utf8'))
if (petPackage.dependencies?.['@xy-deepseek-pet/desktop'] !== 'workspace:0.1.0') {
  throw new Error('xy-deepseek-pet must publish an exact 0.1.0 desktop runtime dependency')
}
for (const entry of ['assets', 'lib', 'runtime/launch.mjs', 'runtime/launcher-utils.mjs']) {
  if (!petPackage.files?.includes(entry)) throw new Error(`xy-deepseek-pet package is missing ${entry}`)
}
if (!petPackage.dsh?.bundle?.patch || !petPackage.dsh?.client) throw new Error('xy-deepseek-pet is missing dsh bundle/client metadata')

const soundsPackage = JSON.parse(await readFile(new URL('../packages/sounds/package.json', import.meta.url), 'utf8'))
if (!soundsPackage.dsh?.bundle?.patch || !soundsPackage.dsh?.client) throw new Error('xy-deepseek-sounds is missing dsh bundle/client metadata')

const forbiddenPublicPaths = ['.product-spec.md', 'AGENTS.md', 'specs', 'skills', 'themes/fox-test', 'examples/import-test-theme']
for (const file of forbiddenPublicPaths) {
  try {
    await stat(new URL(`../${file}`, import.meta.url))
    throw new Error(`Internal or temporary path must not be published: ${file}`)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue
    throw error
  }
}

console.log('Public repository, installable example theme, package metadata, and sound provenance checks passed.')
