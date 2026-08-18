import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { readFile, stat } from 'node:fs/promises'
import { basename } from 'node:path'
import type { HarnessPetRuntime } from './index.js'
import { PET_SCALE_MAX, PET_SCALE_MIN, PET_SCALE_STEP, type PetSettingsController } from './settings.js'

const OPERATIONS = ['status', 'open_pet', 'open_settings', 'set_theme', 'import_theme', 'set_scale', 'create_launcher'] as const

function result(message: string, snapshot: Awaited<ReturnType<PetSettingsController['snapshot']>>) {
  return {
    ok: true,
    message,
    activeTheme: snapshot.config.themeId,
    scale: snapshot.config.scale,
    petAutoStart: snapshot.config.autoLaunch,
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
    text: 'XY DeepSeek Pet is installed. It provides a desktop pet, replaceable theme/skin artwork, 40%-200% scaling, Harness General settings, and an optional desktop shortcut with a replaceable PNG icon. Use xy_pet when the user asks to inspect, open, resize, import, or change the pet/skin, or explicitly asks to create the desktop shortcut. When the user asks you to find or download a pet skin, you may download a licensed theme ZIP to a local path, report its source and license, then pass that local ZIP to xy_pet import_theme; never execute theme code or bypass validation. Pet appearance belongs to themes; shortcut artwork is configured separately. Optional notification sounds are managed by xy_pet_sounds only when that tool is available. Never request or reveal bridge credentials.',
  })
  ctx.tools.register(defineTool({
    name: 'xy_pet',
    description: 'Inspect or safely configure the installed XY DeepSeek Pet. Import a local theme ZIP selected by the user or downloaded after the user explicitly requested it.',
    parameters: {
      operation: { type: 'string', required: true, enum: OPERATIONS, description: OPERATIONS.join(' | ') },
      theme_id: { type: 'string', description: 'Exact installed theme ID for set_theme.' },
      path: { type: 'string', description: 'Local .zip path supplied by the user or downloaded after the user explicitly requested a skin for import_theme.' },
      scale: { type: 'number', description: 'Pet scale from 0.4 through 2.0 for set_scale.' },
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
        runtime.openClient()
        message = 'Harness settings are open. The Pet group is under General settings.'
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
          throw new Error('scale must be between 0.4 and 2.0')
        }
        const next = settings.config
        next.scale = Math.round(args.scale / PET_SCALE_STEP) * PET_SCALE_STEP
        await settings.update(next)
        message = `Pet scale changed to ${Math.round(next.scale * 100)}%.`
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
        const created = runtime.createLauncher(args.launcher_name || 'DeepSeek Harness', iconId, fileName, dataBase64)
        message = `${created.displayName} desktop shortcut was created for ${created.platform}.`
      }
      return result(message, await settings.snapshot())
    },
  }))
}
