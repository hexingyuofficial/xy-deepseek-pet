import { copyFile, cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'esbuild'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

await Promise.all([
  build({
    entryPoints: [resolve(root, 'src/main.ts')],
    outfile: resolve(dist, 'main.js'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    external: ['electron', 'ws'],
    sourcemap: true,
  }),
  build({
    entryPoints: [resolve(root, 'src/preload.ts')],
    outfile: resolve(dist, 'preload.cjs'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    external: ['electron'],
    sourcemap: true,
  }),
  build({
    entryPoints: [resolve(root, 'src/renderer.ts')],
    outfile: resolve(dist, 'renderer.js'),
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'chrome136',
    sourcemap: true,
  }),
  copyFile(resolve(root, 'src/index.html'), resolve(dist, 'index.html')),
  copyFile(resolve(root, 'src/styles.css'), resolve(dist, 'styles.css')),
  cp(resolve(root, '../../schemas'), resolve(dist, 'resources/schemas'), { recursive: true }),
  cp(resolve(root, '../../themes/whale-default'), resolve(dist, 'resources/themes/whale-default'), { recursive: true }),
])
