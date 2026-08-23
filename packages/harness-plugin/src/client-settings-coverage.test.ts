import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PET_SETTINGS, type PetSettings } from './settings.js'

const runtimeManagedSettings = new Set<keyof PetSettings>([
  'locale',
  'position',
  'voiceProvider',
])

describe('pet settings UI coverage', () => {
  const clientSource = readFileSync(fileURLToPath(new URL('./client.ts', import.meta.url)), 'utf8')

  it('keeps every user-configurable setting connected to the settings view', () => {
    const visibleSettings = (Object.keys(DEFAULT_PET_SETTINGS) as Array<keyof PetSettings>)
      .filter((key) => !runtimeManagedSettings.has(key))

    for (const key of visibleSettings) {
      expect(clientSource, `${key} needs a settings control`).toContain(`draft.${key}`)
      expect(clientSource, `${key} needs a settings update path`).toContain(`next.${key}`)
    }
  })

  it('keeps non-setting capabilities reachable after layout changes', () => {
    for (const integration of [
      'remote.importTheme',
      'remote.createLauncher',
      'remote.createFinderQuickAction',
      'snapshot.menuExtensions',
      'React.createElement(SoundSettings',
    ]) expect(clientSource).toContain(integration)
  })

  it('shows file-action success beside the install control and names Windows Explorer separately', () => {
    expect(clientSource).toContain('fileActionFeedback?.ok ? `✓ ${c.installedFinderAction}`')
    expect(clientSource).toContain('fileActionFeedback && React.createElement')
    expect(clientSource).toContain('c.explorerAction')
    expect(clientSource).toContain('c.explorerActionHint')
  })

  it('mounts the pet as a Plugins tab and deep-links directly to it', () => {
    expect(clientSource).toContain("scope.slots.inject('settings.plugins.tab'")
    expect(clientSource).toContain("name: 'settings.plugins.tab', id: 'xy-deepseek-pet'")
    expect(clientSource).not.toContain("scope.slots.inject('settings.general.item'")
    expect(clientSource).toContain('[role="tab"][id$="-tab-xy-deepseek-pet"]')
    expect(clientSource).toContain("new Set(['插件', 'Plugins'])")
  })

  it('captures gesture selections before entering the deferred settings updater', () => {
    expect(clientSource).toContain('const action = event.currentTarget.value as PetSettings[typeof key]')
    expect(clientSource).toContain('next[key] = action')
    expect(clientSource).not.toContain('next[key] = event.currentTarget.value')
  })

  it('offers a one-click reset to the shared default accent color', () => {
    expect(clientSource).toContain('resetThemeColor')
    expect(clientSource).toContain('next.accentColor = DEFAULT_PET_ACCENT_COLOR')
  })
})
