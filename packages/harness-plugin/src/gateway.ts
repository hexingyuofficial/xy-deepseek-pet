import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { PetSettings, PetSettingsController, PetSettingsSnapshot } from './settings.js'

export interface PetRuntimeControls {
  openDesktop(): boolean
  desktopStatus(): boolean
  closeDesktop(): boolean
  importTheme(fileName: string, dataBase64: string): Promise<string>
  createLauncher(name: string, iconId: 'calm' | 'custom', fileName: string, dataBase64: string): Promise<{ displayName: string; platform: 'macOS' | 'Windows' }>
}

export class PetSettingsGateway extends TypertRemoteService {
  constructor(ctx: Context, private readonly controller: PetSettingsController, private readonly runtime: PetRuntimeControls) {
    super(ctx, 'xyPet')
  }

  @Remote snapshot(): Promise<PetSettingsSnapshot> { return this.controller.snapshot() }
  @Remote update(config: PetSettings): Promise<PetSettingsSnapshot> { return this.controller.update(config) }
  @Remote async importTheme(fileName: string, dataBase64: string): Promise<PetSettingsSnapshot> {
    const themeId = await this.runtime.importTheme(fileName, dataBase64)
    return this.controller.activateTheme(themeId)
  }
  @Remote openDesktop(): boolean { return this.runtime.openDesktop() }
  @Remote desktopStatus(): boolean { return this.runtime.desktopStatus() }
  @Remote closeDesktop(): boolean { return this.runtime.closeDesktop() }
  @Remote createLauncher(name: string, iconId: 'calm' | 'custom', fileName: string, dataBase64: string): Promise<{ displayName: string; platform: 'macOS' | 'Windows' }> {
    return this.runtime.createLauncher(name, iconId, fileName, dataBase64)
  }
}
