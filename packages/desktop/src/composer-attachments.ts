import { MAX_CHAT_IMAGES, MAX_CHAT_IMAGE_BYTES, type PetChatImageType } from '@xy-deepseek-pet/protocol'

export { MAX_CHAT_IMAGES, MAX_CHAT_IMAGE_BYTES }

const IMAGE_TYPES: Record<string, PetChatImageType> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export function imageMediaType(file: Pick<File, 'name' | 'type'>): PetChatImageType | undefined {
  if (Object.values(IMAGE_TYPES).includes(file.type as PetChatImageType)) return file.type as PetChatImageType
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  return IMAGE_TYPES[extension]
}

function absolutePath(path: string): boolean {
  return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith('\\\\')
}

export function mergeComposerPaths(current: readonly string[], additions: readonly string[]): string[] {
  const paths = new Set(current)
  for (const path of additions) {
    const normalized = path.trim()
    if (normalized.length > 0 && normalized.length <= 4096 && absolutePath(normalized)) paths.add(normalized)
    if (paths.size >= 8) break
  }
  return [...paths]
}

export function chatTextWithPaths(text: string, paths: readonly string[], locale: 'zh-CN' | 'en'): string {
  const trimmed = text.trim()
  if (!paths.length) return trimmed
  const label = locale === 'zh-CN'
    ? '文件路径：'
    : (paths.length === 1 ? 'File path:' : 'File paths:')
  return `${trimmed ? `${trimmed}\n\n` : ''}${label}\n${paths.join('\n')}`
}

export async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }
  return btoa(binary)
}
