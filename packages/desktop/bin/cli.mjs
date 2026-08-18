#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'electron'

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
