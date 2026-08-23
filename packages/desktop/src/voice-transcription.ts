import { spawn } from 'node:child_process'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, posix, win32 } from 'node:path'
import { MAX_VOICE_WAV_BYTES } from './voice-audio.js'

export type VoiceLanguage = 'system' | 'zh-CN' | 'en-US'

export interface VoiceTranscriber {
  transcribe(wav: Uint8Array, language: VoiceLanguage): Promise<string>
}

export function isNoSpeechDetectedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /no speech|speech was not recognized|could(?: not|n't) understand|未(?:检测|识别)到(?:语音|讲话)|没有(?:检测|识别)到(?:语音|讲话)/i.test(message)
}

interface SpeechCommand {
  command: string
  args: string[]
  makeExecutable?: string
  resultPath?: string
}

export function systemSpeechCommand(platform: NodeJS.Platform, resourceRoot: string, audioPath: string, language: VoiceLanguage, resultPath?: string): SpeechCommand {
  if (platform === 'darwin') {
    const helperApp = posix.join(resourceRoot, 'voice', 'XY DeepSeek Pet Speech.app')
    const helper = posix.join(helperApp, 'Contents', 'MacOS', 'xy-speech-macos')
    if (!resultPath) throw new Error('A private speech result path is required on macOS.')
    return { command: '/usr/bin/open', args: ['-W', '-n', '-g', '-a', helperApp, '--args', audioPath, language, resultPath], makeExecutable: helper, resultPath }
  }
  if (platform === 'win32') {
    const helper = win32.join(resourceRoot, 'voice', 'xy-speech-windows.ps1')
    const powershell = win32.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    return { command: powershell, args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', helper, '-AudioPath', audioPath, '-Language', language] }
  }
  throw new Error('System speech recognition is available on macOS and Windows only.')
}

export function parseSpeechHelperOutput(stdout: string): string {
  const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1)
  if (!line) throw new Error('System speech recognition returned no result.')
  let result: unknown
  try { result = JSON.parse(line) } catch { throw new Error('System speech recognition returned an invalid result.') }
  if (!result || typeof result !== 'object') throw new Error('System speech recognition returned an invalid result.')
  const value = result as { ok?: unknown; text?: unknown; error?: unknown }
  if (value.ok !== true) throw new Error(typeof value.error === 'string' ? value.error.slice(0, 300) : 'System speech recognition failed.')
  if (typeof value.text !== 'string') throw new Error('System speech recognition returned an invalid result.')
  return value.text.replace(/\s+/g, ' ').trim().slice(0, 8_000)
}

function runSpeechHelper(command: SpeechCommand, timeoutMs = 90_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command.command, command.args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (error) reject(error)
      else resolve(stdout)
    }
    const timer = setTimeout(() => {
      child.kill()
      finish(new Error('System speech recognition timed out.'))
    }, timeoutMs)
    child.stdout.on('data', (chunk: Buffer) => { if (stdout.length < 16_384) stdout += chunk.toString('utf8') })
    child.stderr.on('data', (chunk: Buffer) => { if (stderr.length < 4_096) stderr += chunk.toString('utf8') })
    child.once('error', (error) => finish(error))
    child.once('close', (code) => finish(code === 0 ? undefined : new Error(stderr.trim().slice(0, 300) || `System speech recognition exited with code ${code}.`)))
  })
}

export class SystemVoiceTranscriber implements VoiceTranscriber {
  constructor(private readonly resourceRoot: string, private readonly platform: NodeJS.Platform = process.platform) {}

  async transcribe(wav: Uint8Array, language: VoiceLanguage): Promise<string> {
    if (wav.byteLength < 46 || wav.byteLength > MAX_VOICE_WAV_BYTES) throw new Error('Voice recording is empty or longer than 60 seconds.')
    const directory = await mkdtemp(join(tmpdir(), 'xy-deepseek-pet-voice-'))
    const audioPath = join(directory, 'recording.wav')
    const resultPath = join(directory, 'result.json')
    try {
      await writeFile(audioPath, wav, { mode: 0o600 })
      const command = systemSpeechCommand(this.platform, this.resourceRoot, audioPath, language, resultPath)
      if (command.makeExecutable) await chmod(command.makeExecutable, 0o755)
      const stdout = await runSpeechHelper(command)
      const output = command.resultPath ? await readFile(command.resultPath, 'utf8') : stdout
      return parseSpeechHelperOutput(output)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
}
