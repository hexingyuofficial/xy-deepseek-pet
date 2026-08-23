import { spawn, type ChildProcess } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import type { SoundAsset } from './assets.js'

export type PlayableSound = SoundAsset & { path: string }

export interface SoundPlayer {
  play(asset: PlayableSound, volume: number): Promise<void>
  stop(): void
}

export interface SoundLogger {
  debug?(message: string): void
  warn?(message: string): void
}

export interface LaunchSpec {
  command: string
  args: string[]
}

const WINDOWS_PLAYER_SCRIPT = fileURLToPath(new URL('../runtime/play-sound.ps1', import.meta.url))

export function platformLaunchSpec(
  platform: NodeJS.Platform,
  path: string,
  volume: number,
  windowsPlayerScript = WINDOWS_PLAYER_SCRIPT,
): LaunchSpec | undefined {
  if (platform === 'darwin') return { command: 'afplay', args: ['-v', String(volume), path] }
  if (platform === 'win32') {
    return {
      command: 'powershell.exe',
      args: [
        '-NoProfile',
        '-NonInteractive',
        '-File',
        windowsPlayerScript,
        '-SoundPath',
        path,
        '-Volume',
        String(volume),
      ],
    }
  }
  return undefined
}

export class PlatformSoundPlayer implements SoundPlayer {
  private readonly children = new Set<ChildProcess>()
  private unavailableReported = false

  constructor(
    private readonly platform = process.platform,
    private readonly logger: SoundLogger = {},
  ) {}

  play(asset: PlayableSound, volume: number): Promise<void> {
    const launch = platformLaunchSpec(this.platform, asset.path, Math.min(1, Math.max(0, volume)))
    if (!launch) {
      if (!this.unavailableReported) {
        this.logger.warn?.(`local audio is unavailable on ${this.platform}`)
        this.unavailableReported = true
      }
      return Promise.resolve()
    }

    this.logger.debug?.(`sound playback starting: asset=${asset.id} volume=${Math.min(1, Math.max(0, volume)).toFixed(2)}`)
    return new Promise((resolvePlayback) => {
      const child = spawn(launch.command, launch.args, {
        shell: false,
        stdio: 'ignore',
        windowsHide: true,
      })
      this.children.add(child)
      let finished = false
      const finish = (detail: string) => {
        if (finished) return
        finished = true
        this.children.delete(child)
        this.logger.debug?.(`sound playback finished: asset=${asset.id} ${detail}`)
        resolvePlayback()
      }
      child.once('exit', (code, signal) => finish(`code=${code ?? 'null'} signal=${signal ?? 'none'}`))
      child.once('error', (error) => {
        this.logger.warn?.(`sound playback failed: ${String(error)}`)
        finish('outcome=spawn-error')
      })
    })
  }

  stop(): void {
    for (const child of this.children) child.kill()
    this.children.clear()
  }
}
