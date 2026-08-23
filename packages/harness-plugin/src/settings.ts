import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { DEFAULT_PET_ACCENT_COLOR } from '@xy-deepseek-pet/protocol'
import type { PetMenuContribution, PetMenuRegistry } from './menu-registry.js'

export const PET_SCALES = [0.2, 0.4, 0.75, 1, 1.25, 1.5, 2] as const
export const PET_SCALE_MIN = 0.2
export const PET_SCALE_MAX = 2
export const PET_SCALE_STEP = 0.05
export const PET_MENU_ACTIONS = ['open-client', 'chat', 'settings'] as const
export const PET_INTERACTION_ACTIONS = ['none', 'voice', 'openRecentChat', 'openHarness'] as const
export type PetInteractionAction = (typeof PET_INTERACTION_ACTIONS)[number]

export interface PetSettings {
  themeId: string
  accentColor: string
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
  wanderFrequency: number
  wanderDistance: number
  mouseChaseEnabled: boolean
  mouseChaseSpeed: number
  flingEnabled: boolean
  flingResistance: number
  showOnFullScreen: boolean
  teleportShortcutEnabled: boolean
  teleportShortcut: string
  teleportOpensRecentChat: boolean
  scale: number
  doubleClickAction: PetInteractionAction
  longPressAction: PetInteractionAction
  voiceInputEnabled: boolean
  voiceProvider: 'system'
  voiceLanguage: 'system' | 'zh-CN' | 'en-US'
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
  stats: PetStats
  themes: PetThemeView[]
  menuExtensions: PetMenuContribution[]
}

export interface PetStats {
  treasuresFound: number
}

const DEFAULT_PET_STATS: PetStats = { treasuresFound: 0 }

export const DEFAULT_PET_SETTINGS: PetSettings = {
  themeId: 'whale-default',
  accentColor: DEFAULT_PET_ACCENT_COLOR,
  reducedMotion: false,
  bubbleVisible: true,
  walkingEnabled: true,
  wanderFrequency: 70,
  wanderDistance: 35,
  mouseChaseEnabled: false,
  mouseChaseSpeed: 40,
  flingEnabled: true,
  flingResistance: 45,
  showOnFullScreen: true,
  teleportShortcutEnabled: false,
  teleportShortcut: 'CommandOrControl+Shift+P',
  teleportOpensRecentChat: false,
  scale: 1,
  doubleClickAction: 'openHarness',
  longPressAction: 'voice',
  voiceInputEnabled: true,
  voiceProvider: 'system',
  voiceLanguage: 'system',
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

export function petStatsPath(): string {
  return join(petRuntimeRoot(), 'pet-stats.json')
}

export function resolvePetStats(input: Partial<PetStats> = {}): PetStats {
  return {
    treasuresFound: typeof input.treasuresFound === 'number' && Number.isSafeInteger(input.treasuresFound) && input.treasuresFound >= 0
      ? input.treasuresFound
      : 0,
  }
}

export function resolvePetSettings(input: Partial<PetSettings> = {}): PetSettings {
  const scale = typeof input.scale === 'number' && Number.isFinite(input.scale) && input.scale >= PET_SCALE_MIN && input.scale <= PET_SCALE_MAX
    ? Math.round(input.scale / PET_SCALE_STEP) * PET_SCALE_STEP
    : DEFAULT_PET_SETTINGS.scale
  const menuActions = Array.isArray(input.menuActions)
    ? [...new Set(input.menuActions.filter((value): value is string => typeof value === 'string' && /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value) && value.length <= 96))]
    : [...DEFAULT_PET_SETTINGS.menuActions]
  const movementLevel = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.min(100, Math.max(0, value)))
    : fallback
  const legacy = input as Partial<PetSettings> & { activationGesture?: 'doubleClick' | 'longPress' }
  const action = (value: unknown): value is PetInteractionAction => PET_INTERACTION_ACTIONS.includes(value as PetInteractionAction)
  const doubleClickAction = action(input.doubleClickAction) ? input.doubleClickAction : DEFAULT_PET_SETTINGS.doubleClickAction
  const longPressAction = action(input.longPressAction)
    ? input.longPressAction
    : legacy.voiceInputEnabled === false && legacy.activationGesture === 'longPress'
      ? 'openHarness'
      : DEFAULT_PET_SETTINGS.longPressAction
  return {
    themeId: typeof input.themeId === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.themeId) ? input.themeId : DEFAULT_PET_SETTINGS.themeId,
    accentColor: typeof input.accentColor === 'string' && /^#[0-9a-f]{6}$/i.test(input.accentColor) ? input.accentColor.toLowerCase() : DEFAULT_PET_SETTINGS.accentColor,
    reducedMotion: input.reducedMotion === true,
    bubbleVisible: input.bubbleVisible !== false,
    walkingEnabled: input.walkingEnabled !== false,
    wanderFrequency: movementLevel(input.wanderFrequency, DEFAULT_PET_SETTINGS.wanderFrequency),
    wanderDistance: movementLevel(input.wanderDistance, DEFAULT_PET_SETTINGS.wanderDistance),
    mouseChaseEnabled: input.mouseChaseEnabled === true,
    mouseChaseSpeed: movementLevel(input.mouseChaseSpeed, DEFAULT_PET_SETTINGS.mouseChaseSpeed),
    flingEnabled: input.flingEnabled !== false,
    flingResistance: movementLevel(input.flingResistance, DEFAULT_PET_SETTINGS.flingResistance),
    showOnFullScreen: input.showOnFullScreen !== false,
    teleportShortcutEnabled: input.teleportShortcutEnabled === true,
    teleportShortcut: typeof input.teleportShortcut === 'string' && /^(?:(?:CommandOrControl|Command|Control|Ctrl|Alt|Option|Shift|Super|Meta)\+)+[A-Z0-9]$/.test(input.teleportShortcut)
      ? input.teleportShortcut
      : DEFAULT_PET_SETTINGS.teleportShortcut,
    teleportOpensRecentChat: input.teleportOpensRecentChat === true,
    scale,
    doubleClickAction,
    longPressAction,
    voiceInputEnabled: doubleClickAction === 'voice' || longPressAction === 'voice',
    voiceProvider: 'system',
    voiceLanguage: input.voiceLanguage === 'zh-CN' || input.voiceLanguage === 'en-US' ? input.voiceLanguage : 'system',
    locale: 'system',
    autoLaunch: input.autoLaunch === true,
    menuActions,
    ...(input.position && Number.isFinite(input.position.x) && Number.isFinite(input.position.y) ? { position: input.position } : {}),
  }
}

export class PetSettingsController {
  private current: PetSettings = structuredClone(DEFAULT_PET_SETTINGS)
  private stats: PetStats = structuredClone(DEFAULT_PET_STATS)
  private readonly settingsPath = petSettingsPath()
  private readonly statsPath = petStatsPath()
  private statsWrite = Promise.resolve()

  constructor(private readonly repositoryRoot?: string, private readonly menuRegistry?: PetMenuRegistry) {}

  async initialize(): Promise<void> {
    await mkdir(petRuntimeRoot(), { recursive: true, mode: 0o700 })
    try {
      this.current = resolvePetSettings(JSON.parse(await readFile(this.settingsPath, 'utf8')) as Partial<PetSettings>)
    } catch {
      this.current = structuredClone(DEFAULT_PET_SETTINGS)
    }
    try {
      this.stats = resolvePetStats(JSON.parse(await readFile(this.statsPath, 'utf8')) as Partial<PetStats>)
    } catch {
      this.stats = structuredClone(DEFAULT_PET_STATS)
    }
    await this.persist()
    await this.persistStats()
  }

  get config(): PetSettings { return structuredClone(this.current) }

  async snapshot(): Promise<PetSettingsSnapshot> {
    return {
      config: this.config,
      stats: structuredClone(this.stats),
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
    return { config: this.config, stats: structuredClone(this.stats), themes, menuExtensions: this.menuRegistry?.list() ?? [] }
  }

  async recordTreasureFound(): Promise<void> {
    this.stats.treasuresFound += 1
    this.statsWrite = this.statsWrite.catch(() => undefined).then(() => this.persistStats())
    await this.statsWrite
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

  private async persistStats(): Promise<void> {
    const staging = `${this.statsPath}.partial-${process.pid}`
    await writeFile(staging, `${JSON.stringify(this.stats, null, 2)}\n`, { mode: 0o600 })
    await rename(staging, this.statsPath)
  }
}

export function repositoryRootFromDesktopEntry(entry?: string): string | undefined {
  return entry ? resolve(dirname(entry), '../../..') : undefined
}
