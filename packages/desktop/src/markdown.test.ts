import { describe, expect, it } from 'vitest'
import { renderMarkdown, renderMarkdownInline } from './markdown.js'

describe('desktop Markdown rendering', () => {
  it('renders common message formatting', () => {
    const html = renderMarkdown('**重点**\n\n- 第一项\n- `pet.json`')
    expect(html).toContain('<strong>重点</strong>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<code>pet.json</code>')
  })

  it('does not create executable, navigable, or loading elements', () => {
    const html = renderMarkdown('<script>alert(1)</script> [网页](https://example.com) ![追踪](https://example.com/pixel.png)')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<a ')
    expect(html).not.toContain('<img')
    expect(html).toContain('网页')
    expect(html).toContain('追踪')
  })

  it('keeps collapsed summaries on one line', () => {
    expect(renderMarkdownInline('**完成**\n下一行')).toBe('<strong>完成</strong> 下一行')
  })
})
