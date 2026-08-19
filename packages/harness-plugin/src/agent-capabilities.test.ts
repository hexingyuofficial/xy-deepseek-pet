import { describe, expect, it, vi } from 'vitest'
import { registerPetAgentCapabilities } from './agent-capabilities.js'

function fixture() {
  const sections: Array<{ name: string; text: string }> = []
  const definitions: any[] = []
  const ctx = {
    systemPrompt: { section: vi.fn((section) => { sections.push(section); return () => undefined }) },
    tools: { register: vi.fn((definition) => { definitions.push(definition); return () => undefined }) },
  }
  const snapshot = {
    config: {
      themeId: 'whale-default', scale: 1, autoLaunch: false, walkingEnabled: true,
      wanderFrequency: 70, wanderDistance: 35, mouseChaseEnabled: false, mouseChaseSpeed: 40,
      flingEnabled: true, flingResistance: 45,
      showOnFullScreen: true,
    },
    themes: [{ id: 'whale-default', name: 'Whale' }],
    menuExtensions: [],
  }
  const settings = {
    config: structuredClone(snapshot.config),
    snapshot: vi.fn(async () => structuredClone(snapshot)),
    activateTheme: vi.fn(async () => structuredClone(snapshot)),
    update: vi.fn(async () => structuredClone(snapshot)),
  }
  const runtime = { openDesktop: vi.fn(() => true), openSettings: vi.fn(), importThemeArchive: vi.fn() }
  registerPetAgentCapabilities(ctx as never, runtime as never, settings as never)
  return { sections, definitions, settings, runtime }
}

describe('Harness agent pet capability', () => {
  it('registers concise guidance and a model-facing tool without secrets', async () => {
    const { sections, definitions } = fixture()
    const section = sections.at(0)
    const definition = definitions.at(0)
    expect(section?.name).toBe('tool:xy-deepseek-pet')
    expect(section?.text).toContain('xy_pet')
    expect(section?.text).toContain('download a licensed theme ZIP')
    expect(definition?.name).toBe('xy_pet')
    const value = await definition.execute({ operation: 'status' }, { signal: new AbortController().signal })
    expect(value.installedThemes).toEqual([{ id: 'whale-default', name: 'Whale' }])
    expect(JSON.stringify(value)).not.toMatch(/token|bridge\.json|session/i)
  })

  it('routes an installed theme selection through the settings controller', async () => {
    const { definitions, settings } = fixture()
    await definitions[0].execute({ operation: 'set_theme', theme_id: 'whale-default' }, { signal: new AbortController().signal })
    expect(settings.activateTheme).toHaveBeenCalledWith('whale-default')
  })

  it('opens the dedicated pet settings deep link', async () => {
    const { definitions, runtime } = fixture()
    await definitions[0].execute({ operation: 'open_settings' }, { signal: new AbortController().signal })
    expect(runtime.openSettings).toHaveBeenCalledOnce()
  })

  it('updates playful movement settings through the model-facing tool', async () => {
    const { definitions, settings } = fixture()
    await definitions[0].execute({
      operation: 'set_movement',
      walking_enabled: true,
      wander_frequency: 25,
      wander_distance: 60,
      mouse_chase_enabled: true,
      mouse_chase_speed: 80,
      fling_enabled: false,
      fling_resistance: 75,
    }, { signal: new AbortController().signal })
    expect(settings.update).toHaveBeenCalledWith(expect.objectContaining({
      walkingEnabled: true,
      wanderFrequency: 25,
      wanderDistance: 60,
      mouseChaseEnabled: true,
      mouseChaseSpeed: 80,
      flingEnabled: false,
      flingResistance: 75,
    }))
  })

  it('configures the cross-platform summon shortcut through the model-facing tool', async () => {
    const { definitions, settings } = fixture()
    await definitions[0].execute({
      operation: 'set_summon',
      summon_enabled: true,
      summon_shortcut: 'CommandOrControl+Shift+W',
      summon_opens_chat: true,
    }, { signal: new AbortController().signal })
    expect(settings.update).toHaveBeenCalledWith(expect.objectContaining({
      teleportShortcutEnabled: true,
      teleportShortcut: 'CommandOrControl+Shift+W',
      teleportOpensRecentChat: true,
    }))
  })
})
