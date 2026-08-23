import React, { useCallback, useEffect, useRef, useState } from 'react'
import { consumePetSettingsUrl, DEFAULT_PET_ACCENT_COLOR } from '@xy-deepseek-pet/protocol'
import { SOUND_FILE_DROP_EVENT, SoundSettings, soundFileDropChannel, type SoundFileDropDetail, type SoundsRemote } from '../../sounds/src/settings-view.js'
import TYPERT_REMOTE from './remote.js'
import { isFileDrag, petFileDropKind, type PetFileDropKind } from './file-drop.js'
import { shortcutFromKey } from './shortcut-recorder.js'
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
  createFinderQuickAction(): Promise<RemoteResult<{ displayName: string; platform: 'macOS' | 'Windows' }>>
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
    title: '桌面宠物', open: '打开宠物', close: '关闭宠物', appearance: '外观', interaction: '交互', behaviorDisplay: '行为与显示', shortcutsStartup: '快捷与启动', collection: '收藏', theme: '宠物主题', themeColor: '主题色', resetThemeColor: '恢复默认', size: '宠物大小', treasuresFound: '找到的宝箱数量',
    walking: '自动走动', motion: '减少动画', bubbles: '消息气泡', autoLaunch: '随 Harness 启动', showOnFullScreen: '全屏时显示', gesture: '打开 Harness', longPress: '长按', doubleClick: '双击', interactionActions: '交互动作', recordVoice: '录音', openRecentChat: '打开最近会话详情', noAction: '无动作',
    voiceInput: '语音输入', voiceSystem: '系统语音识别', voiceLanguage: '识别语言', followSystem: '跟随系统', chinese: '中文', english: 'English', voiceHint: '默认使用系统语音识别，不内置或上传模型；扩展可以接入其他识别方式。录音文字会先进入最近会话，可修改后再发送。',
    movement: '趣味移动', frequency: '走动频率', distance: '单次距离', chase: '追着鼠标跑', chaseSpeed: '追逐速度', fling: '抛掷惯性', resistance: '抛掷阻力', summon: '快捷键召唤', summonShortcut: '召唤快捷键', shortcutPrompt: '请按下快捷键…', shortcutHint: '点击输入框即可重新录入', summonChat: '召唤后展开最近聊天',
    veryOccasional: '很偶尔', occasional: '偶尔', sometimes: '有时', frequent: '经常', veryFrequent: '很经常',
    tinyStep: '小步', easyStep: '随意', bigStep: '大步', slow: '慢悠悠', lively: '积极', speedy: '飞快', lowResistance: '滑得远', balancedResistance: '适中', highResistance: '停得快',
    menu: '右键菜单', menuHint: '关闭桌宠始终保留，插件动作也可在这里开关。', openClient: '打开 Harness', chat: '回复最近消息', settings: '打开设置',
    launcher: '桌面快捷方式', launcherHint: '创建一个同时打开 Harness、网页和桌宠的桌面入口', launcherName: '名称', launcherIcon: '图标', calm: '卡通鲸鱼', customIcon: '选择自定义 PNG', customIconHint: '点击或拖入 PNG', createLauncher: '创建到桌面', createdLauncher: '已创建', finderAction: 'Finder 快速操作', finderActionHint: '安装后，选中文件并点击 Finder 右键菜单“快速操作 > 发送到小鲸鱼”，即可召唤鲸鱼并把路径填入最近会话', explorerAction: '资源管理器发送到', explorerActionHint: '安装后，选中文件并从右键菜单“发送到 > 发送到小鲸鱼”，即可召唤鲸鱼并把路径填入最近会话', installFinderAction: '安装到右键菜单', installedFinderAction: '已安装到右键菜单',
    import: '导入宠物包', importHint: '拖入或选择 ZIP 宠物包，兼容本项目主题与 Petdex 格式', browse: '选择 ZIP', importing: '正在导入…', saved: '已保存', loading: '加载中…',
  },
  en: {
    title: 'Desktop pet', open: 'Open pet', close: 'Close pet', appearance: 'Appearance', interaction: 'Interaction', behaviorDisplay: 'Behavior & display', shortcutsStartup: 'Shortcuts & startup', collection: 'Collection', theme: 'Pet theme', themeColor: 'Accent color', resetThemeColor: 'Reset', size: 'Pet size', treasuresFound: 'Treasure chests found',
    walking: 'Auto wander', motion: 'Reduced motion', bubbles: 'Message bubbles', autoLaunch: 'Start with Harness', showOnFullScreen: 'Show in full screen', gesture: 'Open Harness', longPress: 'Long press', doubleClick: 'Double click', interactionActions: 'Interaction actions', recordVoice: 'Record', openRecentChat: 'Open latest session details', noAction: 'No action',
    voiceInput: 'Voice input', voiceSystem: 'System speech recognition', voiceLanguage: 'Recognition language', followSystem: 'Follow system', chinese: 'Chinese', english: 'English', voiceHint: 'Uses system speech recognition by default with no bundled or uploaded model. Extensions can add other providers. Dictation enters the latest session for review before sending.',
    movement: 'Playful movement', frequency: 'Wander frequency', distance: 'Wander distance', chase: 'Chase the pointer', chaseSpeed: 'Chase speed', fling: 'Throw inertia', resistance: 'Throw resistance', summon: 'Summon shortcut', summonShortcut: 'Shortcut', shortcutPrompt: 'Press a shortcut…', shortcutHint: 'Click the field to record a new shortcut', summonChat: 'Open recent chat after summoning',
    veryOccasional: 'Rarely', occasional: 'Occasionally', sometimes: 'Sometimes', frequent: 'Often', veryFrequent: 'Very often',
    tinyStep: 'Short', easyStep: 'Casual', bigStep: 'Long', slow: 'Leisurely', lively: 'Lively', speedy: 'Speedy', lowResistance: 'Glides farther', balancedResistance: 'Balanced', highResistance: 'Stops sooner',
    menu: 'Right-click menu', menuHint: 'Quit pet is always available. Plugin actions can also be toggled here.', openClient: 'Open Harness', chat: 'Reply to latest', settings: 'Open settings',
    launcher: 'Desktop shortcut', launcherHint: 'Create a desktop entry that opens Harness, the web client, and the pet', launcherName: 'Name', launcherIcon: 'Icon', calm: 'Cartoon whale', customIcon: 'Choose custom PNG', customIconHint: 'Click or drop PNG', createLauncher: 'Create on desktop', createdLauncher: 'Created', finderAction: 'Finder Quick Action', finderActionHint: 'After installing, select files and choose “Quick Actions > Send to Little Whale” in Finder to summon the pet and prefill their paths', explorerAction: 'File Explorer Send to', explorerActionHint: 'After installing, select files and choose “Send to > Send to Little Whale” to summon the pet and prefill their paths', installFinderAction: 'Add to context menu', installedFinderAction: 'Added to context menu',
    import: 'Import pet pack', importHint: 'Drop or choose a ZIP pet pack; native themes and Petdex are supported', browse: 'Choose ZIP', importing: 'Importing…', saved: 'Saved', loading: 'Loading…',
  },
} as const

const styles: Record<string, React.CSSProperties> = {
  root: { width: '100%', color: 'var(--dsw-alias-label-primary, #f4f5f6)', padding: '12px 0', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1))', letterSpacing: 0, fontFamily: 'inherit', fontSize: 13 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  title: { margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0 },
  group: { padding: '3px 0 5px', borderTop: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08))' },
  firstGroup: { borderTop: 0 },
  groupTitle: { margin: '8px 0 2px', color: 'var(--dsw-alias-label-secondary, #aeb3bb)', fontSize: 12, fontWeight: 500, lineHeight: 1.5 },
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
  rangeWrap: { display: 'grid', gridTemplateColumns: '1fr 68px', alignItems: 'center', gap: 8 },
  output: { textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums' },
  details: { padding: '3px 0', borderTop: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08))' }, summary: { cursor: 'pointer', fontSize: 13 },
  disclosureSummary: { display: 'flex', minHeight: 40, alignItems: 'center', gap: 7, cursor: 'pointer', listStyle: 'none', outline: 'none', fontSize: 13, fontWeight: 500 },
  disclosure: { display: 'inline-block', width: 12, flex: '0 0 12px', fontSize: 10, lineHeight: 1, textAlign: 'center' },
  disclosureBody: { padding: '2px 0 10px 19px' },
  textInput: { width: '100%', height: 34, boxSizing: 'border-box', padding: '0 9px', lineHeight: '32px', color: 'inherit', background: 'var(--dsw-alias-bg-base, rgba(255,255,255,.04))', border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))', borderRadius: 6 },
  choices: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 0 2px' },
  launcherActions: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.2fr) minmax(0, 1fr)', alignItems: 'stretch', gap: 6 },
  iconChoice: { display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', alignItems: 'center', gap: 5, height: 46, minHeight: 0, padding: '3px 7px', textAlign: 'left', overflow: 'hidden' },
  iconPreview: { width: 28, height: 28, objectFit: 'contain', imageRendering: 'auto' },
  iconText: { display: 'block', minWidth: 0, overflow: 'hidden' },
  iconLabel: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 },
  drop: { display: 'grid', gridTemplateColumns: 'minmax(104px, .8fr) minmax(180px, 1.35fr)', alignItems: 'center', gap: 12, minHeight: 46 },
  dropActive: { background: 'var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))' },
  dropAction: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', maxWidth: 360, justifySelf: 'end' },
  iconDrop: { display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', alignItems: 'center', gap: 5, height: 46, minHeight: 0, padding: '3px 7px', textAlign: 'left', overflow: 'hidden' },
  hint: { margin: '2px 0 0', color: 'var(--dsw-alias-label-secondary, #aeb3bb)', fontSize: 12 },
  status: { minHeight: 18, marginTop: 4, fontSize: 12, color: 'var(--dsw-alias-label-secondary, #aeb3bb)' },
  error: { minHeight: 18, marginTop: 4, fontSize: 12, color: 'var(--dsw-alias-danger, #ff6b6b)' },
}

const menuActions = ['open-client', 'chat', 'settings'] as const
const PET_FILE_DROP_EVENT = 'xy-deepseek-pet-file-drop'
type PetFileDropDetail = { kind?: PetFileDropKind; phase: 'hover' | 'leave' | 'drop'; files?: File[] }
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

function installPetFileDropIsolation(): () => void {
  const handle = (event: DragEvent): void => {
    const settings = document.querySelector<HTMLElement>('[data-xy-deepseek-pet-settings]')
    const fileDrag = isFileDrag(event.dataTransfer?.types ?? [])
    if (!settings || settings.getClientRects().length === 0 || !fileDrag) return

    // The Harness composer owns page-level file drops. While its settings modal
    // is open, intercept file drags at window capture so its full-page overlay
    // cannot cover the two pet-specific drop targets.
    event.preventDefault()
    event.stopImmediatePropagation()
    const pointed = document.elementFromPoint(event.clientX, event.clientY)
    const zone = pointed?.closest<HTMLElement>('[data-xy-pet-drop-zone]')
    const kind = petFileDropKind(zone?.dataset.xyPetDropZone)
    const soundZone = pointed?.closest<HTMLElement>('[data-xy-sound-drop-zone]')
    const soundChannel = soundFileDropChannel(soundZone?.dataset.xySoundDropZone)
    if (event.dataTransfer) event.dataTransfer.dropEffect = kind || soundChannel ? 'copy' : 'none'
    const phase = event.type === 'drop' ? 'drop' : event.type === 'dragleave' ? 'leave' : 'hover'
    const detail: PetFileDropDetail = {
      phase,
      ...(kind ? { kind } : {}),
      ...(phase === 'drop' ? { files: Array.from(event.dataTransfer?.files ?? []) } : {}),
    }
    window.dispatchEvent(new CustomEvent<PetFileDropDetail>(PET_FILE_DROP_EVENT, { detail }))
    const soundDetail: SoundFileDropDetail = {
      phase,
      ...(soundChannel ? { channel: soundChannel } : {}),
      ...(phase === 'drop' ? { files: Array.from(event.dataTransfer?.files ?? []) } : {}),
    }
    window.dispatchEvent(new CustomEvent<SoundFileDropDetail>(SOUND_FILE_DROP_EVENT, { detail: soundDetail }))
  }
  const events = ['dragenter', 'dragover', 'dragleave', 'drop'] as const
  for (const event of events) window.addEventListener(event, handle, { capture: true })
  return () => { for (const event of events) window.removeEventListener(event, handle, { capture: true }) }
}

function PetSettingsView({ remote }: { remote: PetRemote }): React.ReactElement {
  const locale = useChinese() ? 'zh-CN' : 'en'
  const c = locale === 'zh-CN' ? copy.zh : copy.en
  const [snapshot, setSnapshot] = useState<PetSettingsSnapshot>()
  const [draft, setDraft] = useState<PetSettings>()
  const [status, setStatus] = useState<string>(c.loading)
  const [error, setError] = useState('')
  const [soundRemote, setSoundRemote] = useState<SoundsRemote | undefined>(soundsRemote)
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(true)
  const [interactionOpen, setInteractionOpen] = useState(true)
  const [movementOpen, setMovementOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shortcutRecording, setShortcutRecording] = useState(false)
  const [fileActionFeedback, setFileActionFeedback] = useState<{ ok: boolean; text: string }>()
  const [launcherName, setLauncherName] = useState('DeepSeek Harness')
  const [launcherIcon, setLauncherIcon] = useState<'calm' | 'custom'>('calm')
  const [launcherFile, setLauncherFile] = useState<File>()
  const [customIconPreview, setCustomIconPreview] = useState('')
  const [dropTarget, setDropTarget] = useState<PetFileDropKind>()
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const fileInput = useRef<HTMLInputElement>(null)
  const launcherFileInput = useRef<HTMLInputElement>(null)
  const reportToggleError = useCallback((message: string) => setError(message), [])
  const desktop = useDesktopToggle(remote, reportToggleError)

  useEffect(() => {
    let live = true
    const refresh = (initial = false) => remote.snapshot().then(remoteValue).then((value) => {
      if (!live) return
      setSnapshot(value)
      if (initial) { setDraft(value.config); setStatus('') }
    }).catch((reason: unknown) => { if (live && initial) setError(String(reason)) })
    void refresh(true)
    const timer = window.setInterval(() => void refresh(), 2_000)
    return () => { live = false; window.clearInterval(timer); if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [remote])
  useEffect(() => { soundRemoteListeners.add(setSoundRemote); return () => { soundRemoteListeners.delete(setSoundRemote) } }, [])
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
  useEffect(() => {
    const handleDrop = (event: Event): void => {
      const detail = (event as CustomEvent<PetFileDropDetail>).detail
      if (!detail || detail.phase === 'leave') {
        setDropTarget(undefined)
        return
      }
      setDropTarget(detail.phase === 'hover' ? detail.kind : undefined)
      if (detail.phase !== 'drop' || !detail.kind) return
      const file = detail.files?.[0]
      if (!file) return
      if (detail.kind === 'theme') void importFile(file)
      else chooseLauncherFile(file)
    }
    window.addEventListener(PET_FILE_DROP_EVENT, handleDrop)
    return () => window.removeEventListener(PET_FILE_DROP_EVENT, handleDrop)
  }, [chooseLauncherFile, importFile])
  if (!snapshot || !draft) return React.createElement('div', { 'data-xy-deepseek-pet-settings': '', style: styles.root }, error || status)
  const checkbox = (label: string, checked: boolean, change: (checked: boolean) => void) => React.createElement('label', { style: styles.check }, React.createElement('input', { type: 'checkbox', style: styles.checkbox, checked, onChange: (event: React.ChangeEvent<HTMLInputElement>) => change(event.currentTarget.checked) }), label)
  const toggleRow = (label: string, checked: boolean, change: (checked: boolean) => void) => React.createElement('div', { style: styles.row },
    React.createElement('span', null, label),
    React.createElement('div', { style: { ...styles.value, display: 'flex', justifyContent: 'flex-end' } },
      React.createElement('input', { type: 'checkbox', style: styles.checkbox, checked, 'aria-label': label, onChange: (event: React.ChangeEvent<HTMLInputElement>) => change(event.currentTarget.checked) })))
  const levelLabel = (value: number, labels: readonly string[]) => labels[Math.min(labels.length - 1, Math.floor(value / (100 / labels.length)))]
  const movementSlider = (label: string, value: number, labels: readonly string[], change: (value: number) => void, disabled = false) => {
    const valueLabel = levelLabel(value, labels)
    return React.createElement('div', { style: { ...styles.row, ...(disabled ? { opacity: 0.45 } : {}) } }, label,
      React.createElement('div', { style: { ...styles.rangeWrap, ...styles.value } },
        React.createElement('input', {
          type: 'range', min: 0, max: 100, step: 1, value, disabled, style: styles.range,
          'aria-label': label, 'aria-valuetext': valueLabel,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => change(Number(event.currentTarget.value)),
        }),
        React.createElement('output', { style: styles.output }, valueLabel)))
  }
  const interactionActionRow = (label: string, key: 'doubleClickAction' | 'longPressAction', value: PetSettings[typeof key]) => React.createElement('div', { style: styles.row }, label,
    React.createElement('select', {
      style: { ...styles.textInput, ...styles.value }, value,
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
        const action = event.currentTarget.value as PetSettings[typeof key]
        mutate((next) => {
          next[key] = action
          next.voiceInputEnabled = next.doubleClickAction === 'voice' || next.longPressAction === 'voice'
        })
      },
    }, React.createElement('option', { value: 'none' }, c.noAction), React.createElement('option', { value: 'voice' }, c.recordVoice), React.createElement('option', { value: 'openRecentChat' }, c.openRecentChat), React.createElement('option', { value: 'openHarness' }, c.openClient)))
  const menuLabel = { 'open-client': c.openClient, chat: c.chat, settings: c.settings }
  const selectedTheme = snapshot.themes.find((theme) => theme.id === draft.themeId)
  const iconOption = (id: 'calm' | 'custom', label: string, source: string) => React.createElement('button', {
    key: id, type: 'button', title: id === 'custom' ? c.customIconHint : label, style: { ...styles.button, ...(id === 'custom' ? styles.iconDrop : styles.iconChoice), ...(!source ? { gridTemplateColumns: 'minmax(0, 1fr)' } : {}), ...(launcherIcon === id ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)' } : {}), ...(id === 'custom' && dropTarget === 'icon' ? styles.dropActive : {}) },
    ...(id === 'custom' ? { 'data-xy-pet-drop-zone': 'icon' } : {}),
    onClick: () => id === 'custom' ? launcherFileInput.current?.click() : setLauncherIcon(id),
  }, source && React.createElement('img', { src: source, alt: '', style: styles.iconPreview }), React.createElement('span', { style: styles.iconText }, id === 'custom'
    ? React.createElement(React.Fragment, null,
        React.createElement('span', { style: styles.iconLabel }, label),
        React.createElement('span', { style: { ...styles.hint, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 } }, c.customIconHint))
    : React.createElement('span', { style: styles.iconLabel }, label)))
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
  const createFinderQuickAction = async () => {
    setError(''); setStatus(''); setFileActionFeedback(undefined)
    try {
      const result = remoteValue(await remote.createFinderQuickAction())
      setFileActionFeedback({ ok: true, text: `${c.installedFinderAction}：${result.displayName}` })
    } catch (reason) {
      const message = String(reason)
      setError(message); setFileActionFeedback({ ok: false, text: message })
    }
  }

  return React.createElement('div', { 'data-xy-deepseek-pet-settings': '', style: styles.root },
    React.createElement('div', { style: styles.header }, React.createElement('h3', { style: styles.title }, c.title), React.createElement('button', { type: 'button', style: styles.primary, disabled: desktop.busy, onClick: desktop.toggle }, desktop.open ? c.close : c.open)),
    React.createElement('details', { open: appearanceOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setAppearanceOpen(event.currentTarget.open), style: { ...styles.details, borderTop: 0 } },
      React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, appearanceOpen ? '▼' : '▶'), React.createElement('span', null, c.appearance)),
      React.createElement('div', { style: styles.disclosureBody },
      React.createElement('div', { style: styles.row }, c.theme,
        React.createElement('details', { style: { ...styles.details, ...styles.value, borderTop: 0, padding: 0 } }, React.createElement('summary', { style: styles.summary }, selectedTheme?.name ?? draft.themeId), React.createElement('div', { style: styles.choices }, ...snapshot.themes.map((theme) => React.createElement('button', { key: theme.id, type: 'button', style: { ...styles.button, ...(theme.id === draft.themeId ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)' } : {}) }, onClick: () => mutate((next) => { next.themeId = theme.id }) }, theme.name))))),
      React.createElement('div', { 'data-xy-pet-drop-zone': 'theme', style: { ...styles.drop, ...(dropTarget === 'theme' ? styles.dropActive : {}) } },
        React.createElement('span', null, c.import),
        React.createElement('div', { style: styles.dropAction }, React.createElement('p', { style: { ...styles.hint, margin: 0 } }, c.importHint), React.createElement('button', { type: 'button', style: styles.button, onClick: () => fileInput.current?.click() }, c.browse))),
      React.createElement('input', { ref: fileInput, type: 'file', accept: '.zip,application/zip', hidden: true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void importFile(file) } }),
      React.createElement('div', { style: styles.row }, c.themeColor,
        React.createElement('div', { style: { ...styles.value, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 } },
          React.createElement('input', { type: 'color', value: draft.accentColor, 'aria-label': c.themeColor, style: { width: 38, height: 28, padding: 2, border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))', borderRadius: 5, background: 'transparent', cursor: 'pointer' }, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const value = event.currentTarget.value; mutate((next) => { next.accentColor = value }) } }),
          React.createElement('output', { style: { ...styles.output, minWidth: 58 } }, draft.accentColor.toUpperCase()),
          React.createElement('button', {
            type: 'button',
            style: { ...styles.button, minHeight: 28, height: 28, padding: '0 9px' },
            disabled: draft.accentColor.toLowerCase() === DEFAULT_PET_ACCENT_COLOR,
            onClick: () => mutate((next) => { next.accentColor = DEFAULT_PET_ACCENT_COLOR }),
          }, c.resetThemeColor))),
      React.createElement('div', { style: styles.row }, c.size, React.createElement('div', { style: { ...styles.rangeWrap, ...styles.value } }, React.createElement('input', { type: 'range', min: 0.2, max: 2, step: 0.05, value: draft.scale, style: styles.range, 'aria-label': c.size, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const value = Number(event.currentTarget.value); mutate((next) => { next.scale = value }) } }), React.createElement('output', { style: styles.output }, `${Math.round(draft.scale * 100)}%`))))),
    React.createElement('details', { open: interactionOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setInteractionOpen(event.currentTarget.open), style: styles.details },
      React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, interactionOpen ? '▼' : '▶'), React.createElement('span', null, c.interactionActions)),
      React.createElement('div', { style: styles.disclosureBody },
      toggleRow(c.bubbles, draft.bubbleVisible, (value) => mutate((next) => { next.bubbleVisible = value })),
      interactionActionRow(c.doubleClick, 'doubleClickAction', draft.doubleClickAction),
      interactionActionRow(c.longPress, 'longPressAction', draft.longPressAction),
      draft.voiceInputEnabled && React.createElement(React.Fragment, null,
        React.createElement('div', { style: styles.row }, c.voiceInput, React.createElement('span', { style: { ...styles.value, textAlign: 'right' } }, c.voiceSystem)),
        React.createElement('div', { style: styles.row }, c.voiceLanguage,
          React.createElement('select', { style: { ...styles.textInput, ...styles.value }, value: draft.voiceLanguage, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => mutate((next) => { next.voiceLanguage = event.currentTarget.value as PetSettings['voiceLanguage'] }) },
            React.createElement('option', { value: 'system' }, c.followSystem),
            React.createElement('option', { value: 'zh-CN' }, c.chinese),
            React.createElement('option', { value: 'en-US' }, c.english))),
        React.createElement('p', { style: { ...styles.hint, margin: '0 0 5px' } }, c.voiceHint)))),
    React.createElement('details', { open: movementOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setMovementOpen(event.currentTarget.open), style: styles.details },
      React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, movementOpen ? '▼' : '▶'), React.createElement('span', null, c.behaviorDisplay)),
      React.createElement('div', { style: styles.disclosureBody },
        toggleRow(c.walking, draft.walkingEnabled, (value) => mutate((next) => { next.walkingEnabled = value })),
        draft.walkingEnabled && React.createElement(React.Fragment, null,
          movementSlider(c.frequency, draft.wanderFrequency, [c.veryOccasional, c.occasional, c.sometimes, c.frequent, c.veryFrequent], (value) => mutate((next) => { next.wanderFrequency = value })),
          movementSlider(c.distance, draft.wanderDistance, [c.tinyStep, c.easyStep, c.bigStep], (value) => mutate((next) => { next.wanderDistance = value }))),
        toggleRow(c.chase, draft.mouseChaseEnabled, (value) => mutate((next) => { next.mouseChaseEnabled = value })),
        draft.mouseChaseEnabled && movementSlider(c.chaseSpeed, draft.mouseChaseSpeed, [c.slow, c.lively, c.speedy], (value) => mutate((next) => { next.mouseChaseSpeed = value })),
        toggleRow(c.fling, draft.flingEnabled, (value) => mutate((next) => { next.flingEnabled = value })),
        draft.flingEnabled && movementSlider(c.resistance, draft.flingResistance, [c.lowResistance, c.balancedResistance, c.highResistance], (value) => mutate((next) => { next.flingResistance = value })),
        toggleRow(c.showOnFullScreen, draft.showOnFullScreen, (value) => mutate((next) => { next.showOnFullScreen = value })),
        toggleRow(c.motion, draft.reducedMotion, (value) => mutate((next) => { next.reducedMotion = value })))),
    React.createElement('details', { open: shortcutsOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setShortcutsOpen(event.currentTarget.open), style: styles.details },
      React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, shortcutsOpen ? '▼' : '▶'), React.createElement('span', null, c.shortcutsStartup)),
      React.createElement('div', { style: styles.disclosureBody },
        toggleRow(c.autoLaunch, draft.autoLaunch, (value) => mutate((next) => { next.autoLaunch = value })),
        React.createElement('div', { style: styles.row }, c.summon,
          React.createElement('div', { style: { ...styles.value, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 16px', alignItems: 'center', gap: 8 } },
            React.createElement('div', { style: { minWidth: 0 } },
              React.createElement('input', {
                type: 'text', maxLength: 64, value: shortcutRecording ? c.shortcutPrompt : draft.teleportShortcut, readOnly: true, disabled: !draft.teleportShortcutEnabled,
                style: { ...styles.textInput, width: '100%', cursor: draft.teleportShortcutEnabled ? 'pointer' : 'default', opacity: draft.teleportShortcutEnabled ? 1 : 0.45, ...(shortcutRecording ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)', boxShadow: '0 0 0 2px color-mix(in srgb, var(--dsw-alias-accent-primary, #1688f8) 20%, transparent)' } : {}) },
                'aria-label': c.summonShortcut, 'aria-describedby': 'xy-pet-shortcut-hint',
                onFocus: () => setShortcutRecording(true),
                onBlur: () => setShortcutRecording(false),
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'Escape') { event.preventDefault(); event.currentTarget.blur(); return }
                  const shortcut = shortcutFromKey(event)
                  if (!shortcut) return
                  event.preventDefault()
                  mutate((next) => { next.teleportShortcut = shortcut })
                  setShortcutRecording(false)
                  event.currentTarget.blur()
                },
              }),
              React.createElement('div', { id: 'xy-pet-shortcut-hint', style: { ...styles.hint, marginTop: 4 } }, shortcutRecording ? c.shortcutPrompt : c.shortcutHint)),
            React.createElement('input', { type: 'checkbox', style: styles.checkbox, checked: draft.teleportShortcutEnabled, 'aria-label': c.summon, onChange: (event: React.ChangeEvent<HTMLInputElement>) => mutate((next) => { next.teleportShortcutEnabled = event.currentTarget.checked }) }))),
        draft.teleportShortcutEnabled && toggleRow(c.summonChat, draft.teleportOpensRecentChat, (value) => mutate((next) => { next.teleportOpensRecentChat = value })),
        React.createElement('div', { style: styles.row },
          React.createElement('span', null,
            /Windows/i.test(navigator.userAgent) ? c.explorerAction : c.finderAction,
            React.createElement('span', { style: { ...styles.hint, display: 'block', marginTop: 3 } }, /Windows/i.test(navigator.userAgent) ? c.explorerActionHint : c.finderActionHint),
            fileActionFeedback && React.createElement('span', { role: 'status', style: { ...styles.hint, display: 'block', marginTop: 4, color: fileActionFeedback.ok ? 'var(--dsw-alias-accent-primary, #1688f8)' : 'var(--dsw-alias-danger, #ff6b6b)' } }, fileActionFeedback.ok ? `✓ ${fileActionFeedback.text}` : fileActionFeedback.text)),
          React.createElement('div', { style: { ...styles.value, display: 'flex', justifyContent: 'flex-end' } }, React.createElement('button', { type: 'button', style: styles.button, onClick: () => void createFinderQuickAction() }, fileActionFeedback?.ok ? `✓ ${c.installedFinderAction}` : c.installFinderAction))),
        React.createElement('details', { open: launcherOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setLauncherOpen(event.currentTarget.open), style: styles.details },
          React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, launcherOpen ? '▼' : '▶'), React.createElement('span', null, c.launcher)),
          React.createElement('div', { style: styles.disclosureBody },
            React.createElement('p', { style: styles.hint }, c.launcherHint),
            React.createElement('div', { style: styles.row }, c.launcherName, React.createElement('input', { type: 'text', maxLength: 48, value: launcherName, style: { ...styles.textInput, ...styles.value }, onChange: (event: React.ChangeEvent<HTMLInputElement>) => setLauncherName(event.currentTarget.value) })),
            React.createElement('div', { style: styles.row }, c.launcherIcon, React.createElement('div', { style: { ...styles.launcherActions, ...styles.value } },
              iconOption('calm', c.calm, calmIcon),
              iconOption('custom', launcherFile?.name ?? c.customIcon, customIconPreview),
              React.createElement('button', { type: 'button', style: { ...styles.button, height: 46, minHeight: 0, padding: '0 8px' }, onClick: () => void createLauncher() }, c.createLauncher))),
            React.createElement('input', { ref: launcherFileInput, type: 'file', accept: '.png,image/png', hidden: true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) chooseLauncherFile(file) } }))))),
    React.createElement('details', { open: menuOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setMenuOpen(event.currentTarget.open), style: styles.details },
      React.createElement('summary', { style: styles.disclosureSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, menuOpen ? '▼' : '▶'), React.createElement('span', null, c.menu)),
      React.createElement('div', { style: styles.disclosureBody },
        React.createElement('p', { style: styles.hint }, c.menuHint),
        React.createElement('div', { style: styles.checks },
          ...menuActions.map((action) => checkbox(menuLabel[action], draft.menuActions.includes(action), (checked) => mutate((next) => { next.menuActions = checked ? [...new Set([...next.menuActions, action])] : next.menuActions.filter((item) => item !== action) }))),
          ...snapshot.menuExtensions.map((action) => checkbox(action.label[locale], draft.menuActions.includes(action.id), (checked) => mutate((next) => { next.menuActions = checked ? [...new Set([...next.menuActions, action.id])] : next.menuActions.filter((item) => item !== action.id) })))))),
    React.createElement('section', { style: styles.group },
      React.createElement('h4', { style: styles.groupTitle }, c.collection),
      React.createElement('div', { style: styles.row }, c.treasuresFound, React.createElement('output', { style: { ...styles.output, ...styles.value } }, `🪎 × ${snapshot.stats.treasuresFound}`))),
    soundRemote && React.createElement(SoundSettings, { remote: soundRemote, locale, embedded: true }),
    React.createElement('div', { style: error ? styles.error : styles.status, role: 'status' }, error || status),
  )
}

function installSettingsDeepLink(): () => void {
  const request = consumePetSettingsUrl(window.location.href)
  if (!request.requested) return () => undefined
  let attempts = 0
  const timer = window.setInterval(() => {
    attempts += 1
    const target = document.querySelector<HTMLElement>('[data-xy-deepseek-pet-settings]')
    if (target && target.getClientRects().length > 0) {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' })
      window.history.replaceState(window.history.state, '', request.cleanUrl)
      window.clearInterval(timer)
      return
    }
    const trigger = document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')
    if (trigger?.getAttribute('aria-expanded') !== 'true') {
      trigger?.click()
    } else {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
      const petTab = dialog?.querySelector<HTMLButtonElement>('[role="tab"][id$="-tab-xy-deepseek-pet"]')
      if (petTab) {
        if (petTab.getAttribute('aria-selected') !== 'true') petTab.click()
      } else {
        const pluginsLabels = new Set(['插件', 'Plugins'])
        const pluginsSection = [...(dialog?.querySelectorAll<HTMLButtonElement>('nav button') ?? [])]
          .find((button) => pluginsLabels.has(button.textContent?.trim() ?? ''))
        if (pluginsSection?.getAttribute('aria-current') !== 'true') pluginsSection?.click()
      }
    }
    if (attempts >= 100) window.clearInterval(timer)
  }, 50)
  return () => window.clearInterval(timer)
}

export async function apply(ctx: any): Promise<() => Promise<void>> {
  const presenceKey = '__xyDeepSeekPetSettingsPresent'
  const presenceEvent = 'xy-deepseek-pet-settings-presence'
  ;(globalThis as any)[presenceKey] = true
  globalThis.dispatchEvent?.(new Event(presenceEvent))
  const disposeFileDrops = installPetFileDropIsolation()
  const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE)
  const settingsFiber = ctx.inject(['remote.xyPet'], (scope: any) => {
    const remote = scope.remote.xyPet as PetRemote
    scope.slots.inject('settings.plugins.tab', () => scope.slots.register({ name: 'settings.plugins.tab', id: 'xy-deepseek-pet', order: 100, label: useChinese() ? '桌面宠物' : 'Desktop pet' }, () => React.createElement(PetSettingsView, { remote })))
  })
  const soundsFiber = ctx.inject(['remote.xySounds'], (scope: any) => { soundsRemote = scope.remote.xySounds as SoundsRemote; for (const listener of soundRemoteListeners) listener(soundsRemote) })
  await Promise.all([settingsFiber, soundsFiber])
  const disposeSettingsDeepLink = installSettingsDeepLink()
  return async () => {
    disposeFileDrops()
    disposeSettingsDeepLink()
    soundsRemote = undefined
    for (const listener of soundRemoteListeners) listener(undefined)
    await Promise.all([settingsFiber.dispose(), soundsFiber.dispose()])
    await unmountRemote()
    ;(globalThis as any)[presenceKey] = false
    globalThis.dispatchEvent?.(new Event(presenceEvent))
  }
}
