import { describe, expect, it } from 'vitest'
import { DEFAULT_PET_SETTINGS, resolvePetSettings } from './settings.js'

describe('pet settings', () => {
  it('follows the system, opens Harness on long press, and keeps auto launch opt-in', () => {
    const settings = resolvePetSettings()
    expect(settings.locale).toBe('system')
    expect(settings.activationGesture).toBe('longPress')
    expect(settings.autoLaunch).toBe(false)
    expect(settings.menuActions).toEqual(['open-client', 'chat', 'settings'])
  })

  it('preserves either supported Harness activation gesture', () => {
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, activationGesture: 'doubleClick' }).activationGesture).toBe('doubleClick')
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, activationGesture: 'longPress' }).activationGesture).toBe('longPress')
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
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, scale: 0.4 }).scale).toBe(0.4)
    expect(resolvePetSettings({ ...DEFAULT_PET_SETTINGS, scale: 2.01 }).scale).toBe(1)
  })

  it('rejects activation of a theme that is not installed', async () => {
    const { PetSettingsController } = await import('./settings.js')
    const controller = new PetSettingsController('/missing-repository-root')
    await expect(controller.activateTheme('not-installed')).rejects.toThrow('Unknown pet theme')
  })
})
