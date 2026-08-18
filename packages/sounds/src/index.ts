import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import { type Config } from './config.js'
import { SoundController } from './controller.js'
import { SoundSettingsGateway } from './gateway.js'
import { PlatformSoundPlayer, type SoundPlayer } from './player.js'
import { registerSoundAgentCapabilities } from './agent-capabilities.js'

export { BUILTIN_SOUNDS, resolveBuiltinSound, type SoundAsset } from './assets.js'
export {
  SOUND_CHANNELS,
  resolveSoundConfig,
  type ChannelConfig,
  type ChannelConfigInput,
  type Config,
  type SoundChannel,
  type SoundConfig,
} from './config.js'
export {
  PlatformSoundPlayer,
  platformLaunchSpec,
  type LaunchSpec,
  type PlayableSound,
  type SoundLogger,
  type SoundPlayer,
} from './player.js'
export { SoundEventRouter, type SoundRequest } from './router.js'
export { SoundScheduler } from './scheduler.js'
export { SoundLibrary, MAX_SOUND_BYTES, MAX_SOUND_SECONDS, type ManagedSound } from './library.js'
export { SoundController, type SoundSettingsSnapshot, type SoundView } from './controller.js'

export const name = 'xy-deepseek-sounds'
export const inject = ['agents', 'systemPrompt', 'tools']

export class SoundNotificationRuntime {
  private constructor(private readonly controller: SoundController) {}

  static async create(config: Config = {}, player: SoundPlayer = new PlatformSoundPlayer()): Promise<SoundNotificationRuntime> {
    return new SoundNotificationRuntime(await SoundController.create(config, player))
  }

  get config() { return this.controller.config }

  onSessionEvent(session: Session, event: SessionEvent): boolean {
    return this.controller.onSessionEvent(session, event)
  }

  idle(): Promise<void> {
    return this.controller.idle()
  }

  stop(): void {
    this.controller.stop()
  }
}

export async function apply(ctx: Context, config: Config = {}): Promise<void> {
  const logger = ctx.logger('xy-deepseek-sounds')
  const controller = await SoundController.create(config, new PlatformSoundPlayer(process.platform, logger))
  registerSoundAgentCapabilities(ctx, controller)
  new SoundSettingsGateway(ctx, controller)
  ctx.on('session/event', (session, event) => {
    if (controller.config.rootSessionsOnly) {
      const agent = ctx.agents.get(session.id)
      if (!agent || !ctx.agents.roots().includes(agent)) return
    }
    controller.onSessionEvent(session, event)
  })
  ctx.effect(() => () => controller.stop(), 'xy-deepseek-sounds runtime')
  logger.info('sound notifications ready')
}
