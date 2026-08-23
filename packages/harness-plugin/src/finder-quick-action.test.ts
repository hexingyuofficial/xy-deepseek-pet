import { describe, expect, it } from 'vitest'
import { join, sep } from 'node:path'
import { fileQuickActionPackageRoot, finderQuickActionDocument, finderQuickActionInfo, windowsSendToArguments } from './finder-quick-action.js'

describe('Finder Quick Action', () => {
  it('passes Finder selections as arguments without evaluating their paths', () => {
    const document = finderQuickActionDocument("/tmp/pet's helper")
    expect(document).toContain('&quot;$@&quot;')
    expect(document).toContain("/tmp/pet'\\''s helper")
    expect(document).toContain('com.apple.Automator.fileSystemObject')
    expect(document).not.toContain('eval ')
  })

  it('creates bounded Windows Send To arguments without a shell command', () => {
    expect(windowsSendToArguments('C:\\Program Files\\XY Pet\\launch.mjs'))
      .toBe('"C:\\Program Files\\XY Pet\\launch.mjs" --finder-compose')
  })

  it('registers a modern Finder service bundle for selected files', () => {
    const info = finderQuickActionInfo()
    expect(info).toContain('<key>NSServices</key>')
    expect(info).toContain('<key>NSSendFileTypes</key><array><string>public.item</string></array>')
    expect(info).toContain('<string>runWorkflowAsService</string>')
  })

  it('resolves package roots before writing launch commands', () => {
    const root = fileQuickActionPackageRoot('./packages/harness-plugin')
    expect(root).toContain(`${sep}packages${sep}harness-plugin`)
    expect(root).toBe(join(process.cwd(), 'packages', 'harness-plugin'))
  })
})
