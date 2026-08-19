import { contextBridge, ipcRenderer } from 'electron'
import type { PetQuestionAnswer, PetSnapshot } from '@xy-deepseek-pet/protocol'
import type { LoadedTheme } from './theme.js'
import type { WindowDock } from './window-layout.js'

export interface RendererPreferences {
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
  mouseChaseEnabled: boolean
  scale: number
  activationGesture: 'doubleClick' | 'longPress'
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
    activationGesture: 'doubleClick' | 'longPress'
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
  submitChat: (text: string, sessionId?: string) => ipcRenderer.invoke('pet:chat', text, sessionId) as Promise<{ ok: boolean; error?: string }>,
  decideApproval: (sessionId: string, requestId: string, outcome: 'allowed-once' | 'rejected') =>
    ipcRenderer.invoke('pet:approval-decision', sessionId, requestId, outcome) as Promise<{ ok: boolean; error?: string }>,
  answerQuestion: (sessionId: string, requestId: string, answers: PetQuestionAnswer[]) =>
    ipcRenderer.invoke('pet:question-answer', sessionId, requestId, answers) as Promise<{ ok: boolean; error?: string }>,
  acknowledge: (sessionId: string) => ipcRenderer.invoke('pet:acknowledge', sessionId),
  openClient: (sessionId?: string) => ipcRenderer.invoke('pet:open-client', sessionId),
  openSettings: () => ipcRenderer.invoke('pet:open-settings'),
  reconnect: () => ipcRenderer.invoke('pet:reconnect') as Promise<{ ok: boolean; error?: string }>,
  setScale: (scale: number) => ipcRenderer.invoke('pet:set-scale', scale),
  setGesture: (gesture: 'doubleClick' | 'longPress') => ipcRenderer.invoke('pet:set-gesture', gesture),
  setMouseChaseEnabled: (enabled: boolean) => ipcRenderer.invoke('pet:set-mouse-chase-enabled', enabled),
  quit: () => ipcRenderer.invoke('pet:quit'),
  stopService: () => ipcRenderer.invoke('pet:stop-service'),
  setBubbleVisible: (visible: boolean) => ipcRenderer.invoke('pet:set-bubble-visible', visible),
  recordInteraction: () => ipcRenderer.invoke('pet:record-interaction'),
  recordTreasureFound: () => ipcRenderer.invoke('pet:record-treasure-found'),
}

contextBridge.exposeInMainWorld('harnessPet', api)

export type HarnessPetRendererApi = typeof api
