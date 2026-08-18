import { contextBridge, ipcRenderer } from 'electron'
import type { PetSnapshot } from '@xy-deepseek-pet/protocol'
import type { LoadedTheme } from './theme.js'

export interface RendererPreferences {
  reducedMotion: boolean
  bubbleVisible: boolean
  walkingEnabled: boolean
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
  beginDrag: (point: { x: number; y: number }) => ipcRenderer.send('pet:drag-begin', point),
  dragTo: (point: { x: number; y: number }) => ipcRenderer.send('pet:drag-move', point),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  submitChat: (text: string, sessionId?: string) => ipcRenderer.invoke('pet:chat', text, sessionId) as Promise<{ ok: boolean; error?: string }>,
  acknowledge: (sessionId: string) => ipcRenderer.invoke('pet:acknowledge', sessionId),
  openClient: (sessionId?: string) => ipcRenderer.invoke('pet:open-client', sessionId),
  reconnect: () => ipcRenderer.invoke('pet:reconnect') as Promise<{ ok: boolean; error?: string }>,
  setScale: (scale: number) => ipcRenderer.invoke('pet:set-scale', scale),
  setGesture: (gesture: 'doubleClick' | 'longPress') => ipcRenderer.invoke('pet:set-gesture', gesture),
  quit: () => ipcRenderer.invoke('pet:quit'),
  stopService: () => ipcRenderer.invoke('pet:stop-service'),
  setBubbleVisible: (visible: boolean) => ipcRenderer.invoke('pet:set-bubble-visible', visible),
  recordInteraction: () => ipcRenderer.invoke('pet:record-interaction'),
}

contextBridge.exposeInMainWorld('harnessPet', api)

export type HarnessPetRendererApi = typeof api
