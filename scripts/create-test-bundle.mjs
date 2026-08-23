import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const repositoryRoot = resolve(import.meta.dirname, '..')
const version = process.argv[2]
const requestedOutput = process.argv[3]

if (!version || !/^0\.1\.1-test\.[0-9A-Za-z.-]+$/.test(version)) {
  throw new Error('Usage: pnpm package:test 0.1.1-test.YYYYMMDD.N [output-directory]')
}

const outputRoot = resolve(requestedOutput ?? join(repositoryRoot, '..', `XY-DeepSeek-Pet-${version.replaceAll('.', '-')}`))
const stagingRoot = await mkdtemp(join(tmpdir(), 'xy-deepseek-pet-pack-'))

async function stagePackage(source, name) {
  const destination = join(stagingRoot, name)
  await cp(resolve(repositoryRoot, source), destination, {
    recursive: true,
    filter: (entry) => basename(entry) !== 'node_modules',
  })
  const manifestPath = join(destination, 'package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  manifest.version = version
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [dependency, range] of Object.entries(manifest[section] ?? {})) {
      if (typeof range === 'string' && range.startsWith('workspace:')) {
        manifest[section][dependency] = range === 'workspace:*' ? '0.1.0' : range.slice('workspace:'.length)
      }
    }
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return { destination, manifest, manifestPath }
}

async function pack(directory) {
  const { stdout } = await exec('npm', ['pack', '--json', '--pack-destination', outputRoot], {
    cwd: directory,
    maxBuffer: 20 * 1024 * 1024,
  })
  const result = JSON.parse(stdout)
  if (!Array.isArray(result) || result.length !== 1 || !result[0].filename) {
    throw new Error(`Unexpected npm pack result for ${directory}`)
  }
  return join(outputRoot, result[0].filename)
}

async function archiveJson(archive, member) {
  const { stdout } = await exec('tar', ['-xOf', archive, member], { maxBuffer: 4 * 1024 * 1024 })
  return JSON.parse(stdout)
}

async function archiveMembers(archive) {
  const { stdout } = await exec('tar', ['-tzf', archive], { maxBuffer: 40 * 1024 * 1024 })
  return new Set(stdout.trim().split('\n'))
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex')
}

try {
  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })

  const desktop = await stagePackage('packages/desktop', 'desktop')
  const desktopArchive = await pack(desktop.destination)

  const pet = await stagePackage('packages/harness-plugin', 'pet')
  const desktopFileName = basename(desktopArchive)
  pet.manifest.dependencies['xy-deepseek-desktop'] = version
  for (const [dependency, range] of Object.entries(desktop.manifest.dependencies ?? {})) {
    pet.manifest.dependencies[dependency] = range
  }
  pet.manifest.bundledDependencies = ['xy-deepseek-desktop']
  await mkdir(join(pet.destination, 'node_modules'), { recursive: true })
  await cp(desktop.destination, join(pet.destination, 'node_modules', 'xy-deepseek-desktop'), { recursive: true })
  await writeFile(pet.manifestPath, `${JSON.stringify(pet.manifest, null, 2)}\n`)
  const petArchive = await pack(pet.destination)

  const sounds = await stagePackage('packages/sounds', 'sounds')
  const soundsArchive = await pack(sounds.destination)

  const petManifest = await archiveJson(petArchive, 'package/package.json')
  const desktopManifest = await archiveJson(desktopArchive, 'package/package.json')
  const soundsManifest = await archiveJson(soundsArchive, 'package/package.json')
  const desktopMembers = await archiveMembers(desktopArchive)
  const soundsMembers = await archiveMembers(soundsArchive)

  for (const [name, manifest] of [
    ['xy-deepseek-pet', petManifest],
    ['xy-deepseek-desktop', desktopManifest],
    ['xy-deepseek-sounds', soundsManifest],
  ]) {
    if (manifest.version !== version) throw new Error(`${name} has mismatched version ${manifest.version}`)
    if (JSON.stringify(manifest).includes('workspace:')) throw new Error(`${name} still contains a workspace dependency`)
  }
  if (petManifest.dependencies?.['xy-deepseek-desktop'] !== version) {
    throw new Error('The pet package does not require the matching desktop version')
  }
  if (!petManifest.bundledDependencies?.includes('xy-deepseek-desktop')) {
    throw new Error('The pet package does not bundle the matching desktop runtime')
  }
  const requiredDesktopMembers = [
    'package/bin/cli.mjs',
    'package/bin/electron-env.mjs',
    'package/dist/main.js',
    'package/dist/preload.cjs',
    'package/dist/renderer.js',
    'package/dist/resources/schemas/theme.schema.json',
    'package/dist/resources/voice/recording-start.wav',
    'package/dist/resources/voice/recording-stop.wav',
    'package/dist/resources/voice/xy-speech-windows.ps1',
  ]
  for (const member of requiredDesktopMembers) {
    if (!desktopMembers.has(member)) throw new Error(`Desktop archive is missing ${member}`)
  }
  for (const member of [
    'package/assets/default-complete.wav',
    'package/assets/default-tool-success.wav',
    'package/assets/default-tool-failure.wav',
  ]) {
    if (!soundsMembers.has(member)) throw new Error(`Sounds archive is missing ${member}`)
  }
  const petMembers = await archiveMembers(petArchive)
  for (const member of requiredDesktopMembers) {
    const bundledMember = member.replace('package/', 'package/node_modules/xy-deepseek-desktop/')
    if (!petMembers.has(bundledMember)) throw new Error(`Pet archive is missing bundled desktop member ${bundledMember}`)
  }

  const petFile = basename(petArchive)
  const desktopFile = basename(desktopArchive)
  const soundsFile = basename(soundsArchive)
  await writeFile(join(outputRoot, 'Install.command'), `#!/bin/zsh
set -euo pipefail
SCRIPT_DIR="\${0:A:h}"
PROFILE="\${1:-web}"
PET_ARCHIVE="$SCRIPT_DIR/${petFile}"
DESKTOP_ARCHIVE="$SCRIPT_DIR/${desktopFile}"
SOUNDS_ARCHIVE="$SCRIPT_DIR/${soundsFile}"

pause_before_exit() {
  if [[ -t 0 ]]; then
    printf '\\n按任意键关闭窗口...'
    read -k 1
    printf '\\n'
  fi
}
trap pause_before_exit EXIT

command -v dsh >/dev/null 2>&1 || { print -u2 '没有找到 dsh。请先安装 DeepSeek Harness。'; exit 1; }
[[ -f "$DESKTOP_ARCHIVE" && -f "$PET_ARCHIVE" && -f "$SOUNDS_ARCHIVE" ]] || { print -u2 '测试包不完整。'; exit 1; }
PROFILE_MODULES="$(dsh plugin --profile "$PROFILE" root | tail -n 1)"
[[ "\${PROFILE_MODULES:t}" == 'node_modules' ]] || { print -u2 "无法识别 Harness profile：$PROFILE_MODULES"; exit 1; }
PROFILE_DIR="\${PROFILE_MODULES:h}"

# Electron keeps the pet alive independently from dsh. Stop only the verified
# XY process so an upgrade cannot leave the previous renderer in memory.
SINGLETON_LOCK="$HOME/Library/Application Support/XY DeepSeek Pet/SingletonLock"
if [[ -L "$SINGLETON_LOCK" ]]; then
  LOCK_TARGET="$(readlink "$SINGLETON_LOCK" 2>/dev/null || true)"
  PET_PID="\${LOCK_TARGET##*-}"
  if [[ "$PET_PID" == <-> ]]; then
    PET_COMMAND="$(ps -p "$PET_PID" -o command= 2>/dev/null || true)"
    if [[ "$PET_COMMAND" == *Electron* && "$PET_COMMAND" == *'/dist/main.js'* ]]; then
      print '正在关闭旧版桌宠...'
      kill -TERM "$PET_PID" 2>/dev/null || true
      for _ in {1..20}; do
        kill -0 "$PET_PID" 2>/dev/null || break
        sleep 0.1
      done
    fi
  fi
fi

print '正在安装桌宠与提示音。首次安装 Electron 时可能需要等待几分钟...'
dsh plugin --profile "$PROFILE" add --allow-build=electron "$PET_ARCHIVE" "$SOUNDS_ARCHIVE"
INSTALLED_VERSION="$(cd "$PROFILE_DIR" && node -e 'const fs=require("node:fs");const {createRequire}=require("node:module");const pet=fs.realpathSync(require.resolve("xy-deepseek-pet/package.json"));process.stdout.write(createRequire(pet)("xy-deepseek-desktop/package.json").version)' 2>/dev/null || true)"
[[ "$INSTALLED_VERSION" == '${version}' ]] || { print -u2 "桌面运行时版本核验失败：期望 ${version}，实际 \${INSTALLED_VERSION:-未安装}"; exit 1; }
print '\\n安装完成：XY DeepSeek Pet ${version}'
print '请完整退出正在运行的 dsh web，再执行 dsh web 重新启动。'
`, { mode: 0o755 })

  await writeFile(join(outputRoot, 'Install.ps1'), `$ErrorActionPreference = 'Stop'
$ProfileName = if ($args.Count -gt 0) { $args[0] } else { 'web' }
$BundleDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DesktopArchive = Join-Path $BundleDir '${desktopFile}'
$PetArchive = Join-Path $BundleDir '${petFile}'
$SoundsArchive = Join-Path $BundleDir '${soundsFile}'
if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) { throw 'dsh was not found. Install DeepSeek Harness first.' }
$ProfileModules = ((& dsh plugin --profile $ProfileName root) | Select-Object -Last 1).Trim()
if ((Split-Path -Leaf $ProfileModules) -ne 'node_modules') { throw "Could not locate the Harness profile: $ProfileModules" }
$ProfileDir = Split-Path -Parent $ProfileModules

# Match only this product's Electron entry point. Other Electron applications
# are intentionally left alone.
$PetProcesses = Get-CimInstance Win32_Process -Filter "Name = 'electron.exe'" -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -match 'xy-deepseek-desktop.*[\\/]dist[\\/]main\.js'
}
foreach ($PetProcess in $PetProcesses) {
  Write-Host 'Stopping the previous desktop pet...'
  Stop-Process -Id $PetProcess.ProcessId -ErrorAction SilentlyContinue
}

Write-Host 'Installing the pet and sounds. The first Electron download can take several minutes...'
& dsh plugin --profile $ProfileName add --allow-build=electron $PetArchive $SoundsArchive
if ($LASTEXITCODE -ne 0) { throw "dsh plugin add failed with exit code $LASTEXITCODE" }
Write-Host 'Installed XY DeepSeek Pet ${version}. Fully stop and restart dsh web.'
`)

  await writeFile(join(outputRoot, 'README.md'), `# XY DeepSeek Pet ${version} 测试包

这是未上传的本地测试构建，可覆盖已安装的 0.1.0 或更早测试版。

## 安装 / 升级

- macOS：解压后双击 \`Install.command\`；若系统拦截，右键选择“打开”。
- Windows：在 PowerShell 运行 \`powershell -ExecutionPolicy Bypass -File .\\Install.ps1\`。
- 安装后必须完整退出旧的 \`dsh web\`，再重新执行 \`dsh web\`。
- 首次安装会下载 Electron（约 120-150 MB），可能需要几分钟。

安装脚本会先关闭仍驻留内存的旧桌宠。宠物 tgz 内嵌完全相同版本的 \`xy-deepseek-desktop\` 代码，但 Electron 二进制仍由包管理器按当前平台下载；完成后会读取实际安装版本，若不是 ${version} 会直接报错，不会静默使用旧版。请保持三个 tgz 与安装脚本在同一个文件夹。

设置位置：通用设置 > 桌面宠物。
`)

  const checksums = []
  for (const file of [petFile, desktopFile, soundsFile, 'Install.command', 'Install.ps1', 'README.md']) {
    checksums.push(`${await sha256(join(outputRoot, file))}  ${file}`)
  }
  await writeFile(join(outputRoot, 'SHA256SUMS'), `${checksums.join('\n')}\n`)
  console.log(outputRoot)
} finally {
  await rm(stagingRoot, { recursive: true, force: true })
}
