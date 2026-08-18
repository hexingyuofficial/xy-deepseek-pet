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
    config: { themeId: 'whale-default', scale: 1, autoLaunch: false },
    themes: [{ id: 'whale-default', name: 'Whale' }],
    menuExtensions: [],
  }
  const settings = {
    config: structuredClone(snapshot.config),
    snapshot: vi.fn(async () => structuredClone(snapshot)),
    activateTheme: vi.fn(async () => structuredClone(snapshot)),
    update: vi.fn(async () => structuredClone(snapshot)),
  }
  const runtime = { openDesktop: vi.fn(() => true), openClient: vi.fn(), importThemeArchive: vi.fn() }
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
})
