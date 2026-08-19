import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const markdown = await readFile(join(root, 'README.md'), 'utf8')

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function rewriteUrl(url) {
  if (/^(https?:|mailto:|#|data:)/i.test(url)) return url
  const cleaned = url.replace(/^\.\//, '')
  if (cleaned.startsWith('docs/readme/')) return cleaned.slice('docs/readme/'.length)
  return `../../${cleaned}`
}

function rewriteHtml(fragment) {
  return fragment.replace(/(src|href)="([^"]+)"/g, (_, attr, url) => `${attr}="${escapeHtml(rewriteUrl(url))}"`)
}

function inline(text) {
  const codes = []
  let html = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(escapeHtml(code))
    return `@@CODE${codes.length - 1}@@`
  })
  html = rewriteHtml(html)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => `<img src="${escapeHtml(rewriteUrl(url))}" alt="${escapeHtml(alt)}">`)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `<a href="${escapeHtml(rewriteUrl(url))}">${label}</a>`)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  return html.replace(/@@CODE(\d+)@@/g, (_, index) => `<code>${codes[Number(index)]}</code>`)
}

function slug(title) {
  return title.replace(/[^\w\u4e00-\u9fff\- ]+/g, '').trim().replaceAll(' ', '-').toLowerCase()
}

const lines = markdown.split(/\r?\n/)
const out = []
let i = 0
let paragraph = []
let table = []
let inCode = false
let codeLang = ''
let codeBuf = []

function flushParagraph() {
  if (!paragraph.length) return
  const raw = paragraph.join('\n')
  out.push(raw.trimStart().startsWith('<') ? rewriteHtml(raw) : `<p>${inline(raw)}</p>`)
  paragraph = []
}

function flushTable() {
  if (!table.length) return
  const rows = table.map((row) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
  const [header, ...rest] = rows
  const body = rest[0] && rest[0].every((cell) => /^:?-{3,}:?$/.test(cell)) ? rest.slice(1) : rest
  out.push(
    `<div class="table-wrap"><table><thead><tr>${header.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${
      body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')
    }</tbody></table></div>`,
  )
  table = []
}

while (i < lines.length) {
  const line = lines[i]
  if (line.startsWith('```')) {
    flushParagraph()
    flushTable()
    if (!inCode) {
      inCode = true
      codeLang = line.slice(3).trim()
      codeBuf = []
    } else {
      out.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join('\n'))}\n</code></pre>`)
      inCode = false
    }
    i += 1
    continue
  }
  if (inCode) {
    codeBuf.push(line)
    i += 1
    continue
  }
  if (line.startsWith('|')) {
    flushParagraph()
    table.push(line)
    i += 1
    continue
  }
  if (table.length) flushTable()
  if (line.startsWith('## ')) {
    flushParagraph()
    const title = line.slice(3).trim()
    out.push(`<h2 id="${slug(title)}">${inline(title)}</h2>`)
    i += 1
    continue
  }
  if (/^\d+\.\s/.test(line)) {
    flushParagraph()
    const items = []
    while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
      let item = inline(lines[i].replace(/^\d+\.\s/, ''))
      i += 1
      const extra = []
      while (i < lines.length && (lines[i].startsWith('   ') || lines[i].startsWith('\t'))) {
        extra.push(lines[i].startsWith('   ') ? lines[i].slice(3) : lines[i].slice(1))
        i += 1
      }
      if (extra.length) {
        let j = 0
        while (j < extra.length) {
          if (extra[j].startsWith('```')) {
            const buf = []
            j += 1
            while (j < extra.length && extra[j].trim() !== '```') {
              buf.push(extra[j])
              j += 1
            }
            if (j < extra.length) j += 1
            item += `<pre><code>${escapeHtml(buf.join('\n'))}\n</code></pre>`
          } else if (extra[j].trim()) {
            item += `<p>${inline(extra[j].trim())}</p>`
            j += 1
          } else {
            j += 1
          }
        }
      }
      items.push(`<li>${item}</li>`)
    }
    out.push(`<ol>${items.join('')}</ol>`)
    continue
  }
  if (line.startsWith('- ')) {
    flushParagraph()
    const items = []
    while (i < lines.length && lines[i].startsWith('- ')) {
      items.push(`<li>${inline(lines[i].slice(2))}</li>`)
      i += 1
    }
    out.push(`<ul>${items.join('')}</ul>`)
    continue
  }
  if (line.trim() === '') {
    flushParagraph()
    i += 1
    continue
  }
  paragraph.push(line)
  i += 1
}
flushParagraph()
flushTable()

const page = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>README 本地预览 · XY DeepSeek Pet</title>
  <style>
    :root { color-scheme: dark; --bg:#0d1117; --panel:#161b22; --text:#e6edf3; --muted:#8b949e; --border:#30363d; --link:#58a6ff; }
    * { box-sizing: border-box; }
    body { margin:0; font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans GB","PingFang SC",sans-serif; background:var(--bg); color:var(--text); }
    .bar { position:sticky; top:0; z-index:5; display:flex; justify-content:space-between; gap:12px; padding:10px 20px; border-bottom:1px solid var(--border); background:#010409; font-size:13px; color:var(--muted); }
    .wrap { max-width:920px; margin:0 auto; padding:32px 20px 80px; }
    article { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:32px 36px 48px; }
    h1 { text-align:center; font-size:2rem; margin:.4em 0 .6em; }
    h2 { border-bottom:1px solid var(--border); padding-bottom:.3em; margin-top:2em; }
    p { margin:.8em 0; }
    a { color:var(--link); }
    img { max-width:100%; height:auto; }
    p[align="center"], h1[align="center"] { text-align:center; }
    ul,ol { padding-left:1.4em; }
    code { background:#21262d; padding:.12em .35em; border-radius:6px; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:.9em; }
    pre { background:#0d1117; border:1px solid var(--border); border-radius:8px; padding:14px 16px; overflow:auto; }
    pre code { background:none; padding:0; }
    .table-wrap { overflow:auto; margin:1em 0; }
    table { border-collapse:collapse; width:100%; }
    th,td { border:1px solid var(--border); padding:8px 10px; text-align:left; }
    th { background:#21262d; }
  </style>
</head>
<body>
  <div class="bar">
    <div>本地预览 · 改 README.md 后运行 node scripts/preview-readme.mjs 再刷新</div>
    <div>中文是主文档</div>
  </div>
  <div class="wrap"><article>
${out.join('\n')}
  </article></div>
</body>
</html>
`

const dest = join(root, 'docs/readme/preview.html')
await writeFile(dest, page)
console.log(`updated ${dest}`)
