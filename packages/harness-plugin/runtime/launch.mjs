import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, chmodSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import http from 'node:http'
import net from 'node:net'
import { isHarnessHtml, parseBridgeDescriptor, parseLauncherLock } from './launcher-utils.mjs'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const runtimeRoot = join(homedir(), '.xy-deepseek-pet')
const bridgePath = join(runtimeRoot, 'bridge.json')
const lockPath = join(runtimeRoot, 'launcher.lock')
const clientOpenPath = join(runtimeRoot, 'client-opened-at')
const serviceLogPath = join(runtimeRoot, 'dsh.log')
const launcherLogPath = join(runtimeRoot, 'launcher.log')
const desktopPackageRoot = dirname(require.resolve('xy-deepseek-desktop/package.json'))
const desktopCommand = process.execPath
const desktopEntry = join(desktopPackageRoot, 'bin', 'cli.mjs')

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
const defaultClientUrl = 'http://127.0.0.1:3080/'

function log(message) {
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 })
  appendFileSync(launcherLogPath, `${new Date().toISOString()} ${message.replace(/[\r\n]+/g, ' ')}\n`, { mode: 0o600 })
  if (process.platform !== 'win32') chmodSync(launcherLogPath, 0o600)
}

function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try { process.kill(pid, 0); return true } catch { return false }
}

function acquireLock() {
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 })
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (existsSync(lockPath)) {
      try {
        const info = statSync(lockPath)
        const raw = readFileSync(lockPath, 'utf8')
        const active = parseLauncherLock(raw, Date.now(), processAlive)
        const isLegacy = !raw.trimStart().startsWith('{')
        if (active && (!isLegacy || Date.now() - info.mtimeMs <= 60_000)) return false
      } catch { /* Replace malformed locks. */ }
      rmSync(lockPath, { force: true })
    }
    try {
      writeFileSync(lockPath, `${JSON.stringify({ pid: process.pid, createdAt: Date.now() })}\n`, { flag: 'wx', mode: 0o600 })
      return true
    } catch {
      // Another activation won the race. Re-read once before yielding.
    }
  }
  return false
}

function releaseLock() {
  try {
    const value = JSON.parse(readFileSync(lockPath, 'utf8'))
    if (value?.pid === process.pid) rmSync(lockPath, { force: true })
  } catch { /* Never delete a lock now owned by another launcher. */ }
}

function readBridge() {
  try {
    const info = statSync(bridgePath)
    if (!info.isFile()) return undefined
    return parseBridgeDescriptor(readFileSync(bridgePath, 'utf8'), {
      now: Date.now(),
      mtimeMs: info.mtimeMs,
      platform: process.platform,
      uid: info.uid,
      currentUid: typeof process.getuid === 'function' ? process.getuid() : info.uid,
      mode: info.mode,
      processAlive,
      defaultClientUrl,
    })
  } catch { return undefined }
}

function portReady(port) {
  return new Promise((resolveReady) => {
    const socket = net.createConnection({ host: '127.0.0.1', port })
    const finish = (ready) => { socket.destroy(); resolveReady(ready) }
    socket.setTimeout(500)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

function probeWeb() {
  return new Promise((resolveProbe) => {
    const request = http.get(defaultClientUrl, { timeout: 800, headers: { accept: 'text/html' } }, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        if (body.length <= 128 * 1024) body += chunk
        if (body.length > 128 * 1024) response.destroy()
      })
      response.on('end', () => resolveProbe(isHarnessHtml(body) ? 'harness' : 'occupied'))
      response.on('error', () => resolveProbe('occupied'))
    })
    request.once('timeout', () => { request.destroy(); resolveProbe('unreachable') })
    request.once('error', (error) => resolveProbe(error?.code === 'ECONNREFUSED' ? 'unreachable' : 'unreachable'))
  })
}

async function waitForBridge(timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const descriptor = readBridge()
    if (descriptor && await portReady(descriptor.port)) return descriptor
    await delay(250)
  }
  return undefined
}

async function waitForWeb(timeoutMs, service) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const state = await probeWeb()
    if (state === 'harness') return true
    if (state === 'occupied') throw new Error('Port 3080 is occupied by a service that is not DeepSeek Harness.')
    if (service?.exitCode !== null) throw new Error(`Harness exited before becoming ready (exit ${service.exitCode ?? 'unknown'}).`)
    await delay(250)
  }
  return false
}

function findDsh() {
  const configured = process.env.XY_DEEPSEEK_PET_DSH
  if (configured && existsSync(configured)) return configured
  const candidates = process.platform === 'win32'
    ? [join(process.env.APPDATA ?? '', 'npm', 'dsh.cmd')]
    : [join(homedir(), '.npm-global', 'bin', 'dsh'), '/usr/local/bin/dsh', '/opt/homebrew/bin/dsh']
  const candidate = candidates.find((path) => path && existsSync(path))
  if (candidate) return candidate
  const lookup = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', ['dsh'], { encoding: 'utf8' })
  const found = lookup.status === 0 ? lookup.stdout.trim().split(/\r?\n/)[0] : undefined
  if (!found) throw new Error('Could not find dsh. Install DeepSeek Harness or set XY_DEEPSEEK_PET_DSH.')
  return found
}

function launchDesktop() {
  if (!existsSync(desktopCommand) || !existsSync(desktopEntry)) throw new Error('Desktop build is missing. Run pnpm install && pnpm build first.')
  const child = spawn(desktopCommand, [desktopEntry, `--bridge-file=${bridgePath}`], {
    cwd: packageRoot,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: { ...process.env, XY_DEEPSEEK_PET_BRIDGE_FILE: bridgePath },
  })
  child.once('error', (error) => log(`pet launch failed: ${error.message}`))
  child.unref()
}

function openClient(url) {
  const now = Date.now()
  try {
    const previous = Number(readFileSync(clientOpenPath, 'utf8'))
    if (Number.isFinite(previous) && now - previous < 5_000) return false
  } catch { /* The first launch has no marker. */ }
  const launch = process.platform === 'darwin'
    ? { command: '/usr/bin/open', args: [url] }
    : process.platform === 'win32'
      ? { command: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', url] }
      : { command: 'xdg-open', args: [url] }
  const result = spawnSync(launch.command, launch.args, { stdio: 'ignore', windowsHide: true, timeout: 5_000 })
  if (result.status !== 0) throw new Error(`Could not open the Harness page (${result.error?.message ?? `exit ${result.status}`}).`)
  writeFileSync(clientOpenPath, `${now}\n`, { mode: 0o600 })
  return true
}

async function startHarness() {
  const logFile = openSync(serviceLogPath, 'a', 0o600)
  try {
    const service = spawn(findDsh(), ['web'], {
      cwd: packageRoot,
      detached: true,
      stdio: ['ignore', logFile, logFile],
      env: {
        ...process.env,
        XY_DEEPSEEK_PET_SERVICE_OWNER: 'launcher',
        XY_DEEPSEEK_PET_DESKTOP_COMMAND: desktopCommand,
        XY_DEEPSEEK_PET_DESKTOP_ENTRY: desktopEntry,
      },
    })
    await new Promise((resolveSpawn, rejectSpawn) => {
      service.once('spawn', resolveSpawn)
      service.once('error', rejectSpawn)
    })
    service.unref()
    return service
  } finally {
    closeSync(logFile)
  }
}

function showFailure(message) {
  const detail = `无法打开 DeepSeek Harness。\n${message}\n\n详情：${launcherLogPath}`
  if (process.platform === 'darwin') {
    spawn('/usr/bin/osascript', [
      '-e', 'on run argv',
      '-e', 'display alert "DeepSeek Harness" message (item 1 of argv) as critical',
      '-e', 'end run',
      detail,
    ], { detached: true, stdio: 'ignore' }).unref()
  } else if (process.platform === 'win32') {
    const script = 'Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.MessageBox]::Show($env:XY_PET_ERROR,"DeepSeek Harness",0,16)'
    spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      detached: true, stdio: 'ignore', windowsHide: true, env: { ...process.env, XY_PET_ERROR: detail },
    }).unref()
  }
}

async function waitForReadyHarness(service) {
  if (!await waitForWeb(30_000, service)) throw new Error(`Harness Web did not become ready. See ${serviceLogPath}`)
}

async function main() {
  log('activation requested')
  if (!acquireLock()) {
    log('another launcher is starting; waiting for it')
    await waitForReadyHarness(undefined)
    const readyBridge = readBridge()
    openClient(readyBridge?.clientUrl ?? defaultClientUrl)
    const bridge = await waitForBridge(5_000)
    if (bridge) launchDesktop()
    return
  }
  try {
    let bridge = await waitForBridge(800)
    const webState = await probeWeb()
    if (webState === 'occupied') throw new Error('Port 3080 is occupied by a service that is not DeepSeek Harness.')
    const service = webState === 'harness' ? undefined : await startHarness()
    await waitForReadyHarness(service)
    bridge ??= readBridge()
    openClient(bridge?.clientUrl ?? defaultClientUrl)
    if (!bridge) bridge = await waitForBridge(12_000)
    if (bridge) launchDesktop()
    else log('Harness opened, but the pet bridge was not available within 12 seconds')
    log('activation completed')
  } finally {
    releaseLock()
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  log(`activation failed: ${message}`)
  showFailure(message)
  console.error(`XY DeepSeek Pet launcher: ${message}`)
  process.exitCode = 1
})
