import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('composer attachment wiring', () => {
  const renderer = readFileSync(new URL('./renderer.ts', import.meta.url), 'utf8')
  const preload = readFileSync(new URL('./preload.ts', import.meta.url), 'utf8')

  it('limits paste and drop handling to the expanded composer', () => {
    expect(renderer).toMatch(/input\.addEventListener\('paste',[\s\S]*?addComposerFiles/)
    expect(renderer).toMatch(/composer\.addEventListener\('drop',[\s\S]*?addComposerFiles/)
    expect(renderer).not.toMatch(/document\.addEventListener\('drop'/)
  })

  it('uses Electron webUtils instead of the removed File.path API', () => {
    expect(preload).toContain('webUtils.getPathForFile(file)')
    expect(renderer).not.toContain('.path as')
  })

  it('keeps attachment drafts unless Harness acknowledges the message', () => {
    const submit = renderer.slice(renderer.indexOf('async function submitComposer'), renderer.indexOf("pixelMenu.addEventListener('click'"))
    expect(submit).toMatch(/if \(result\.ok\) \{[\s\S]*?composerAttachments\.delete\(sessionId\)/)
    expect(submit).toMatch(/else if \(result\.error\) \{[\s\S]*?setComposerFeedback/)
  })
})
