import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { SoundChannel, SoundConfig } from './config.js'
import type { SoundSettingsSnapshot } from './controller.js'

export type RemoteResult<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }
export interface SoundsRemote {
  snapshot(): Promise<RemoteResult<SoundSettingsSnapshot>>
  update(config: SoundConfig): Promise<RemoteResult<SoundSettingsSnapshot>>
  importSound(fileName: string, dataBase64: string): Promise<RemoteResult<SoundSettingsSnapshot>>
  removeSound(id: string): Promise<RemoteResult<SoundSettingsSnapshot>>
  restoreBuiltIns(): Promise<RemoteResult<SoundSettingsSnapshot>>
  preview(channel: SoundChannel, soundId: string): Promise<RemoteResult<void>>
}

const CHANNELS: readonly SoundChannel[] = ['turnComplete', 'toolSuccess', 'toolFailure']
function remoteValue<T>(result: RemoteResult<T>): T { if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`); return result.value }
function toBase64(buffer: ArrayBuffer): string { const bytes = new Uint8Array(buffer); let binary = ''; for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)); return btoa(binary) }
function browserUsesChinese(): boolean { return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') }

const copy = {
  en: { title: 'Sound notifications', mute: 'Mute all', masterVolume: 'Master volume', volume: 'Volume', more: 'More settings', turnComplete: 'Task complete', toolSuccess: 'Tool succeeded', toolFailure: 'Tool failed', enabled: 'Enabled', preview: 'Preview', delete: 'Delete', choose: 'Choose sound', drop: 'Drop your sound here', browse: 'Choose file', restore: 'Restore built-ins', saved: 'Saved', loading: 'Loading…', custom: 'Custom', behavior: 'Behavior', quietShort: 'Silence short tasks', frequency: 'Tool frequency', quiet: 'Quiet', normal: 'Normal', every: 'Every result', seconds: 's' },
  zh: { title: '提示音', mute: '全部静音', masterVolume: '总体音量', volume: '音量', more: '更多设置', turnComplete: '任务完成', toolSuccess: '工具成功', toolFailure: '工具失败', enabled: '启用', preview: '试听', delete: '删除', choose: '选择声音', drop: '拖入你喜欢的声音', browse: '选择文件', restore: '恢复内置声音', saved: '已保存', loading: '加载中…', custom: '自定义', behavior: '提醒行为', quietShort: '短任务不提醒', frequency: '工具提示频率', quiet: '安静', normal: '正常', every: '每次结果', seconds: '秒' },
} as const

const styles: Record<string, React.CSSProperties> = {
  root: { alignSelf: 'start', width: '100%', minHeight: 0, color: 'var(--dsw-alias-label-primary, #f4f5f6)', marginTop: 8, borderTop: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1))' },
  header: { minHeight: 42, display: 'flex', alignItems: 'center' },
  title: { margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0 },
  moreSummary: { minHeight: 38, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', listStyle: 'none', fontSize: 13 },
  disclosure: { display: 'inline-block', width: 12, flex: '0 0 12px', fontSize: 10, lineHeight: 1, textAlign: 'center' },
  content: { padding: '0 0 8px' },
  moreBody: { padding: '0 0 4px 18px' },
  row: { display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) minmax(170px, 1.4fr)', gap: 12, alignItems: 'center', minHeight: 42 },
  channel: { padding: '2px 0', borderTop: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.07))' },
  channelSummary: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 40, cursor: 'pointer', fontSize: 13 },
  channelBody: { padding: '2px 0 10px 18px' },
  controls: { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 6 },
  choices: { display: 'flex', flexWrap: 'wrap', gap: 6, margin: '5px 0 8px' },
  button: { minHeight: 32, border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))', borderRadius: 6, padding: '0 10px', background: 'transparent', color: 'inherit', cursor: 'pointer' },
  active: { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)', background: 'var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))' },
  range: { width: '100%', accentColor: 'var(--dsw-alias-accent-primary, #1688f8)' },
  check: { width: 16, height: 16, accentColor: 'var(--dsw-alias-accent-primary, #1688f8)' },
  drop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 44, padding: '6px 8px', border: '1px dashed var(--dsw-alias-border-l2, rgba(255,255,255,.22))', borderRadius: 6, fontSize: 12 },
  hint: { color: 'var(--dsw-alias-label-secondary, #aeb3bb)', fontSize: 12 },
  status: { minHeight: 18, fontSize: 12, color: 'var(--dsw-alias-label-secondary, #aeb3bb)' },
  error: { minHeight: 18, fontSize: 12, color: 'var(--dsw-alias-danger, #ff6b6b)' },
}

export function SoundSettings({ remote, locale, embedded = false }: { remote: SoundsRemote; locale?: 'zh-CN' | 'en'; embedded?: boolean }): React.ReactElement {
  const c = locale === 'zh-CN' || (!locale && browserUsesChinese()) ? copy.zh : copy.en
  const [snapshot, setSnapshot] = useState<SoundSettingsSnapshot>()
  const [draft, setDraft] = useState<SoundConfig>()
  const [status, setStatus] = useState<string>(c.loading)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState<SoundChannel>()
  const [moreOpen, setMoreOpen] = useState(false)
  const fileInputs = useRef<Partial<Record<SoundChannel, HTMLInputElement | null>>>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const saveRevision = useRef(0)

  useEffect(() => { let live = true; remote.snapshot().then(remoteValue).then((value) => { if (live) { setSnapshot(value); setDraft(value.config); setStatus('') } }).catch((reason: unknown) => live && setError(String(reason))); return () => { live = false; if (saveTimer.current) clearTimeout(saveTimer.current) } }, [remote])
  const commit = useCallback(async (next: SoundConfig) => { const revision = ++saveRevision.current; setDraft(next); setError(''); setStatus('…'); try { const value = remoteValue(await remote.update(next)); if (revision === saveRevision.current) { setSnapshot(value); setDraft(value.config); setStatus(c.saved) } } catch (reason) { setError(String(reason)); setStatus('') } }, [c.saved, remote])
  const mutate = useCallback((change: (next: SoundConfig) => void) => { setDraft((current) => { if (!current) return current; const next = structuredClone(current); change(next); if (saveTimer.current) clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => void commit(next), 160); return next }) }, [commit])
  const importFile = useCallback(async (channel: SoundChannel, file: File) => {
    if (!snapshot || !draft) return
    setError('')
    if (file.size === 0 || file.size > snapshot.limits.maximumBytes) { setError(locale === 'zh-CN' ? '声音文件不能超过 10 MiB' : 'Sound must be no larger than 10 MiB'); return }
    setStatus('…')
    try {
      const oldIds = new Set(snapshot.sounds.map((sound) => sound.id))
      const imported = remoteValue(await remote.importSound(file.name, toBase64(await file.arrayBuffer())))
      const newSound = imported.sounds.find((sound) => !oldIds.has(sound.id) && sound.channels.includes(channel))
      const next = structuredClone(imported.config)
      if (newSound) next.channels[channel].soundId = newSound.id
      const value = remoteValue(await remote.update(next))
      setSnapshot(value); setDraft(value.config); setStatus(c.saved)
    } catch (reason) { setError(String(reason)); setStatus('') }
  }, [c.saved, draft, locale, remote, snapshot])

  if (!snapshot || !draft) return React.createElement('div', { style: { ...styles.root, ...(embedded ? {} : { borderTop: 0 }) } },
    React.createElement('div', { style: styles.header }, React.createElement('h3', { style: styles.title }, c.title)),
    React.createElement('div', { style: error ? styles.error : styles.status, role: 'status' }, error || status))
  const range = (value: number, onChange: (value: number) => void, max = 1, step = 0.05, label: string = c.volume) => React.createElement('input', { type: 'range', min: 0, max, step, value, style: styles.range, 'aria-label': label, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(Number(event.currentTarget.value)) })
  const frequency = draft.toolCooldownMs >= 4_000 ? 'quiet' : draft.toolCooldownMs === 0 && draft.toolCoalesceMs === 0 ? 'every' : 'normal'
  const setFrequency = (value: 'quiet' | 'normal' | 'every') => mutate((next) => { if (value === 'quiet') { next.toolCooldownMs = 5_000; next.toolCoalesceMs = 800 } else if (value === 'every') { next.toolCooldownMs = 0; next.toolCoalesceMs = 0 } else { next.toolCooldownMs = 1_500; next.toolCoalesceMs = 400 } })

  const channels = CHANNELS.map((channel) => {
    const config = draft.channels[channel]
    const sounds = snapshot.sounds.filter((sound) => sound.channels.includes(channel))
    const selected = sounds.find((sound) => sound.id === config.soundId)
    return React.createElement('details', { key: channel, style: styles.channel },
      React.createElement('summary', { style: styles.channelSummary }, React.createElement('span', null, c[channel]), React.createElement('span', { style: styles.controls }, React.createElement('span', { style: styles.hint }, selected?.displayName ?? config.soundId), React.createElement('input', { type: 'checkbox', style: styles.check, title: c.enabled, checked: config.enabled, onClick: (event: React.MouseEvent) => event.stopPropagation(), onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const checked = event.currentTarget.checked; mutate((next) => { next.channels[channel].enabled = checked }) } }))),
      React.createElement('div', { style: styles.channelBody },
        React.createElement('div', { style: styles.choices }, ...sounds.map((sound) => React.createElement('button', { key: sound.id, type: 'button', style: { ...styles.button, ...(sound.id === config.soundId ? styles.active : {}) }, onClick: () => mutate((next) => { next.channels[channel].soundId = sound.id }) }, sound.displayName))),
        React.createElement('div', { style: styles.row }, `${c.volume} · ${Math.round(config.volume * 100)}%`, range(config.volume, (value) => mutate((next) => { next.channels[channel].volume = value }))),
        React.createElement('div', { style: styles.controls }, React.createElement('button', { type: 'button', style: styles.button, onClick: () => remote.preview(channel, config.soundId).then(remoteValue).catch((reason: unknown) => setError(String(reason))) }, c.preview), !selected?.builtIn && React.createElement('button', { type: 'button', style: styles.button, onClick: async () => { try { const value = remoteValue(await remote.removeSound(config.soundId)); setSnapshot(value); setDraft(value.config) } catch (reason) { setError(String(reason)) } } }, c.delete)),
        React.createElement('div', { style: { ...styles.drop, ...(dragging === channel ? { borderColor: 'var(--dsw-alias-accent-primary, #1688f8)' } : {}) }, onDragEnter: (event: React.DragEvent) => { event.preventDefault(); setDragging(channel) }, onDragOver: (event: React.DragEvent) => event.preventDefault(), onDragLeave: () => setDragging(undefined), onDrop: (event: React.DragEvent) => { event.preventDefault(); setDragging(undefined); const file = event.dataTransfer.files[0]; if (file) void importFile(channel, file) } }, React.createElement('span', null, c.drop), React.createElement('button', { type: 'button', style: styles.button, onClick: () => fileInputs.current[channel]?.click() }, c.browse)),
        React.createElement('input', { ref: (element: HTMLInputElement | null) => { fileInputs.current[channel] = element }, type: 'file', accept: '.wav,.mp3,.ogg,audio/wav,audio/mpeg,audio/ogg', hidden: true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void importFile(channel, file) } }),
      ))
  })

  return React.createElement('div', { style: { ...styles.root, ...(embedded ? {} : { borderTop: 0 }) } },
    React.createElement('div', { style: styles.header }, React.createElement('h3', { style: styles.title }, c.title)),
    React.createElement('div', { style: styles.content },
      React.createElement('div', { style: styles.row }, `${c.masterVolume} · ${Math.round(draft.masterVolume * 100)}%`, range(draft.masterVolume, (value) => mutate((next) => { next.masterVolume = value }), 1, 0.05, c.masterVolume)),
      React.createElement('div', { style: styles.row }, c.mute, React.createElement('input', { type: 'checkbox', style: styles.check, checked: draft.masterMute, onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const checked = event.currentTarget.checked; mutate((next) => { next.masterMute = checked }) } })),
      React.createElement('details', { open: moreOpen, onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setMoreOpen(event.currentTarget.open) },
        React.createElement('summary', { style: styles.moreSummary }, React.createElement('span', { style: styles.disclosure, 'aria-hidden': true }, moreOpen ? '▼' : '▶'), React.createElement('span', null, c.more)),
        React.createElement('div', { style: styles.moreBody },
          ...channels,
          React.createElement('details', { style: styles.channel }, React.createElement('summary', { style: styles.channelSummary }, c.behavior), React.createElement('div', { style: styles.channelBody },
            React.createElement('div', { style: styles.row }, `${c.quietShort} · ${Math.round(draft.minimumTurnDurationMs / 100) / 10} ${c.seconds}`, range(draft.minimumTurnDurationMs, (value) => mutate((next) => { next.minimumTurnDurationMs = value }), 60_000, 500, c.quietShort)),
            React.createElement('div', { style: styles.row }, c.frequency, React.createElement('div', { style: styles.controls }, ...(['quiet', 'normal', 'every'] as const).map((value) => React.createElement('button', { key: value, type: 'button', style: { ...styles.button, ...(frequency === value ? styles.active : {}) }, onClick: () => setFrequency(value) }, c[value])))),
            React.createElement('button', { type: 'button', style: styles.button, onClick: async () => { try { const value = remoteValue(await remote.restoreBuiltIns()); setSnapshot(value); setDraft(value.config); setStatus(c.saved) } catch (reason) { setError(String(reason)) } } }, c.restore),
          )),
        )),
      React.createElement('div', { style: error ? styles.error : styles.status, role: 'status' }, error || status),
    ),
  )
}
