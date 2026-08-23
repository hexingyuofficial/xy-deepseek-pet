import { execFileSync } from 'node:child_process'
import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const ACTION_NAME = '发送到小鲸鱼'

export interface FileQuickActionResult {
  displayName: string
  platform: 'macOS' | 'Windows'
}

function xml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`
}

export function finderQuickActionDocument(command: string): string {
  const script = `exec ${shellQuote(command)} "$@"`
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>AMApplicationBuild</key><string>523</string>
<key>AMApplicationVersion</key><string>2.10</string>
<key>AMDocumentVersion</key><string>2</string>
<key>actions</key><array><dict><key>action</key><dict>
<key>AMAccepts</key><dict><key>Container</key><string>List</string><key>Optional</key><false/><key>Types</key><array><string>com.apple.cocoa.path</string></array></dict>
<key>AMActionVersion</key><string>2.0.3</string>
<key>AMParameterProperties</key><dict/>
<key>AMProvides</key><dict><key>Container</key><string>List</string><key>Types</key><array><string>com.apple.cocoa.path</string></array></dict>
<key>ActionBundlePath</key><string>/System/Library/Automator/Run Shell Script.action</string>
<key>ActionName</key><string>Run Shell Script</string>
<key>ActionParameters</key><dict><key>COMMAND_STRING</key><string>${xml(script)}</string><key>CheckedForUserDefaultShell</key><false/><key>inputMethod</key><integer>1</integer><key>shell</key><string>/bin/zsh</string><key>source</key><string></string></dict>
<key>BundleIdentifier</key><string>com.apple.RunShellScript</string>
<key>CFBundleVersion</key><string>2.0.3</string>
<key>CanShowSelectedItemsWhenRun</key><false/><key>CanShowWhenRun</key><true/>
<key>Class Name</key><string>RunShellScriptAction</string>
<key>InputUUID</key><string>6D48E37A-47A8-42A4-8D09-11DEE0000001</string>
<key>OutputUUID</key><string>43D2BC25-BA6A-4410-8E81-11DEE0000002</string>
<key>UUID</key><string>C6D38B8B-774D-4BF7-A180-11DEE0000003</string>
</dict><key>isViewVisible</key><true/></dict></array>
<key>connectors</key><dict/>
<key>workflowMetaData</key><dict>
<key>serviceApplicationBundleID</key><string>com.apple.finder</string>
<key>serviceApplicationPath</key><string>/System/Library/CoreServices/Finder.app</string>
<key>serviceInputTypeIdentifier</key><string>com.apple.Automator.fileSystemObject</string>
<key>serviceOutputTypeIdentifier</key><string>com.apple.Automator.nothing</string>
<key>serviceProcessesInput</key><integer>0</integer>
<key>workflowTypeIdentifier</key><string>com.apple.Automator.servicesMenu</string>
</dict></dict></plist>
`
}

export function finderQuickActionInfo(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleDevelopmentRegion</key><string>zh_CN</string>
<key>CFBundleIdentifier</key><string>com.xy-deepseek-pet.send-to-whale</string>
<key>CFBundleName</key><string>${ACTION_NAME}</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>NSServices</key><array><dict>
<key>NSMenuItem</key><dict><key>default</key><string>${ACTION_NAME}</string></dict>
<key>NSMessage</key><string>runWorkflowAsService</string>
<key>NSRequiredContext</key><dict><key>NSApplicationIdentifier</key><string>com.apple.finder</string></dict>
<key>NSSendFileTypes</key><array><string>public.item</string></array>
</dict></array>
</dict></plist>
`
}

function installFinderQuickAction(packageRoot: string, nodeExecutable: string): FileQuickActionResult {
  const runtimeRoot = join(homedir(), '.xy-deepseek-pet')
  const command = join(runtimeRoot, 'send-files-to-pet')
  const workflow = join(homedir(), 'Library', 'Services', `${ACTION_NAME}.workflow`)
  const contents = join(workflow, 'Contents')
  const resources = join(contents, 'Resources')
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 })
  writeFileSync(command, `#!/bin/sh\numask 077\nexec ${shellQuote(nodeExecutable)} ${shellQuote(join(packageRoot, 'runtime', 'launch.mjs'))} --finder-compose "$@"\n`, { mode: 0o700 })
  chmodSync(command, 0o700)
  rmSync(workflow, { recursive: true, force: true })
  mkdirSync(resources, { recursive: true, mode: 0o700 })
  writeFileSync(join(contents, 'Info.plist'), finderQuickActionInfo(), { mode: 0o600 })
  writeFileSync(join(resources, 'document.wflow'), finderQuickActionDocument(command), { mode: 0o600 })
  try { execFileSync('/System/Library/CoreServices/pbs', ['-update'], { stdio: 'ignore' }) } catch { /* Finder refreshes Services lazily if cache refresh is unavailable. */ }
  return { displayName: ACTION_NAME, platform: 'macOS' }
}

export function windowsSendToArguments(launchScript: string): string {
  return `"${launchScript.replaceAll('"', '\\"')}" --finder-compose`
}

export function fileQuickActionPackageRoot(packageRoot: string): string {
  return resolve(packageRoot)
}

function installWindowsSendTo(packageRoot: string, nodeExecutable: string): FileQuickActionResult {
  const launchScript = join(packageRoot, 'runtime', 'launch.mjs')
  const sendToRoot = process.env.APPDATA
    ? join(process.env.APPDATA, 'Microsoft', 'Windows', 'SendTo')
    : join(homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'SendTo')
  const shortcut = join(sendToRoot, `${ACTION_NAME}.lnk`)
  mkdirSync(sendToRoot, { recursive: true })
  const script = '$w=New-Object -ComObject WScript.Shell;$s=$w.CreateShortcut($env:XY_PET_SENDTO);$s.TargetPath=$env:XY_PET_NODE;$s.Arguments=$env:XY_PET_ARGUMENTS;$s.WorkingDirectory=$env:XY_PET_ROOT;$s.Save()'
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    stdio: 'ignore',
    windowsHide: true,
    env: {
      ...process.env,
      XY_PET_SENDTO: shortcut,
      XY_PET_NODE: nodeExecutable,
      XY_PET_ARGUMENTS: windowsSendToArguments(launchScript),
      XY_PET_ROOT: packageRoot,
    },
  })
  return { displayName: ACTION_NAME, platform: 'Windows' }
}

export function installFileQuickAction(packageRoot: string, nodeExecutable: string): FileQuickActionResult {
  const absolutePackageRoot = fileQuickActionPackageRoot(packageRoot)
  if (process.platform === 'darwin') return installFinderQuickAction(absolutePackageRoot, nodeExecutable)
  if (process.platform === 'win32') return installWindowsSendTo(absolutePackageRoot, nodeExecutable)
  throw new Error('File quick actions currently support macOS and Windows.')
}
