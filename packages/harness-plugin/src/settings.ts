import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import type { PetMenuContribution, PetMenuRegistry } from './menu-registry.js'

export const PET_SCALES = [0.4, 0.75, 1, 1.25, 1.5, 2] as const
export const PET_SCALE_MIN = 0.4
export const PET_SCALE_MAX = 2
export const PET_SCALE_STEP = 0.05
export const PET_MENU_ACTIONS = ['open-client', 'chat', 'settings'] as const

export interface PetSettings {
  themeId: string
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
  scale: number
  activationGesture: 'doubleClick' | 'longPress'
  locale: 'system' | 'zh-CN' | 'en'
  autoLaunch: boolean
  menuActions: string[]
  position?: { x: number; y: number }
}

export interface PetThemeView {
  id: string
  name: string
  license: string
  author?: string
}

export interface PetSettingsSnapshot {
  config: PetSettings
  themes: PetThemeView[]
  menuExtensions: PetMenuContribution[]
}

export const DEFAULT_PET_SETTINGS: PetSettings = {
  themeId: 'whale-default',
  reducedMotion: false,
  bubbleVisible: true,
  walkingEnabled: true,
  scale: 1,
  activationGesture: 'longPress',
  locale: 'system',
  autoLaunch: false,
  menuActions: [...PET_MENU_ACTIONS],
}

export function petRuntimeRoot(): string {
  return join(homedir(), '.xy-deepseek-pet')
}

export function petSettingsPath(): string {
  return join(petRuntimeRoot(), 'pet-settings.json')
}

export function resolvePetSettings(input: Partial<PetSettings> = {}): PetSettings {
  const scale = typeof input.scale === 'number' && Number.isFinite(input.scale) && input.scale >= PET_SCALE_MIN && input.scale <= PET_SCALE_MAX
    ? Math.round(input.scale / PET_SCALE_STEP) * PET_SCALE_STEP
    : DEFAULT_PET_SETTINGS.scale
  const menuActions = Array.isArray(input.menuActions)
    ? [...new Set(input.menuActions.filter((value): value is string => typeof value === 'string' && /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value) && value.length <= 96))]
    : [...DEFAULT_PET_SETTINGS.menuActions]
  return {
    themeId: typeof input.themeId === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.themeId) ? input.themeId : DEFAULT_PET_SETTINGS.themeId,
    reducedMotion: input.reducedMotion === true,
    bubbleVisible: input.bubbleVisible !== false,
    walkingEnabled: input.walkingEnabled !== false,
    scale,
    activationGesture: input.activationGesture === 'doubleClick' || input.activationGesture === 'longPress'
      ? input.activationGesture
      : DEFAULT_PET_SETTINGS.activationGesture,
    locale: 'system',
    autoLaunch: input.autoLaunch === true,
    menuActions,
    ...(input.position && Number.isFinite(input.position.x) && Number.isFinite(input.position.y) ? { position: input.position } : {}),
  }
}

export class PetSettingsController {
  private current: PetSettings = structuredClone(DEFAULT_PET_SETTINGS)
  private readonly settingsPath = petSettingsPath()

  constructor(private readonly repositoryRoot?: string, private readonly menuRegistry?: PetMenuRegistry) {}

  async initialize(): Promise<void> {
    await mkdir(petRuntimeRoot(), { recursive: true, mode: 0o700 })
    try {
      this.current = resolvePetSettings(JSON.parse(await readFile(this.settingsPath, 'utf8')) as Partial<PetSettings>)
    } catch {
      this.current = structuredClone(DEFAULT_PET_SETTINGS)
    }
    await this.persist()
  }

  get config(): PetSettings { return structuredClone(this.current) }

  async snapshot(): Promise<PetSettingsSnapshot> {
    return {
      config: this.config,
      themes: await this.listThemes(),
      menuExtensions: this.menuRegistry?.list() ?? [],
    }
  }

  async update(input: PetSettings): Promise<PetSettingsSnapshot> {
    this.current = resolvePetSettings(input)
    await this.persist()
    return this.snapshot()
  }

  async activateTheme(themeId: string): Promise<PetSettingsSnapshot> {
    const themes = await this.listThemes()
    if (!themes.some((theme) => theme.id === themeId)) throw new Error(`Unknown pet theme: ${themeId}`)
    this.current.themeId = themeId
    await this.persist()
    return { config: this.config, themes, menuExtensions: this.menuRegistry?.list() ?? [] }
  }

  async listThemes(): Promise<PetThemeView[]> {
    const roots = [
      ...(this.repositoryRoot ? [join(this.repositoryRoot, 'themes')] : []),
      process.platform === 'darwin'
        ? join(homedir(), 'Library', 'Application Support', 'XY DeepSeek Pet', 'themes')
        : join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'XY DeepSeek Pet', 'themes'),
    ]
    const themes = new Map<string, PetThemeView>()
    for (const root of roots) {
      try {
        for (const entry of await readdir(root, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue
          try {
            const manifest = JSON.parse(await readFile(join(root, entry.name, 'theme.json'), 'utf8')) as Record<string, unknown>
            if (typeof manifest.id !== 'string' || typeof manifest.name !== 'string' || typeof manifest.license !== 'string') continue
            themes.set(manifest.id, {
              id: manifest.id,
              name: manifest.name,
              license: manifest.license,
              ...(typeof manifest.author === 'string' ? { author: manifest.author } : {}),
            })
          } catch { /* Invalid themes stay hidden. */ }
        }
      } catch { /* Missing roots are normal. */ }
    }
    return [...themes.values()].sort((a, b) => a.name.localeCompare(b.name))
  }

  private async persist(): Promise<void> {
    const staging = `${this.settingsPath}.partial-${process.pid}`
    await writeFile(staging, `${JSON.stringify(this.current, null, 2)}\n`, { mode: 0o600 })
    await rename(staging, this.settingsPath)
  }
}

export function repositoryRootFromDesktopEntry(entry?: string): string | undefined {
  return entry ? resolve(dirname(entry), '../../..') : undefined
}
