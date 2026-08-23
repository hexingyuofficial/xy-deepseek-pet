import MarkdownIt from 'markdown-it'
import { stripThinkBlocks } from '@xy-deepseek-pet/protocol'

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: false,
  typographer: false,
})

// Desktop messages are untrusted. Keep labels from links and images, but never
// create navigable or network-loading elements inside the pet window.
markdown.renderer.rules.link_open = () => ''
markdown.renderer.rules.link_close = () => ''
markdown.renderer.rules.image = (tokens, index) => markdown.utils.escapeHtml(tokens[index]?.content ?? '')

export function renderMarkdown(text: string): string {
  return markdown.render(stripThinkBlocks(text))
}

export function renderMarkdownInline(text: string): string {
  return markdown.renderInline(stripThinkBlocks(text).replace(/[\r\n]+/g, ' '))
}
