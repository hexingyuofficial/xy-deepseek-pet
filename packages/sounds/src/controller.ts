import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { BUILTIN_SOUNDS, resolveBuiltinSound } from './assets.js'
import {
  SOUND_CHANNELS,
  resolveSoundConfig,
  type Config,
  type SoundChannel,
  type SoundConfig,
} from './config.js'
import { SoundLibrary, type ManagedSound } from './library.js'
import { PlatformSoundPlayer, type PlayableSound, type SoundPlayer } from './player.js'
import { SoundEventRouter } from './router.js'
import { SoundScheduler } from './scheduler.js'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'

export interface SoundView {
  id: string
  displayName: string
  builtIn: boolean
  channels: readonly SoundChannel[]
  bytes?: number
  durationSeconds?: number
}

export interface SoundSettingsSnapshot {
  config: SoundConfig
  sounds: SoundView[]
  limits: { maximumBytes: number; maximumSeconds: number }
}

function configInput(config: SoundConfig): Config {
  return {
    masterMute: config.masterMute,
    masterVolume: config.masterVolume,
    turnComplete: { ...config.channels.turnComplete },
    toolSuccess: { ...config.channels.toolSuccess },
    toolFailure: { ...config.channels.toolFailure },
    minimumTurnDurationMs: config.minimumTurnDurationMs,
    toolCooldownMs: config.toolCooldownMs,
    toolCoalesceMs: config.toolCoalesceMs,
    maximumQueueSize: config.maximumQueueSize,
    rootSessionsOnly: config.rootSessionsOnly,
  }
}

function customPlayable(sound: ManagedSound): PlayableSound {
  return {
    id: sound.id,
    displayName: sound.displayName,
    file: basename(sound.path),
    channels: SOUND_CHANNELS,
    path: sound.path,
  }
}

export class SoundController {
  private currentConfig: SoundConfig
  private router: SoundEventRouter
  private scheduler: SoundScheduler

  private constructor(
    initialConfig: SoundConfig,
    private readonly library: SoundLibrary,
    private readonly player: SoundPlayer,
    private readonly settingsPath: string,
  ) {
    this.currentConfig = initialConfig
    this.router = new SoundEventRouter(initialConfig)
    this.scheduler = this.createScheduler(initialConfig)
  }

  static async create(
    configured: Config = {},
    player: SoundPlayer = new PlatformSoundPlayer(),
    runtimeRoot = join(homedir(), '.xy-deepseek-pet'),
  ): Promise<SoundController> {
    await mkdir(runtimeRoot, { recursive: true, mode: 0o700 })
    const settingsPath = join(runtimeRoot, 'sound-settings.json')
    let initial = resolveSoundConfig(configured)
    try {
      initial = resolveSoundConfig(JSON.parse(await readFile(settingsPath, 'utf8')) as Config)
    } catch {
      // First run and malformed local settings both fall back to Cordis config.
    }
    const library = new SoundLibrary(runtimeRoot)
    await library.initialize()
    const controller = new SoundController(initial, library, player, settingsPath)
    controller.currentConfig = controller.normalizeSelections(initial)
    await controller.persist()
    return controller
  }

  get config(): SoundConfig { return this.currentConfig }

  onSessionEvent(session: Session, event: SessionEvent): boolean {
    const request = this.router.route(String(session.id), event)
    return request ? this.scheduler.enqueue(request) : false
  }

  idle(): Promise<void> { return this.scheduler.idle() }

  snapshot(): SoundSettingsSnapshot {
    const custom = this.library.list()
    return {
      config: structuredClone(this.currentConfig),
      sounds: [
        ...BUILTIN_SOUNDS.map((sound) => ({
          id: sound.id,
          displayName: sound.displayName,
          builtIn: true,
          channels: [...sound.channels],
        })),
        ...custom.map((sound) => ({
          id: sound.id,
          displayName: sound.displayName,
          builtIn: false,
          channels: [...SOUND_CHANNELS],
          bytes: sound.bytes,
          durationSeconds: sound.durationSeconds,
        })),
      ],
      limits: { maximumBytes: 10 * 1024 * 1024, maximumSeconds: 10 },
    }
  }

  async update(config: SoundConfig): Promise<SoundSettingsSnapshot> {
    await this.replaceConfig(this.normalizeSelections(resolveSoundConfig(configInput(config))))
    return this.snapshot()
  }

  async importSound(bytes: Buffer, fileName: string): Promise<SoundSettingsSnapshot> {
    await this.library.importBuffer(bytes, fileName)
    return this.snapshot()
  }

  async removeSound(id: string): Promise<SoundSettingsSnapshot> {
    await this.library.remove(id)
    await this.replaceConfig(this.normalizeSelections(this.currentConfig))
    return this.snapshot()
  }

  async restoreBuiltIns(): Promise<SoundSettingsSnapshot> {
    const defaults = resolveSoundConfig()
    const next = structuredClone(this.currentConfig)
    for (const channel of SOUND_CHANNELS) next.channels[channel].soundId = defaults.channels[channel].soundId
    await this.replaceConfig(next)
    return this.snapshot()
  }

  async preview(channel: SoundChannel, soundId: string): Promise<void> {
    const sound = this.resolveSound(soundId, channel)
    if (!sound) throw new Error('Selected sound is unavailable for this channel')
    const volume = Math.min(1, this.currentConfig.masterVolume * this.currentConfig.channels[channel].volume)
    await this.player.play(sound, volume)
  }

  stop(): void {
    this.scheduler.stop()
    this.player.stop()
  }

  private createScheduler(config: SoundConfig): SoundScheduler {
    return new SoundScheduler(config, this.player, Date.now, (id, channel) => this.resolveSound(id, channel))
  }

  private resolveSound(id: string, channel: SoundChannel): PlayableSound | undefined {
    const builtIn = resolveBuiltinSound(id, channel)
    if (builtIn) return builtIn
    const custom = this.library.list().find((sound) => sound.id === id)
    return custom ? customPlayable(custom) : undefined
  }

  private normalizeSelections(config: SoundConfig): SoundConfig {
    const next = structuredClone(config)
    const defaults = resolveSoundConfig()
    for (const channel of SOUND_CHANNELS) {
      if (!this.resolveSound(next.channels[channel].soundId, channel)) {
        next.channels[channel].soundId = defaults.channels[channel].soundId
      }
    }
    return next
  }

  private async replaceConfig(config: SoundConfig): Promise<void> {
    this.scheduler.stop()
    this.currentConfig = config
    this.router = new SoundEventRouter(config)
    this.scheduler = this.createScheduler(config)
    await this.persist()
  }

  private async persist(): Promise<void> {
    const staging = `${this.settingsPath}.partial-${process.pid}`
    await writeFile(staging, `${JSON.stringify(configInput(this.currentConfig), null, 2)}\n`, { mode: 0o600 })
    await rename(staging, this.settingsPath)
  }
}
