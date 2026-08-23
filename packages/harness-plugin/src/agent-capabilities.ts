import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { readFile, stat } from 'node:fs/promises'
import { basename } from 'node:path'
import type { HarnessPetRuntime } from './index.js'
import { PET_SCALE_MAX, PET_SCALE_MIN, PET_SCALE_STEP, type PetSettingsController } from './settings.js'

const OPERATIONS = ['status', 'open_pet', 'open_settings', 'set_theme', 'import_theme', 'set_scale', 'set_movement', 'set_summon', 'set_voice', 'create_launcher'] as const

function result(message: string, snapshot: Awaited<ReturnType<PetSettingsController['snapshot']>>) {
  return {
    ok: true,
    message,
    activeTheme: snapshot.config.themeId,
    scale: snapshot.config.scale,
    petAutoStart: snapshot.config.autoLaunch,
    voiceInput: { enabled: snapshot.config.voiceInputEnabled, provider: snapshot.config.voiceProvider, language: snapshot.config.voiceLanguage },
    installedThemes: snapshot.themes.map(({ id, name }) => ({ id, name })),
  }
}

export function registerPetAgentCapabilities(
  ctx: Context,
  runtime: HarnessPetRuntime,
  settings: PetSettingsController,
): void {
  ctx.systemPrompt.section({
    name: 'tool:xy-deepseek-pet',
    order: 145,
    text: 'XY DeepSeek Pet is installed. It provides a desktop pet, replaceable theme/skin artwork, 20%-200% scaling, playful movement, system voice dictation on macOS and Windows, a configurable global shortcut that summons the pet to the pointer, a Desktop pet tab under Harness Settings > Plugins, and an optional desktop shortcut with a replaceable PNG icon. Use xy_pet when the user asks to inspect, open, resize, import, change, summon, or tune the pet/skin/voice input, or explicitly asks to create the desktop shortcut. Movement levels are approximate 0-100 fun levels. Voice input uses the operating system recognizer and never sends audio through the Harness bridge. When the user asks you to find or download a pet skin, you may download a licensed theme ZIP to a local path, report its source and license, then pass that local ZIP to xy_pet import_theme; never execute theme code or bypass validation. Pet appearance belongs to themes; shortcut artwork is configured separately. Optional notification sounds are managed by xy_pet_sounds only when that tool is available. Never request or reveal bridge credentials.',
  })
  ctx.tools.register(defineTool({
    name: 'xy_pet',
    description: 'Inspect or safely configure the installed XY DeepSeek Pet. Import a local theme ZIP selected by the user or downloaded after the user explicitly requested it.',
    parameters: {
      operation: { type: 'string', required: true, enum: OPERATIONS, description: OPERATIONS.join(' | ') },
      theme_id: { type: 'string', description: 'Exact installed theme ID for set_theme.' },
      path: { type: 'string', description: 'Local .zip path supplied by the user or downloaded after the user explicitly requested a skin for import_theme.' },
      scale: { type: 'number', description: 'Pet scale from 0.2 through 2.0 for set_scale.' },
      walking_enabled: { type: 'boolean', description: 'Enable or disable automatic wandering for set_movement.' },
      wander_frequency: { type: 'number', description: 'Approximate 0-100 level from occasional to frequent for set_movement.' },
      wander_distance: { type: 'number', description: 'Approximate 0-100 random movement distance level for set_movement.' },
      mouse_chase_enabled: { type: 'boolean', description: 'Enable or disable playful pointer chasing for set_movement.' },
      mouse_chase_speed: { type: 'number', description: 'Approximate 0-100 chase speed level for set_movement.' },
      fling_enabled: { type: 'boolean', description: 'Enable or disable throw inertia for set_movement.' },
      fling_resistance: { type: 'number', description: 'Approximate 0-100 throw resistance; higher values stop sooner.' },
      summon_enabled: { type: 'boolean', description: 'Enable or disable the global pet summon shortcut for set_summon.' },
      summon_shortcut: { type: 'string', description: 'Electron accelerator such as CommandOrControl+Shift+P for set_summon.' },
      summon_opens_chat: { type: 'boolean', description: 'Open the most recent reply panel after summoning for set_summon.' },
      voice_enabled: { type: 'boolean', description: 'Enable or disable system speech recognition for set_voice.' },
      voice_language: { type: 'string', enum: ['system', 'zh-CN', 'en-US'], description: 'System, Chinese, or English recognition language for set_voice.' },
      double_click_action: { type: 'string', enum: ['none', 'voice', 'openRecentChat', 'openHarness'], description: 'Do nothing, record voice, open the latest session details, or open Harness on double click for set_voice.' },
      long_press_action: { type: 'string', enum: ['none', 'voice', 'openRecentChat', 'openHarness'], description: 'Do nothing, record voice, open the latest session details, or open Harness on long press for set_voice.' },
      launcher_name: { type: 'string', description: 'Desktop shortcut display name for create_launcher; defaults to DeepSeek Harness.' },
      launcher_icon: { type: 'string', enum: ['calm', 'custom'], description: 'Bundled cartoon whale icon or custom PNG for create_launcher.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', required: true },
          message: { type: 'string', required: true },
          activeTheme: { type: 'string', required: true },
          scale: { type: 'number', required: true },
          petAutoStart: { type: 'boolean', required: true },
          voiceInput: {
            type: 'object', required: true, additionalProperties: false,
            properties: {
              enabled: { type: 'boolean', required: true },
              provider: { type: 'string', required: true },
              language: { type: 'string', required: true },
            },
          },
          installedThemes: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.message }],
    },
    async execute(args, exec) {
      let message = 'XY DeepSeek Pet status.'
      if (args.operation === 'open_pet') {
        if (!runtime.openDesktop()) throw new Error('The desktop companion executable is unavailable')
        message = 'XY DeepSeek Pet is open.'
      } else if (args.operation === 'open_settings') {
        runtime.openSettings()
        message = 'Harness Settings > Plugins is open at the Desktop pet tab.'
      } else if (args.operation === 'set_theme') {
        if (!args.theme_id) throw new Error('theme_id is required for set_theme')
        await settings.activateTheme(args.theme_id)
        message = `Pet theme changed to ${args.theme_id}.`
      } else if (args.operation === 'import_theme') {
        if (!args.path) throw new Error('path is required for import_theme')
        const themeId = await runtime.importThemeArchive(args.path, exec.signal)
        await settings.activateTheme(themeId)
        message = `Pet theme ${themeId} was imported and activated.`
      } else if (args.operation === 'set_scale') {
        if (args.scale === undefined || !Number.isFinite(args.scale) || args.scale < PET_SCALE_MIN || args.scale > PET_SCALE_MAX) {
          throw new Error('scale must be between 0.2 and 2.0')
        }
        const next = settings.config
        next.scale = Math.round(args.scale / PET_SCALE_STEP) * PET_SCALE_STEP
        await settings.update(next)
        message = `Pet scale changed to ${Math.round(next.scale * 100)}%.`
      } else if (args.operation === 'set_movement') {
        const levels = [args.wander_frequency, args.wander_distance, args.mouse_chase_speed, args.fling_resistance]
        if (levels.some((value) => value !== undefined && (!Number.isFinite(value) || value < 0 || value > 100))) {
          throw new Error('movement levels must be between 0 and 100')
        }
        if (args.walking_enabled === undefined && args.wander_frequency === undefined && args.wander_distance === undefined
          && args.mouse_chase_enabled === undefined && args.mouse_chase_speed === undefined
          && args.fling_enabled === undefined && args.fling_resistance === undefined) {
          throw new Error('set_movement requires at least one movement setting')
        }
        const next = settings.config
        if (args.walking_enabled !== undefined) next.walkingEnabled = args.walking_enabled
        if (args.wander_frequency !== undefined) next.wanderFrequency = Math.round(args.wander_frequency)
        if (args.wander_distance !== undefined) next.wanderDistance = Math.round(args.wander_distance)
        if (args.mouse_chase_enabled !== undefined) next.mouseChaseEnabled = args.mouse_chase_enabled
        if (args.mouse_chase_speed !== undefined) next.mouseChaseSpeed = Math.round(args.mouse_chase_speed)
        if (args.fling_enabled !== undefined) next.flingEnabled = args.fling_enabled
        if (args.fling_resistance !== undefined) next.flingResistance = Math.round(args.fling_resistance)
        await settings.update(next)
        message = 'Pet movement settings updated.'
      } else if (args.operation === 'set_summon') {
        if (args.summon_enabled === undefined && args.summon_shortcut === undefined && args.summon_opens_chat === undefined) {
          throw new Error('set_summon requires at least one summon setting')
        }
        if (args.summon_shortcut !== undefined && !/^(?:(?:CommandOrControl|Command|Control|Ctrl|Alt|Option|Shift|Super|Meta)\+)+[A-Z0-9]$/.test(args.summon_shortcut)) {
          throw new Error('summon_shortcut must be a valid accelerator such as CommandOrControl+Shift+P')
        }
        const next = settings.config
        if (args.summon_enabled !== undefined) next.teleportShortcutEnabled = args.summon_enabled
        if (args.summon_shortcut !== undefined) next.teleportShortcut = args.summon_shortcut
        if (args.summon_opens_chat !== undefined) next.teleportOpensRecentChat = args.summon_opens_chat
        await settings.update(next)
        message = 'Pet summon shortcut updated.'
      } else if (args.operation === 'set_voice') {
        if (args.voice_enabled === undefined && args.voice_language === undefined && args.double_click_action === undefined && args.long_press_action === undefined) throw new Error('set_voice requires at least one voice setting')
        if (args.voice_language !== undefined && !['system', 'zh-CN', 'en-US'].includes(args.voice_language)) throw new Error('voice_language is invalid')
        const next = settings.config
        if (args.double_click_action === 'none' || args.double_click_action === 'voice' || args.double_click_action === 'openRecentChat' || args.double_click_action === 'openHarness') next.doubleClickAction = args.double_click_action
        if (args.long_press_action === 'none' || args.long_press_action === 'voice' || args.long_press_action === 'openRecentChat' || args.long_press_action === 'openHarness') next.longPressAction = args.long_press_action
        if (args.voice_enabled === false) {
          if (next.doubleClickAction === 'voice') next.doubleClickAction = 'openHarness'
          if (next.longPressAction === 'voice') next.longPressAction = 'openHarness'
        } else if (args.voice_enabled === true && next.doubleClickAction !== 'voice' && next.longPressAction !== 'voice') {
          next.longPressAction = 'voice'
        }
        if (args.voice_language !== undefined) next.voiceLanguage = args.voice_language
        next.voiceProvider = 'system'
        next.voiceInputEnabled = next.doubleClickAction === 'voice' || next.longPressAction === 'voice'
        await settings.update(next)
        message = 'Pet system voice input settings updated.'
      } else if (args.operation === 'create_launcher') {
        const iconId = args.launcher_icon === 'custom' ? 'custom' : 'calm'
        let fileName = ''
        let dataBase64 = ''
        if (iconId === 'custom') {
          if (!args.path) throw new Error('path is required when launcher_icon is custom')
          const info = await stat(args.path)
          if (!info.isFile() || info.size < 24 || info.size > 5 * 1024 * 1024) throw new Error('Custom launcher PNG must be no larger than 5 MiB')
          fileName = basename(args.path)
          dataBase64 = (await readFile(args.path)).toString('base64')
        }
        const created = await runtime.createLauncher(args.launcher_name || 'DeepSeek Harness', iconId, fileName, dataBase64)
        message = `${created.displayName} desktop shortcut was created for ${created.platform}.`
      }
      return result(message, await settings.snapshot())
    },
  }))
}
