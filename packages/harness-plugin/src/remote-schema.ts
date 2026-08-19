import { z } from 'zod'

const scale = z.number().min(0.2).max(2)
const action = z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/).max(96)
const movementLevel = z.number().int().min(0).max(100)
const settings = z.object({
  themeId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(64),
  reducedMotion: z.boolean(), bubbleVisible: z.boolean(), walkingEnabled: z.boolean(),
  wanderFrequency: movementLevel, wanderDistance: movementLevel, mouseChaseEnabled: z.boolean(), mouseChaseSpeed: movementLevel,
  flingEnabled: z.boolean(), flingResistance: movementLevel,
  showOnFullScreen: z.boolean(),
  teleportShortcutEnabled: z.boolean(),
  teleportShortcut: z.string().regex(/^(?:(?:CommandOrControl|Command|Control|Ctrl|Alt|Option|Shift|Super|Meta)\+)+[A-Z0-9]$/),
  teleportOpensRecentChat: z.boolean(),
  scale,
  activationGesture: z.enum(['doubleClick', 'longPress']), locale: z.enum(['system', 'zh-CN', 'en']), autoLaunch: z.boolean(),
  menuActions: z.array(action).max(6),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
})
const theme = z.object({ id: z.string(), name: z.string(), license: z.string(), author: z.string().optional() })
const stats = z.object({ treasuresFound: z.number().int().min(0) })
const menuExtension = z.object({ id: action, label: z.object({ 'zh-CN': z.string(), en: z.string() }), invoke: z.enum(['open-client', 'chat', 'tap', 'settings']), order: z.number().optional() })
const launcherResult = z.object({ displayName: z.string().min(1).max(48), platform: z.enum(['macOS', 'Windows']) })
const snapshot = z.object({ config: settings, stats, themes: z.array(theme), menuExtensions: z.array(menuExtension) })
const strict = (typeSymbol: string, schema: z.ZodType) => ({ mode: 'strict' as const, typeSymbol, schema })

export const PET_REMOTE_DESCRIPTORS = [
  { id: 'xy-deepseek-pet#xyPet/snapshot', service: 'xyPet', namespace: 'xyPet', method: 'snapshot', invocation: { kind: 'direct' as const }, parameters: [], result: strict('xy-deepseek-pet#PetSettingsSnapshot', snapshot) },
  { id: 'xy-deepseek-pet#xyPet/update', service: 'xyPet', namespace: 'xyPet', method: 'update', invocation: { kind: 'direct' as const }, parameters: [{ name: 'config', wire: 'config', source: 'json' as const, codec: strict('xy-deepseek-pet#PetSettings', settings) }], result: strict('xy-deepseek-pet#PetSettingsSnapshot', snapshot) },
  { id: 'xy-deepseek-pet#xyPet/importTheme', service: 'xyPet', namespace: 'xyPet', method: 'importTheme', invocation: { kind: 'direct' as const }, parameters: [
    { name: 'fileName', wire: 'fileName', source: 'json' as const, codec: strict('xy-deepseek-pet#import:fileName', z.string().min(1).max(255)) },
    { name: 'dataBase64', wire: 'dataBase64', source: 'json' as const, codec: strict('xy-deepseek-pet#import:data', z.string().min(1).max(28_000_000)) },
  ], result: strict('xy-deepseek-pet#PetSettingsSnapshot', snapshot) },
  { id: 'xy-deepseek-pet#xyPet/openDesktop', service: 'xyPet', namespace: 'xyPet', method: 'openDesktop', invocation: { kind: 'direct' as const }, parameters: [], result: strict('xy-deepseek-pet#openDesktop:result', z.boolean()) },
  { id: 'xy-deepseek-pet#xyPet/desktopStatus', service: 'xyPet', namespace: 'xyPet', method: 'desktopStatus', invocation: { kind: 'direct' as const }, parameters: [], result: strict('xy-deepseek-pet#desktopStatus:result', z.boolean()) },
  { id: 'xy-deepseek-pet#xyPet/closeDesktop', service: 'xyPet', namespace: 'xyPet', method: 'closeDesktop', invocation: { kind: 'direct' as const }, parameters: [], result: strict('xy-deepseek-pet#closeDesktop:result', z.boolean()) },
  { id: 'xy-deepseek-pet#xyPet/createLauncher', service: 'xyPet', namespace: 'xyPet', method: 'createLauncher', invocation: { kind: 'direct' as const }, parameters: [
    { name: 'name', wire: 'name', source: 'json' as const, codec: strict('xy-deepseek-pet#launcher:name', z.string().min(1).max(48)) },
    { name: 'iconId', wire: 'iconId', source: 'json' as const, codec: strict('xy-deepseek-pet#launcher:iconId', z.enum(['calm', 'custom'])) },
    { name: 'fileName', wire: 'fileName', source: 'json' as const, codec: strict('xy-deepseek-pet#launcher:fileName', z.string().max(255)) },
    { name: 'dataBase64', wire: 'dataBase64', source: 'json' as const, codec: strict('xy-deepseek-pet#launcher:data', z.string().max(7_000_000)) },
  ], result: strict('xy-deepseek-pet#launcher:result', launcherResult) },
] as const
