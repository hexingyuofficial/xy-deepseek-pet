#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

let electron
try {
  const module = await import('electron')
  electron = module.default
  if (typeof electron !== 'string' || !electron) throw new Error('Electron did not provide an executable path')
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error)
  console.error([
    'Could not start XY DeepSeek Pet because the Electron runtime is unavailable.',
    'Reinstall xy-deepseek-pet with package install scripts enabled.',
    'If pnpm blocked Electron\'s install script, allow it with `pnpm approve-builds`, then reinstall the plugin.',
    `Details: ${detail}`,
  ].join('\n'))
  process.exit(1)
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const child = spawn(electron, [resolve(packageRoot, 'dist/main.js'), ...process.argv.slice(2)], {
  stdio: 'inherit',
  windowsHide: false,
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.once('error', (error) => {
  console.error(`Could not start XY DeepSeek Pet: ${error.message}`)
  process.exitCode = 1
})
child.once('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exitCode = code ?? 1
})
