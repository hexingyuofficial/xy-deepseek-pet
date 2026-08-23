const MAX_BRIDGE_AGE_MS = 7 * 24 * 60 * 60 * 1000
const MAX_LOCK_AGE_MS = 60_000

export function cleanElectronRuntimeEnv(source = process.env, extra = {}) {
  const env = { ...source, ...extra }
  delete env.ELECTRON_RUN_AS_NODE
  delete env.ELECTRON_NO_ATTACH_CONSOLE
  return env
}

export function isHarnessHtml(body) {
  return typeof body === 'string'
    && body.length <= 128 * 1024
    && (body.includes('window.__DSH_BOOT__') || /<title>\s*DeepSeek Harness\s*<\/title>/i.test(body))
}

export function safeHarnessUrl(value, fallback = 'http://127.0.0.1:3080/') {
  if (typeof value !== 'string' || value.length > 2_048) return fallback
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) return fallback
    url.username = ''
    url.password = ''
    return url.href
  } catch {
    return fallback
  }
}

export function parseBridgeDescriptor(raw, options) {
  try {
    const value = JSON.parse(raw)
    if (options.now - options.mtimeMs > MAX_BRIDGE_AGE_MS) return undefined
    if (options.platform !== 'win32' && (options.uid !== options.currentUid || (options.mode & 0o077) !== 0)) return undefined
    if (value?.version !== 1 || !options.processAlive(value.pid)) return undefined
    if (!Number.isInteger(value.port) || value.port <= 0 || value.port >= 65_536) return undefined
    if (typeof value.token !== 'string' || value.token.length < 32 || value.token.length > 512) return undefined
    return { ...value, clientUrl: safeHarnessUrl(value.clientUrl, options.defaultClientUrl) }
  } catch {
    return undefined
  }
}

export function parseLauncherLock(raw, now, processAlive) {
  try {
    const value = JSON.parse(raw)
    if (!Number.isInteger(value.pid) || value.pid <= 0 || !Number.isFinite(value.createdAt)) return undefined
    if (now - value.createdAt > MAX_LOCK_AGE_MS || now < value.createdAt - 5_000 || !processAlive(value.pid)) return undefined
    return value
  } catch {
    // Alpha 1 wrote a plain PID; accept it only briefly through file mtime handling in the caller.
    const pid = Number(raw.trim())
    return Number.isInteger(pid) && pid > 0 && processAlive(pid) ? { pid, createdAt: now } : undefined
  }
}
