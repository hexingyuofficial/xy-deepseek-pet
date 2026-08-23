import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('composer focus handshake', () => {
  const renderer = readFileSync(new URL('./renderer.ts', import.meta.url), 'utf8')
  const preload = readFileSync(new URL('./preload.ts', import.meta.url), 'utf8')
  const main = readFileSync(new URL('./main.ts', import.meta.url), 'utf8')

  it('activates the native window before focusing a summoned composer', () => {
    expect(renderer).toContain('await window.harnessPet.activateForInput()')
    expect(renderer).toContain("window.addEventListener('focus'")
    expect(preload).toContain("ipcRenderer.invoke('pet:activate-for-input')")
    expect(main).toContain("ipcMain.handle('pet:activate-for-input'")
    expect(main).toContain('petWindow.webContents.focus()')
  })

  it('notifies users when reply and file-compose actions have no recent session', () => {
    expect(renderer).toMatch(/function openComposer\([\s\S]*?if \(!selected\) \{\s*notifyMissingSession\(\)\s*return/)
    expect(renderer).toMatch(/function openComposerWithFiles\([\s\S]*?if \(!selected\) \{[\s\S]*?notifyMissingSession\(\)[\s\S]*?return/)
    expect(main).toContain('请先在 Harness 中开始一个会话')
    expect(main).toContain('before replying, dictating, or sending files')
  })
})
