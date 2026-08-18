import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'esbuild'

const root = resolve(import.meta.dirname, '..')
const lib = resolve(root, 'lib')
await rm(lib, { recursive: true, force: true })
await mkdir(lib, { recursive: true })

await build({
  entryPoints: {
    index: resolve(root, 'src/index.ts'),
    typert: resolve(root, 'src/typert.ts'),
    remote: resolve(root, 'src/remote.ts'),
  },
  outdir: lib,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: [
    '@deepseek-ai/cordis',
    '@deepseek-ai/dsh-agent',
    '@deepseek-ai/dsh-session',
    '@deepseek-ai/dsh-typert-protocol',
    'music-metadata',
  ],
  sourcemap: true,
})

const clientBuild = await build({
  entryPoints: [resolve(root, 'src/client.ts')],
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2020',
  external: ['react', 'react/jsx-runtime'],
  write: false,
})
const body = clientBuild.outputFiles[0]?.text
if (!body) throw new Error('Client bundle was empty')
const indentedBody = body
  .split('\n')
  .map((line) => line.trimEnd())
  .map((line) => line ? `    ${line}` : '')
  .join('\n')
await writeFile(resolve(lib, 'client.js'), `window.__ModuleLoader__.load({\n  id: "xy-deepseek-sounds",\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;\n${indentedBody}\n    return module.exports;\n  }\n});\n`)
