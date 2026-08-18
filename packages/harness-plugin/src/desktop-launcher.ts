import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export type LauncherIconId = 'calm' | 'custom'

export interface DesktopLauncherRequest {
  packageRoot: string
  name: string
  iconId: LauncherIconId
  fileName?: string
  dataBase64?: string
}

export interface DesktopLauncherResult {
  displayName: string
  platform: 'macOS' | 'Windows'
}

export function sanitizeLauncherName(value: string): string {
  const name = value.trim().replace(/[\u0000-\u001f\u007f]/g, '')
  if (!name || name.length > 48 || /[\\/:*?"<>|]/.test(name) || name === '.' || name === '..') {
    throw new Error('Desktop shortcut name must be 1-48 characters without path separators.')
  }
  return name
}

export function decodeLauncherPng(dataBase64: string): Buffer {
  if (!dataBase64 || dataBase64.length > 7_000_000) throw new Error('Desktop icon must be a PNG no larger than 5 MiB.')
  const bytes = Buffer.from(dataBase64, 'base64')
  if (bytes.length < 24 || bytes.length > 5 * 1024 * 1024 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('Desktop icon must be a valid PNG no larger than 5 MiB.')
  }
  return bytes
}

function xml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`
}

function iconPath(request: DesktopLauncherRequest): string {
  const iconRoot = join(request.packageRoot, 'assets')
  if (request.iconId !== 'custom') return join(iconRoot, 'whale-calm.png')
  if (!request.fileName?.toLowerCase().endsWith('.png')) throw new Error('Custom desktop icon must use a .png file.')
  const bytes = decodeLauncherPng(request.dataBase64 ?? '')
  const customRoot = join(homedir(), '.xy-deepseek-pet', 'launcher-icons')
  mkdirSync(customRoot, { recursive: true, mode: 0o700 })
  const destination = join(customRoot, `custom-${Date.now()}.png`)
  writeFileSync(destination, bytes, { mode: 0o600 })
  return destination
}

function validateIcon(path: string): void {
  if (!existsSync(path)) throw new Error('The selected desktop icon is unavailable.')
  const info = statSync(path)
  if (!info.isFile() || info.size < 24 || info.size > 5 * 1024 * 1024) throw new Error('Desktop icon must be a PNG no larger than 5 MiB.')
  if (readFileSync(path).subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('The selected desktop icon is not a valid PNG.')
}

export function macLauncherScript(nodeExecutable: string, launchScript: string): string {
  return `#!/bin/sh\numask 077\nexec ${shellQuote(nodeExecutable)} ${shellQuote(launchScript)} >> "$HOME/.xy-deepseek-pet/launcher.log" 2>&1\n`
}

export function launcherNodeExecutable(): string {
  if (process.platform === 'darwin') {
    const stable = ['/opt/homebrew/bin/node', '/usr/local/bin/node'].find((candidate) => existsSync(candidate))
    if (stable) return stable
  }
  return process.execPath
}

function createMacLauncher(packageRoot: string, name: string, icon: string): void {
  const launchScript = join(packageRoot, 'runtime', 'launch.mjs')
  if (!existsSync(launchScript)) throw new Error('The development launcher runtime is unavailable.')
  const target = join(homedir(), 'Desktop', `${name}.app`)
  if (existsSync(target)) throw new Error(`“${name}” already exists on the desktop.`)
  const contents = join(target, 'Contents')
  const macos = join(contents, 'MacOS')
  const resources = join(contents, 'Resources')
  const iconset = join(resources, 'Pet.iconset')
  try {
    mkdirSync(macos, { recursive: true })
    mkdirSync(iconset, { recursive: true })
    for (const size of [16, 32, 128, 256, 512]) {
      execFileSync('sips', ['-z', String(size), String(size), icon, '--out', join(iconset, `icon_${size}x${size}.png`)], { stdio: 'ignore' })
      execFileSync('sips', ['-z', String(size * 2), String(size * 2), icon, '--out', join(iconset, `icon_${size}x${size}@2x.png`)], { stdio: 'ignore' })
    }
    execFileSync('iconutil', ['-c', 'icns', iconset, '-o', join(resources, 'Pet.icns')], { stdio: 'ignore' })
    rmSync(iconset, { recursive: true, force: true })
    const executable = join(macos, 'launch')
    writeFileSync(executable, macLauncherScript(launcherNodeExecutable(), launchScript))
    chmodSync(executable, 0o755)
    writeFileSync(join(contents, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>CFBundleName</key><string>${xml(name)}</string><key>CFBundleDisplayName</key><string>${xml(name)}</string><key>CFBundleExecutable</key><string>launch</string><key>CFBundleIconFile</key><string>Pet</string><key>CFBundleIdentifier</key><string>dev.xy-deepseek-pet.launcher</string><key>CFBundlePackageType</key><string>APPL</string></dict></plist>\n`)
  } catch (error) {
    rmSync(target, { recursive: true, force: true })
    throw error
  }
}

function pngAsIco(png: Buffer): Buffer {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18)
  return Buffer.concat([header, png])
}

function createWindowsLauncher(packageRoot: string, name: string, icon: string): void {
  const launchScript = join(packageRoot, 'runtime', 'launch.mjs')
  if (!existsSync(launchScript)) throw new Error('The development launcher runtime is unavailable.')
  const shortcut = join(homedir(), 'Desktop', `${name}.lnk`)
  if (existsSync(shortcut)) throw new Error(`“${name}” already exists on the desktop.`)
  const iconRoot = join(homedir(), '.xy-deepseek-pet', 'launcher-icons')
  mkdirSync(iconRoot, { recursive: true, mode: 0o700 })
  const ico = join(iconRoot, `${name}.ico`)
  writeFileSync(ico, pngAsIco(readFileSync(icon)), { mode: 0o600 })
  const script = '$w=New-Object -ComObject WScript.Shell;$s=$w.CreateShortcut($env:XY_PET_SHORTCUT);$s.TargetPath=$env:XY_PET_NODE;$s.Arguments=$env:XY_PET_ARGUMENTS;$s.WorkingDirectory=$env:XY_PET_ROOT;$s.IconLocation=$env:XY_PET_ICON;$s.Save()'
  const quoteWindowsArgument = (value: string) => `"${value.replaceAll('"', '\\"')}"`
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    stdio: 'ignore',
    env: {
      ...process.env,
      XY_PET_SHORTCUT: shortcut,
      XY_PET_NODE: launcherNodeExecutable(),
      XY_PET_ARGUMENTS: quoteWindowsArgument(launchScript),
      XY_PET_ROOT: packageRoot,
      XY_PET_ICON: `${ico},0`,
    },
  })
}

export function createDesktopLauncher(request: DesktopLauncherRequest): DesktopLauncherResult {
  const name = sanitizeLauncherName(request.name)
  const icon = iconPath(request)
  validateIcon(icon)
  if (process.platform === 'darwin') {
    createMacLauncher(request.packageRoot, name, icon)
    return { displayName: name, platform: 'macOS' }
  }
  if (process.platform === 'win32') {
    createWindowsLauncher(request.packageRoot, name, icon)
    return { displayName: name, platform: 'Windows' }
  }
  throw new Error('Desktop shortcut creation currently supports macOS and Windows.')
}
