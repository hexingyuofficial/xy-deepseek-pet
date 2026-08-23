import { describe, expect, it } from 'vitest'
import { chatTextWithPaths, imageMediaType, mergeComposerPaths } from './composer-attachments.js'

describe('composer attachments', () => {
  it('accepts only Harness-supported raster image formats', () => {
    expect(imageMediaType({ name: 'screen.PNG', type: '' })).toBe('image/png')
    expect(imageMediaType({ name: 'photo.jpg', type: 'image/jpeg' })).toBe('image/jpeg')
    expect(imageMediaType({ name: 'vector.svg', type: 'image/svg+xml' })).toBeUndefined()
  })

  it('deduplicates and bounds absolute file paths', () => {
    expect(mergeComposerPaths(['/tmp/a.txt'], ['/tmp/a.txt', '/tmp/b.txt', 'relative.txt'])).toEqual([
      '/tmp/a.txt',
      '/tmp/b.txt',
    ])
  })

  it('adds ordinary files as explicit paths without changing an empty draft unnecessarily', () => {
    expect(chatTextWithPaths('请检查', ['/tmp/a.txt'], 'zh-CN')).toBe('请检查\n\n文件路径：\n/tmp/a.txt')
    expect(chatTextWithPaths('', ['C:\\Users\\me\\a.txt'], 'en')).toBe('File path:\nC:\\Users\\me\\a.txt')
  })
})
