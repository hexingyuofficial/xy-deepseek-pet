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

  it('renders headings and tables in the detailed activity view', () => {
    const html = renderMarkdown('### 结果\n\n| 项目 | 状态 |\n| --- | --- |\n| 桌宠 | 完成 |')
    expect(html).toContain('<h3>结果</h3>')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>项目</th>')
    expect(html).toContain('<td>完成</td>')
  })

  it('never renders hidden think blocks in compact or detailed messages', () => {
    expect(renderMarkdown('<think>private reasoning</think>\n\n### 收到')).not.toContain('private reasoning')
    expect(renderMarkdownInline('<think>private reasoning</think> 收到')).toBe(' 收到')
  })
})
