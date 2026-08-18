import { Service, type Context } from '@deepseek-ai/cordis'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { petRuntimeRoot } from './settings.js'

export const SAFE_MENU_INVOCATIONS = ['open-client', 'chat', 'tap', 'settings'] as const

export interface PetMenuContribution {
  id: string
  label: { 'zh-CN': string; en: string }
  invoke: (typeof SAFE_MENU_INVOCATIONS)[number]
  order?: number
}

function validateContribution(input: PetMenuContribution): PetMenuContribution {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(input.id) || input.id.length > 96) throw new Error('Pet menu action id must be a namespaced lowercase id')
  if (!SAFE_MENU_INVOCATIONS.includes(input.invoke)) throw new Error('Pet menu action must reference a registered safe invocation')
  const zh = input.label?.['zh-CN']?.trim()
  const en = input.label?.en?.trim()
  if (!zh || !en || zh.length > 40 || en.length > 60) throw new Error('Pet menu labels are required and must be short')
  return { id: input.id, label: { 'zh-CN': zh, en }, invoke: input.invoke, order: Math.max(-1000, Math.min(1000, input.order ?? 0)) }
}

export class PetMenuRegistry extends Service {
  static provide = 'xyPetMenu'
  private readonly contributions = new Map<string, PetMenuContribution>()
  private readonly outputPath = join(petRuntimeRoot(), 'menu-extensions.json')

  constructor(ctx: Context) { super(ctx, 'xyPetMenu') }

  register(input: PetMenuContribution): () => void {
    const contribution = validateContribution(input)
    if (this.contributions.has(contribution.id)) throw new Error(`Pet menu action already registered: ${contribution.id}`)
    this.contributions.set(contribution.id, contribution)
    void this.persist()
    return () => { this.contributions.delete(contribution.id); void this.persist() }
  }

  list(): PetMenuContribution[] {
    return [...this.contributions.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id))
  }

  private async persist(): Promise<void> {
    await mkdir(petRuntimeRoot(), { recursive: true, mode: 0o700 })
    const staging = `${this.outputPath}.partial-${process.pid}`
    await writeFile(staging, `${JSON.stringify(this.list(), null, 2)}\n`, { mode: 0o600 })
    await rename(staging, this.outputPath)
  }
}
