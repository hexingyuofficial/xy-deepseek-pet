import { describe, expect, it } from 'vitest'
import { DEFAULT_PET_SETTINGS, resolvePetSettings, resolvePetStats } from './settings.js'

describe('pet settings', () => {
  it('keeps a non-negative persistent treasure count', () => {
    expect(resolvePetStats({ treasuresFound: 7 }).treasuresFound).toBe(7)
    expect(resolvePetStats({ treasuresFound: -1 }).treasuresFound).toBe(0)
  })

  it('follows the system, opens Harness on long press, and keeps auto launch opt-in', () => {
    const settings = resolvePetSettings()
    expect(settings.locale).toBe('system')
    expect(settings.activationGesture).toBe('longPress')
    expect(settings.autoLaunch).toBe(false)
    expect(settings.menuActions).toEqual(['open-client', 'chat', 'settings'])
    expect(settings.wanderFrequency).toBe(70)
    expect(settings.wanderDistance).toBe(35)
    expect(settings.mouseChaseEnabled).toBe(false)
    expect(settings.mouseChaseSpeed).toBe(40)
    expect(settings.flingEnabled).toBe(true)
    expect(settings.flingResistance).toBe(45)
    expect(settings.showOnFullScreen).toBe(true)
    expect(settings.teleportShortcutEnabled).toBe(false)
    expect(settings.teleportShortcut).toBe('CommandOrControl+Shift+P')
    expect(settings.teleportOpensRecentChat).toBe(false)
  })

  it('preserves either supported Harness activation gesture', () => {
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, activationGesture: 'doubleClick' }).activationGesture).toBe('doubleClick')
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, activationGesture: 'longPress' }).activationGesture).toBe('longPress')
  })

  it('allows the pet to be hidden from full-screen Spaces', () => {
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, showOnFullScreen: false }).showOnFullScreen).toBe(false)
  })

  it('keeps pet summoning opt-in and validates the cross-platform accelerator', () => {
    expect(resolvePetSettings({
      ...DEFAULT_PET_SETTINGS,
      teleportShortcutEnabled: true,
      teleportShortcut: 'CommandOrControl+Alt+W',
      teleportOpensRecentChat: true,
    })).toMatchObject({
      teleportShortcutEnabled: true,
      teleportShortcut: 'CommandOrControl+Alt+W',
      teleportOpensRecentChat: true,
    })
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, teleportShortcut: 'bad shortcut!' }).teleportShortcut)
      .toBe(DEFAULT_PET_SETTINGS.teleportShortcut)
  })

  it('keeps namespaced extension menu ids and removes malformed ids', () => {
    const settings = resolvePetSettings({
      ...DEFAULT_PET_SETTINGS,
      menuActions: ['open-client', 'example.open-workspace', '../../shell', 'UPPER'],
    })
    expect(settings.menuActions).toEqual(['open-client', 'example.open-workspace'])
  })

  it('falls back from unsupported scales', () => {
    const settings = resolvePetSettings({
      ...DEFAULT_PET_SETTINGS,
      scale: 3 as never,
    })
    expect(settings.scale).toBe(1)
  })

  it('accepts continuous scale values and snaps them to five-percent steps', () => {
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, scale: 1.37 }).scale).toBe(1.35)
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, scale: 0.2 }).scale).toBe(0.2)
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, scale: 0.19 }).scale).toBe(1)
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, scale: 2.01 }).scale).toBe(1)
  })

  it('clamps movement fun levels and keeps mouse chasing opt-in', () => {
    const settings = resolvePetSettings({
      ...DEFAULT_PET_SETTINGS,
      wanderFrequency: 120,
      wanderDistance: -20,
      mouseChaseEnabled: true,
      mouseChaseSpeed: 62.4,
      flingEnabled: false,
      flingResistance: 140,
    })
    expect(settings.wanderFrequency).toBe(100)
    expect(settings.wanderDistance).toBe(0)
    expect(settings.mouseChaseEnabled).toBe(true)
    expect(settings.mouseChaseSpeed).toBe(62)
    expect(settings.flingEnabled).toBe(false)
    expect(settings.flingResistance).toBe(100)
  })

  it('rejects activation of a theme that is not installed', async () => {
    const { PetSettingsController } = await import('./settings.js')
    const controller = new PetSettingsController('/missing-repository-root')
    await expect(controller.activateTheme('not-installed')).rejects.toThrow('Unknown pet theme')
  })
})
