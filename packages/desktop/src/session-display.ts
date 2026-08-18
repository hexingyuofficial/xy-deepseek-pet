export type PetDisplayLocale = 'zh-CN' | 'en'

export function displaySessionTitle(title: string, locale: PetDisplayLocale): string {
  const normalized = title.replace(/\s+/g, ' ').trim()
  return normalized || (locale === 'zh-CN' ? '未命名会话' : 'Untitled session')
}

export function formatSessionAge(updatedAt: number, now: number, locale: PetDisplayLocale): string {
  const seconds = Math.max(0, Math.floor((now - updatedAt) / 1000))
  if (seconds < 30) return locale === 'zh-CN' ? '刚刚' : 'now'
  if (seconds < 60) return locale === 'zh-CN' ? `${seconds}秒前` : `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return locale === 'zh-CN' ? `${minutes}分钟前` : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale === 'zh-CN' ? `${hours}小时前` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return locale === 'zh-CN' ? `${days}天前` : `${days}d ago`
}
