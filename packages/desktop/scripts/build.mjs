import { execFile } from 'node:child_process'
import { copyFile, cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { build } from 'esbuild'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
const voiceResources = resolve(dist, 'resources/voice')
await mkdir(voiceResources, { recursive: true })

if (process.platform === 'darwin') {
  const helperContents = resolve(voiceResources, 'XY DeepSeek Pet Speech.app/Contents')
  const helperExecutable = resolve(helperContents, 'MacOS/xy-speech-macos')
  await mkdir(resolve(helperContents, 'MacOS'), { recursive: true })
  await promisify(execFile)('xcrun', [
    'clang', '-fobjc-arc', '-arch', 'arm64', '-arch', 'x86_64', '-mmacosx-version-min=12.0',
    resolve(root, 'native/macos/xy-speech.m'), '-framework', 'Foundation', '-framework', 'Speech',
    '-o', helperExecutable,
  ])
  await copyFile(resolve(root, 'native/macos/Info.plist'), resolve(helperContents, 'Info.plist'))
  await promisify(execFile)('codesign', ['--force', '--sign', '-', '--identifier', 'dev.xydeepseekpet.speech', resolve(voiceResources, 'XY DeepSeek Pet Speech.app')])
}
await copyFile(resolve(root, 'native/windows/xy-speech-windows.ps1'), resolve(voiceResources, 'xy-speech-windows.ps1'))
await Promise.all([
  copyFile(resolve(root, 'assets/voice/recording-start.wav'), resolve(voiceResources, 'recording-start.wav')),
  copyFile(resolve(root, 'assets/voice/recording-stop.wav'), resolve(voiceResources, 'recording-stop.wav')),
])

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
