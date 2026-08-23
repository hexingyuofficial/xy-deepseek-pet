import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { PetChatImage, PetQuestionAnswer, PetSnapshot } from '@xy-deepseek-pet/protocol'
import type { LoadedTheme } from './theme.js'
import type { WindowDock } from './window-layout.js'
import type { BubbleSide } from './bubble-position.js'

export interface RendererPreferences {
  accentColor: string
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
  mouseChaseEnabled: boolean
  scale: number
  doubleClickAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness'
  longPressAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness'
  voiceInputEnabled: boolean
  voiceProvider: 'system'
  voiceLanguage: 'system' | 'zh-CN' | 'en-US'
  locale: 'zh-CN' | 'en'
  menuActions: string[]
  menuExtensions: Array<{ id: string; label: { 'zh-CN': string; en: string }; invoke: 'open-client' | 'chat' | 'tap' | 'settings'; order?: number }>
}

const api = {
  getBootstrap: () => ipcRenderer.invoke('pet:get-bootstrap') as Promise<{
    snapshot: PetSnapshot
    theme: LoadedTheme
    reducedMotion: boolean
    bubbleVisible: boolean
    scale: number
    doubleClickAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness'
    longPressAction: 'none' | 'voice' | 'openRecentChat' | 'openHarness'
    serviceOwned: boolean
    petStageOffset: { x: number; y: number }
    windowDock: WindowDock
    preferences: RendererPreferences
  }>,
  onSnapshot: (listener: (snapshot: PetSnapshot) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, snapshot: PetSnapshot) => listener(snapshot)
    ipcRenderer.on('pet:snapshot', wrapped)
    return () => ipcRenderer.off('pet:snapshot', wrapped)
  },
  onTheme: (listener: (theme: LoadedTheme) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, theme: LoadedTheme) => listener(theme)
    ipcRenderer.on('pet:theme', wrapped)
    return () => ipcRenderer.off('pet:theme', wrapped)
  },
  onPreferences: (listener: (value: RendererPreferences) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, value: RendererPreferences) => listener(value)
    ipcRenderer.on('pet:preferences', wrapped)
    return () => ipcRenderer.off('pet:preferences', wrapped)
  },
  onOpenChat: (listener: () => void) => {
    const wrapped = () => listener()
    ipcRenderer.on('pet:open-chat', wrapped)
    return () => ipcRenderer.off('pet:open-chat', wrapped)
  },
  onComposeFiles: (listener: (paths: string[]) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, paths: string[]) => listener(paths)
    ipcRenderer.on('pet:compose-files', wrapped)
    return () => ipcRenderer.off('pet:compose-files', wrapped)
  },
  onServiceOwned: (listener: (owned: boolean) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, owned: boolean) => listener(owned)
    ipcRenderer.on('pet:service-owned', wrapped)
    return () => ipcRenderer.off('pet:service-owned', wrapped)
  },
  onWindowDock: (listener: (dock: WindowDock) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, dock: WindowDock) => listener(dock)
    ipcRenderer.on('pet:window-dock', wrapped)
    return () => ipcRenderer.off('pet:window-dock', wrapped)
  },
  onPetStageOffset: (listener: (offset: { x: number; y: number }) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, offset: { x: number; y: number }) => listener(offset)
    ipcRenderer.on('pet:stage-offset', wrapped)
    return () => ipcRenderer.off('pet:stage-offset', wrapped)
  },
  beginDrag: () => ipcRenderer.send('pet:drag-begin'),
  dragTo: () => ipcRenderer.send('pet:drag-move'),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  setChasePaused: (paused: boolean) => ipcRenderer.send('pet:chase-paused', paused),
  setIgnoreMouseEvents: (ignored: boolean) => ipcRenderer.send('pet:set-ignore-mouse-events', ignored),
  setTextInputActive: (active: boolean) => ipcRenderer.send('pet:text-input-active', active),
  activateForInput: () => ipcRenderer.invoke('pet:activate-for-input'),
  submitChat: (text: string, sessionId?: string, images?: PetChatImage[]) => ipcRenderer.invoke('pet:chat', text, sessionId, images) as Promise<{ ok: boolean; error?: string }>,
  pathForFile: (file: File) => webUtils.getPathForFile(file),
  decideApproval: (sessionId: string, requestId: string, outcome: 'allowed-once' | 'rejected') =>
    ipcRenderer.invoke('pet:approval-decision', sessionId, requestId, outcome) as Promise<{ ok: boolean; error?: string }>,
  answerQuestion: (sessionId: string, requestId: string, answers: PetQuestionAnswer[]) =>
    ipcRenderer.invoke('pet:question-answer', sessionId, requestId, answers) as Promise<{ ok: boolean; error?: string }>,
  acknowledge: (sessionId: string) => ipcRenderer.invoke('pet:acknowledge', sessionId),
  openClient: (sessionId?: string) => ipcRenderer.invoke('pet:open-client', sessionId),
  openSettings: () => ipcRenderer.invoke('pet:open-settings'),
  reconnect: () => ipcRenderer.invoke('pet:reconnect') as Promise<{ ok: boolean; error?: string }>,
  setScale: (scale: number) => ipcRenderer.invoke('pet:set-scale', scale),
  setMouseChaseEnabled: (enabled: boolean) => ipcRenderer.invoke('pet:set-mouse-chase-enabled', enabled),
  quit: () => ipcRenderer.invoke('pet:quit'),
  stopService: () => ipcRenderer.invoke('pet:stop-service'),
  setBubbleVisible: (visible: boolean) => ipcRenderer.invoke('pet:set-bubble-visible', visible),
  setBubbleSide: (side: BubbleSide) => ipcRenderer.invoke('pet:set-bubble-side', side),
  recordInteraction: () => ipcRenderer.invoke('pet:record-interaction'),
  recordTreasureFound: () => ipcRenderer.invoke('pet:record-treasure-found'),
  transcribeVoice: (wav: ArrayBuffer, diagnostic?: {
    label?: string | undefined
    muted?: boolean | undefined
    enabled?: boolean | undefined
    readyState?: string | undefined
    sampleRate?: number | undefined
    channelCount?: number | undefined
    autoGainControl?: boolean | undefined
    echoCancellation?: boolean | undefined
    noiseSuppression?: boolean | undefined
  }) => ipcRenderer.invoke('pet:transcribe-voice', wav, diagnostic) as Promise<{ ok: boolean; text?: string; code?: 'noSpeech' | 'unavailable'; detail?: string }>,
  showVoiceNotice: (code: 'microphone' | 'ready' | 'unavailable' | 'session', detail?: string) => ipcRenderer.invoke('pet:voice-notice', code, detail),
}

contextBridge.exposeInMainWorld('harnessPet', api)

export type HarnessPetRendererApi = typeof api
