import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SoundSettings, type SoundsRemote } from '../../sounds/src/settings-view.js'
import TYPERT_REMOTE from './remote.js'
import type { PetSettings, PetSettingsSnapshot } from './settings.js'
import calmIcon from '../assets/whale-calm.png'

export const name = 'xy-deepseek-pet-client'
export const inject = ['remote', 'sessions', 'slots']

type RemoteResult<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }
interface PetRemote {
  snapshot(): Promise<RemoteResult<PetSettingsSnapshot>>
  update(config: PetSettings): Promise<RemoteResult<PetSettingsSnapshot>>
  importTheme(fileName: string, dataBase64: string): Promise<RemoteResult<PetSettingsSnapshot>>
  openDesktop(): Promise<RemoteResult<boolean>>
  desktopStatus(): Promise<RemoteResult<boolean>>
  closeDesktop(): Promise<RemoteResult<boolean>>
  createLauncher(name: string, iconId: 'calm' | 'custom', fileName: string, dataBase64: string): Promise<RemoteResult<{ displayName: string; platform: 'macOS' | 'Windows' }>>
}

function remoteValue<T>(result: RemoteResult<T>): T {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  return result.value
}

function useChinese(): boolean {
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return btoa(binary)
}

const copy = {
  zh: {
    title: '桌面宠物', open: '打开宠物', close: '关闭宠物', sidebarOpen: '打开桌宠', sidebarClose: '关闭桌宠', theme: '宠物主题', size: '宠物大小', more: '更多设置',
    walking: '允许走动', motion: '减少动画', bubbles: '消息气泡', autoLaunch: '随 Harness 启动', gesture: '打开 Harness', longPress: '长按', doubleClick: '双击',
    menu: '右键菜单', menuHint: '关闭桌宠始终保留，插件动作也可在这里开关。', openClient: '打开 Harness', chat: '回复最近消息', settings: '打开设置',
    launcher: '桌面快捷方式', launcherHint: '创建一个同时打开 Harness、网页和桌宠的桌面入口', launcherName: '名称', launcherIcon: '图标', calm: '卡通鲸鱼', customIcon: '拖入自定义 PNG', customIconHint: '拖入 PNG，或点击选择', createLauncher: '创建到桌面', createdLauncher: '已创建',
    import: '导入宠物包', importHint: '拖入下载的 ZIP 宠物包，兼容本项目主题与 Petdex 格式', browse: '选择 ZIP', importing: '正在导入…', saved: '已保存', loading: '加载中…',
  },
  en: {
    title: 'Desktop pet', open: 'Open pet', close: 'Close pet', sidebarOpen: 'Open pet', sidebarClose: 'Close pet', theme: 'Pet theme', size: 'Pet size', more: 'More settings',
    walking: 'Allow wandering', motion: 'Reduced motion', bubbles: 'Message bubbles', autoLaunch: 'Start with Harness', gesture: 'Open Harness', longPress: 'Long press', doubleClick: 'Double click',
    menu: 'Right-click menu', menuHint: 'Quit pet is always available. Plugin actions can also be toggled here.', openClient: 'Open Harness', chat: 'Reply to latest', settings: 'Open settings',
    launcher: 'Desktop shortcut', launcherHint: 'Create a desktop entry that opens Harness, the web client, and the pet', launcherName: 'Name', launcherIcon: 'Icon', calm: 'Cartoon whale', customIcon: 'Drop custom PNG', customIconHint: 'Drop a PNG, or click to choose', createLauncher: 'Create on desktop', createdLauncher: 'Created',
    import: 'Import pet pack', importHint: 'Drop a downloaded ZIP pet pack; native themes and Petdex are supported', browse: 'Choose ZIP', importing: 'Importing…', saved: 'Saved', loading: 'Loading…',
  },
} as const

const styles: Record<string, React.CSSProperties> = {
  root: { width: '100%', color: 'var(--dsw-alias-label-primary, #f4f5f6)', padding: '12px 0', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1))', letterSpacing: 0, fontFamily: 'inherit', fontSize: 13 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  title: { margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0 },
  row: { display: 'grid', gridTemplateColumns: 'minmax(104px, .8fr) minmax(180px, 1.35fr)', alignItems: 'center', gap: 12, minHeight: 40 },
  value: { justifySelf: 'end', width: '100%', maxWidth: 360 },
  button: { minHeight: 34, padding: '0 12px', border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))', borderRadius: 6, background: 'transparent', color: 'inherit', cursor: 'pointer' },
  primary: { minHeight: 34, padding: '0 12px', border: 0, borderRadius: 6, background: 'var(--dsw-alias-accent-primary, #1688f8)', color: '#fff', cursor: 'pointer' },
  segment: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2, borderRadius: 6, background: 'var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))' },
  segmentButton: { minHeight: 30, border: 0, borderRadius: 4, color: 'inherit', background: 'transparent', cursor: 'pointer' },
  segmentActive: { background: 'var(--dsw-alias-bg-base, rgba(255,255,255,.12))', boxShadow: '0 1px 3px rgba(0,0,0,.16)' },
  checks: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 16px', padding: '4px 0' },
  check: { display: 'flex', minHeight: 30, alignItems: 'center', gap: 8, fontSize: 13 },
  checkbox: { width: 16, height: 16, accentColor: 'var(--dsw-alias-accent-primary, #1688f8)' },
  range: { width: '100%', accentColor: 'var(--dsw-alias-accent-primary, #1688f8)' },
  rangeWrap: { display: 'grid', gridTemplateColumns: '1fr 48px', alignItems: 'center', gap: 8 },
  output: { textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums' },
  details: { padding: '3px 0' }, summary: { cursor: 'pointer', fontSize: 13 },
  disclosureSummary: { display: 'flex', minHeight: 34, alignItems: 'center', gap: 7, cursor: 'pointer', listStyle: 'none', fontSize: 13 },
  disclosure: { display: 'inline-block', width: 12, flex: '0 0 12px', fontSize: 10, lineHeight: 1, textAlign: 'center' },
  textInput: { width: '100%', minHeight: 34, padding: '5px 9px', color: 'inherit', background: 'var(--dsw-alias-bg-base, rgba(255,255,255,.04))', border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))', borderRadius: 6 },
  choices: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 0 2px' },
  iconChoice: { display: 'grid', gridTemplateColumns: '38px 1fr', alignItems: 'center', gap: 7, minHeight: 46, padding: '4px 8px', textAlign: 'left' },
  iconPreview: { width: 34, height: 34, objectFit: 'contain', imageRendering: 'auto' },
  drop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 52, margin: '5px 0 3px', padding: '7px 10px', border: '1px dashed var(--dsw-alias-border-l2, rgba(255,255,255,.25))', borderRadius: 6 },
  iconDrop: { display: 'grid', gridTemplateColumns: '38px 1fr', alignItems: 'center', gap: 7, minHeight: 54, padding: '6px 8px', textAlign: 'left', borderStyle: 'dashed' },
  hint: { margin: '2px 0 0', color: 'var(--dsw-alias-label-secondary, #aeb3bb)', fontSize: 12 },
  status: { minHeight: 18, marginTop: 4, fontSize: 12, color: 'var(--dsw-alias-label-secondary, #aeb3bb)' },
  error: { minHeight: 18, marginTop: 4, fontSize: 12, color: 'var(--dsw-alias-danger, #ff6b6b)' },
}

const menuActions = ['open-client', 'chat', 'settings'] as const
let soundsRemote: SoundsRemote | undefined
const soundRemoteListeners = new Set<(remote: SoundsRemote | undefined) => void>()

function useDesktopToggle(remote: PetRemote, reportError?: (message: string) => void): { open: boolean; busy: boolean; toggle: () => void } {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let live = true
    const refresh = () => remote.desktopStatus().then(remoteValue).then((value) => { if (live) setOpen(value) }).catch((reason: unknown) => reportError?.(String(reason)))
    void refresh()
    const timer = window.setInterval(refresh, 1000)
    return () => { live = false; window.clearInterval(timer) }
  }, [remote, reportError])
  const toggle = useCallback(() => {
    if (busy) return
    setBusy(true)
    const action = open ? remote.closeDesktop() : remote.openDesktop()
    action.then(remoteValue).then((accepted) => {
      if (!accepted) throw new Error(open ? 'Desktop pet is not running' : 'Desktop pet could not be opened')
      setOpen(!open)
    }).catch((reason: unknown) => reportError?.(String(reason))).finally(() => setBusy(false))
  }, [busy, open, remote, reportError])
  return { open, busy, toggle }
}

function PetSettingsView({ remote }: { remote: PetRemote }): React.ReactElement {
  const locale = useChinese() ? 'zh-CN' : 'en'
  const c = locale === 'zh-CN' ? copy.zh : copy.en
  const [snapshot, setSnapshot] = useState<PetSettingsSnapshot>()
  const [draft, setDraft] = useState<PetSettings>()
  const [status, setStatus] = useState<string>(c.loading)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [iconDragging, setIconDragging] = useState(false)
  const [soundRemote, setSoundRemote] = useState<SoundsRemote | undefined>(soundsRemote)
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [launcherName, setLauncherName] = useState('DeepSeek Harness')
  const [launcherIcon, setLauncherIcon] = useState<'calm' | 'custom'>('calm')
  const [launcherFile, setLauncherFile] = useState<File>()
  const [customIconPreview, setCustomIconPreview] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const fileInput = useRef<HTMLInputElement>(null)
  const launcherFileInput = useRef<HTMLInputElement>(null)
  const reportToggleError = useCallback((message: string) => setError(message), [])
  const desktop = useDesktopToggle(remote, reportToggleError)

  useEffect(() => {
    let live = true
    remote.snapshot().then(remoteValue).then((value) => { if (live) { setSnapshot(value); setDraft(value.config); setStatus('') } }).catch((reason: unknown) => live && setError(String(reason)))
    return () => { live = false; if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [remote])
  useEffect(() => { soundRemoteListeners.add(setSoundRemote); return () => { soundRemoteListeners.delete(setSoundRemote) } }, [])
  useEffect(() => {
    const preventFileNavigation = (event: DragEvent) => {
      if (Array.from(event.dataTransfer?.types ?? []).includes('Files')) event.preventDefault()
    }
    window.addEventListener('dragover', preventFileNavigation)
    window.addEventListener('drop', preventFileNavigation)
    return () => {
      window.removeEventListener('dragover', preventFileNavigation)
      window.removeEventListener('drop', preventFileNavigation)
    }
  }, [])

  const commit = useCallback(async (next: PetSettings) => {
    setError(''); setStatus('…')
    try { const value = remoteValue(await remote.update(next)); setSnapshot(value); setDraft(value.config); setStatus(c.saved) }
    catch (reason) { setError(String(reason)); setStatus('') }
  }, [c.saved, remote])
  const mutate = useCallback((change: (next: PetSettings) => void) => {
    setDraft((current) => {
      if (!current) return current
      const next = structuredClone(current); change(next)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => void commit(next), 160)
      return next
    })
  }, [commit])
  const importFile = useCallback(async (file: File) => {
    setError('')
    if (!file.name.toLowerCase().endsWith('.zip') || file.size === 0 || file.size > 20 * 1024 * 1024) { setError(locale === 'zh-CN' ? '请选择不超过 20 MiB 的 ZIP 宠物包' : 'Choose a ZIP pet pack no larger than 20 MiB'); return }
    setStatus(c.importing)
    try { const value = remoteValue(await remote.importTheme(file.name, toBase64(await file.arrayBuffer()))); setSnapshot(value); setDraft(value.config); setStatus(c.saved) }
    catch (reason) { setError(String(reason)); setStatus('') }
  }, [c.importing, c.saved, locale, remote])
  const chooseLauncherFile = useCallback((file: File) => {
    if (file.type !== 'image/png' || !file.name.toLowerCase().endsWith('.png') || file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError(locale === 'zh-CN' ? '请选择不超过 5 MiB 的 PNG 图标' : 'Choose a PNG icon no larger than 5 MiB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCustomIconPreview(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
    setLauncherFile(file)
    setLauncherIcon('custom')
    setError('')
  }, [locale])
  const droppedFile = (event: React.DragEvent): File | undefined => {
    event.preventDefault()
    event.stopPropagation()
    const item = Array.from(event.dataTransfer.items).find((candidate) => candidate.kind === 'file')
    event.dataTransfer.dropEffect = 'copy'
    return item?.getAsFile() ?? event.dataTransfer.files[0] ?? undefined
  }

  if (!snapshot || !draft) return React.createElement('div', { style: styles.root }, error || status)
  const checkbox = (label: string, checked: boolean, change: (checked: boolean) => void) => React.createElement('label', { style: styles.check }, React.createElement('input', { type: 'checkbox', style: styles.checkbox, checked, onChange: (event: React.ChangeEvent<HTMLInputElement>) => change(event.currentTarget.checked) }), label)
  const menuLabel = { 'open-client': c.openClient, chat: c.chat, settings: c.settings }
  const selectedTheme = snapshot.themes.find((theme) => theme.id === draft.themeId)
  const iconOption = (id: 'calm' | 'custom', label: string, source: string) => React.createElement('button', {
    key: id, type: 'button', style: { ...styles.button, ...(id === 'custom' ? styles.iconDrop : styles.iconChoice), ...(launcherIcon === id || (id === 'custom' && iconDragging) ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)' } : {}) },
    onClick: () => id === 'custom' ? launcherFileInput.current?.click() : setLauncherIcon(id),
    onDragEnter: id === 'custom' ? (event: React.DragEvent) => { event.preventDefault(); setIconDragging(true) } : undefined,
    onDragOver: id === 'custom' ? (event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' } : undefined,
    onDragLeave: id === 'custom' ? (event: React.DragEvent) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIconDragging(false) } : undefined,
    onDrop: id === 'custom' ? (event: React.DragEvent) => { setIconDragging(false); const file = droppedFile(event); if (file) chooseLauncherFile(file) } : undefined,
  }, source ? React.createElement('img', { src: source, alt: '', style: styles.iconPreview }) : React.createElement('span', { style: styles.iconPreview }), React.createElement('span', null, id === 'custom' ? React.createElement(React.Fragment, null, React.createElement('span', null, label), React.createElement('span', { style: { ...styles.hint, display: 'block' } }, c.customIconHint)) : label))
  const createLauncher = async () => {
    setError(''); setStatus('…')
    try {
      const fileName = launcherIcon === 'custom' ? launcherFile?.name ?? '' : ''
      const dataBase64 = launcherIcon === 'custom' && launcherFile ? toBase64(await launcherFile.arrayBuffer()) : ''
      if (launcherIcon === 'custom' && !launcherFile) throw new Error(locale === 'zh-CN' ? '请先选择 PNG 图标' : 'Choose a PNG icon first')
      const result = remoteValue(await remote.createLauncher(launcherName, launcherIcon, fileName, dataBase64))
      setStatus(`${c.createdLauncher}：${result.displayName}`)
    } catch (reason) { setError(String(reason)); setStatus('') }
  }

  return React.createElement('div', { style: styles.root },
    React.createElement('div', { style: styles.header }, React.createElement('h3', { style: styles.title }, c.title), React.createElement('button', { type: 'button', style: styles.primary, disabled: desktop.busy, onClick: desktop.toggle }, desktop.open ? c.close : c.open)),
    React.createElement('div', { style: styles.row }, c.theme,
      React.createElement('details', { style: { ...styles.details, ...styles.value } }, React.createElement('summary', { style: styles.summary }, selectedTheme?.name ?? draft.themeId), React.createElement('div', { style: styles.choices }, ...snapshot.themes.map((theme) => React.createElement('button', { key: theme.id, type: 'button', style: { ...styles.button, ...(theme.id === draft.themeId ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)' } : {}) }, onClick: () => mutate((next) => { next.themeId = theme.id }) }, theme.name))))),
    React.createElement('div', { style: styles.row }, c.size, React.createElement('div', { style: { ...styles.rangeWrap, ...styles.value } }, React.createElement('input', { type: 'range', min: 0.4, max: 2, step: 0.05, value: draft.scale, style: styles.range, 'aria-label': c.size, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const value = Number(event.currentTarget.value); mutate((next) => { next.scale = value }) } }), React.createElement('output', { style: styles.output }, `${Math.round(draft.scale * 100)}%`))),
    React.createElement('div', { style: styles.row }, c.gesture, React.createElement('div', { style: { ...styles.segment, ...styles.value } },
      React.createElement('button', { type: 'button', style: { ...styles.segmentButton, ...(draft.activationGesture === 'longPress' ? styles.segmentActive : {}) }, onClick: () => mutate((next) => { next.activationGesture = 'longPress' }) }, c.longPress),
      React.createElement('button', { type: 'button', style: { ...styles.segmentButton, ...(draft.activationGesture === 'doubleClick' ? styles.segmentActive : {}) }, onClick: () => mutate((next) => { next.activationGesture = 'doubleClick' }) }, c.doubleClick))),
    React.createElement('div', { style: styles.checks },
      checkbox(c.walking, draft.walkingEnabled, (value) => mutate((next) => { next.walkingEnabled = value })),
      checkbox(c.bubbles, draft.bubbleVisible, (value) => mutate((next) => { next.bubbleVisible = value })),
      checkbox(c.autoLaunch, draft.autoLaunch, (value) => mutate((next) => { next.autoLaunch = value }))),
    React.createElement('div', { role: 'button', tabIndex: 0, 'aria-label': c.importHint, 'data-pet-pack-drop': true, style: { ...styles.drop, ...(dragging ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)', background: 'var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))' } : {}) }, onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') fileInput.current?.click() }, onDragEnter: (event: React.DragEvent) => { event.preventDefault(); setDragging(true) }, onDragOver: (event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }, onDragLeave: (event: React.DragEvent) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }, onDrop: (event: React.DragEvent) => { setDragging(false); const file = droppedFile(event); if (file) void importFile(file) } }, React.createElement('div', null, React.createElement('div', null, c.import), React.createElement('p', { style: styles.hint }, c.importHint)), React.createElement('button', { type: 'button', style: styles.button, onClick: (event: React.MouseEvent) => { event.stopPropagation(); fileInput.current?.click() } }, c.browse)),
    React.createElement('input', { ref: fileInput, type: 'file', accept: '.zip,application/zip', hidden: true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void importFile(file) } }),
    React.createElement('details', { open: launcherOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setLauncherOpen(event.currentTarget.open), style: styles.details },
      React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, launcherOpen ? '▼' : '▶'), React.createElement('span', null, c.launcher)),
      React.createElement('div', { style: { padding: '2px 0 8px 20px' } },
        React.createElement('p', { style: styles.hint }, c.launcherHint),
        React.createElement('div', { style: styles.row }, c.launcherName, React.createElement('input', { type: 'text', maxLength: 48, value: launcherName, style: { ...styles.textInput, ...styles.value }, onChange: (event: React.ChangeEvent<HTMLInputElement>) => setLauncherName(event.currentTarget.value) })),
        React.createElement('div', { style: styles.row }, c.launcherIcon, React.createElement('div', { style: { ...styles.choices, ...styles.value } }, iconOption('calm', c.calm, calmIcon), iconOption('custom', launcherFile?.name ?? c.customIcon, customIconPreview))),
        React.createElement('input', { ref: launcherFileInput, type: 'file', accept: '.png,image/png', hidden: true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) chooseLauncherFile(file) } }),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', paddingTop: 6 } }, React.createElement('button', { type: 'button', style: styles.button, onClick: () => void createLauncher() }, c.createLauncher)))),
    React.createElement('details', { open: moreOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setMoreOpen(event.currentTarget.open), style: styles.details }, React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, moreOpen ? '▼' : '▶'), React.createElement('span', null, c.more)), React.createElement('div', { style: { padding: '2px 0 6px 20px' } },
      React.createElement('div', { style: styles.checks }, checkbox(c.motion, draft.reducedMotion, (value) => mutate((next) => { next.reducedMotion = value }))),
      React.createElement('details', { style: styles.details }, React.createElement('summary', { style: styles.summary }, c.menu), React.createElement('p', { style: styles.hint }, c.menuHint), React.createElement('div', { style: styles.checks },
        ...menuActions.map((action) => checkbox(menuLabel[action], draft.menuActions.includes(action), (checked) => mutate((next) => { next.menuActions = checked ? [...new Set([...next.menuActions, action])] : next.menuActions.filter((item) => item !== action) }))),
        ...snapshot.menuExtensions.map((action) => checkbox(action.label[locale], draft.menuActions.includes(action.id), (checked) => mutate((next) => { next.menuActions = checked ? [...new Set([...next.menuActions, action.id])] : next.menuActions.filter((item) => item !== action.id) }))))))),
    soundRemote && React.createElement(SoundSettings, { remote: soundRemote, locale, embedded: true }),
    React.createElement('div', { style: error ? styles.error : styles.status, role: 'status' }, error || status),
  )
}

function OpenPetAction(props: { wide: boolean; remote: PetRemote }): React.ReactElement {
  const c = useChinese() ? copy.zh : copy.en
  const desktop = useDesktopToggle(props.remote)
  const label = desktop.open ? c.sidebarClose : c.sidebarOpen
  return React.createElement('button', { type: 'button', title: label, 'aria-label': label, disabled: desktop.busy, onClick: desktop.toggle, style: { width: props.wide ? '100%' : 36, minHeight: 32, border: '1px solid var(--dsw-alias-border-l2, #d8dee3)', borderRadius: 6, background: 'var(--dsw-alias-bg-base, #fff)', color: 'var(--dsw-alias-label-primary, #172026)', cursor: 'pointer', fontSize: 12 } }, props.wide ? label : '🐋')
}

export async function apply(ctx: any): Promise<() => Promise<void>> {
  const presenceKey = '__xyDeepSeekPetSettingsPresent'
  const presenceEvent = 'xy-deepseek-pet-settings-presence'
  ;(globalThis as any)[presenceKey] = true
  globalThis.dispatchEvent?.(new Event(presenceEvent))
  const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE)
  const settingsFiber = ctx.inject(['remote.xyPet'], (scope: any) => {
    const remote = scope.remote.xyPet as PetRemote
    scope.slots.inject('settings.general.item', () => scope.slots.register({ name: 'settings.general.item', id: 'xy-deepseek-pet', order: 100, label: useChinese() ? '桌面宠物' : 'Desktop pet' }, () => React.createElement(PetSettingsView, { remote })))
  })
  const soundsFiber = ctx.inject(['remote.xySounds'], (scope: any) => { soundsRemote = scope.remote.xySounds as SoundsRemote; for (const listener of soundRemoteListeners) listener(soundsRemote) })
  const actionFiber = ctx.inject(['remote.xyPet'], (scope: any) => {
    const remote = scope.remote.xyPet as PetRemote
    scope.slots.inject('sidebar.footer.action', () => scope.slots.register({ name: 'sidebar.footer.action', id: 'xy-deepseek-pet', order: 20 }, (props: { wide: boolean }) => React.createElement(OpenPetAction, { wide: props.wide, remote })))
  })
  await Promise.all([settingsFiber, actionFiber, soundsFiber])
  return async () => {
    soundsRemote = undefined
    for (const listener of soundRemoteListeners) listener(undefined)
    await Promise.all([settingsFiber.dispose(), actionFiber.dispose(), soundsFiber.dispose()])
    await unmountRemote()
    ;(globalThis as any)[presenceKey] = false
    globalThis.dispatchEvent?.(new Event(presenceEvent))
  }
}
