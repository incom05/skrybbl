import type { JSONContent } from '@tiptap/core'
import type { Notebook } from '../types'
import type { GraphSvgMap } from './graph-to-svg'

let eqCounter = 0
const eqMap = new Map<string, number>()
let nodeCounter = 0

export function notebookToHtml(notebook: Notebook, graphSvgs?: GraphSvgMap): string {
  eqCounter = 0
  eqMap.clear()
  nodeCounter = 0
  const pages: string[] = []

  for (const page of notebook.pages) {
    const parts: string[] = []
    if (notebook.pages.length > 1) {
      parts.push(`<h2>${esc(page.title)}</h2>`)
    }
    if (page.content?.content) {
      parts.push(contentToHtml(page.content.content, graphSvgs))
    }
    pages.push(parts.join('\n'))
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(notebook.title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css" media="(prefers-color-scheme: dark)">
<script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
<script defer>document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('pre code[class]').forEach(el=>hljs.highlightElement(el))})</script>
<style>
:root {
  --text: #1a1a1a;
  --text-secondary: #555;
  --bg: #fdfdfd;
  --bg-code: #f4f4f4;
  --border: #e0e0e0;
  --font-body: 'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --text: #d4d4d4;
    --text-secondary: #999;
    --bg: #0a0a0a;
    --bg-code: #141414;
    --border: #2a2a2a;
  }
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 17px; }
body {
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
  line-height: 1.75;
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 96px;
  -webkit-font-smoothing: antialiased;
}
h1 { font-size: 2.2rem; font-weight: 750; letter-spacing: -0.03em; line-height: 1.15; margin: 0 0 0.4em; }
h2 { font-size: 1.5rem; font-weight: 650; letter-spacing: -0.02em; line-height: 1.25; margin: 2em 0 0.4em; }
h3 { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.01em; text-transform: uppercase; color: var(--text-secondary); margin: 1.8em 0 0.3em; }
p { margin: 0 0 1em; }
ul, ol { padding-left: 1.5em; margin: 0 0 1em; }
li { margin: 0.2em 0; }
blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1.2em;
  margin: 1em 0;
  color: var(--text-secondary);
  font-style: italic;
}
code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--bg-code);
  border: 1px solid var(--border);
  padding: 0.15em 0.4em;
  border-radius: 3px;
}
pre {
  background: var(--bg-code);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1em 1.2em;
  margin: 1em 0;
  overflow-x: auto;
}
pre code { background: none; border: none; padding: 0; font-size: 0.85rem; line-height: 1.6; }
hr { border: none; height: 1px; background: var(--border); margin: 2em 0; }
.math-block { text-align: center; margin: 1.5em 0; }
.compute { font-family: var(--font-mono); font-size: 0.9em; }
.graph-block { text-align: center; margin: 1.5em 0; }
.graph-block svg { max-width: 100%; height: auto; }
img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; }
</style>
</head>
<body>
<article>
<h1>${esc(notebook.title)}</h1>
${pages.join('\n<hr>\n')}
</article>
</body>
</html>`
}

function contentToHtml(nodes: JSONContent[], graphSvgs?: GraphSvgMap): string {
  const parts: string[] = []

  for (const node of nodes) {
    const currentIdx = nodeCounter++

    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level ?? 1
        const tag = `h${Math.min(level + 1, 6)}`
        parts.push(`<${tag}>${inlineToHtml(node.content)}</${tag}>`)
        break
      }

      case 'paragraph':
        parts.push(`<p>${inlineToHtml(node.content)}</p>`)
        break

      case 'bulletList': {
        const items = (node.content || [])
          .map((li) => `<li>${inlineToHtml(li.content?.[0]?.content)}</li>`)
          .join('\n')
        parts.push(`<ul>\n${items}\n</ul>`)
        break
      }

      case 'orderedList': {
        const items = (node.content || [])
          .map((li) => `<li>${inlineToHtml(li.content?.[0]?.content)}</li>`)
          .join('\n')
        parts.push(`<ol>\n${items}\n</ol>`)
        break
      }

      case 'blockquote':
        if (node.content) {
          parts.push(`<blockquote>\n${contentToHtml(node.content, graphSvgs)}\n</blockquote>`)
        }
        break

      case 'codeBlock': {
        const code = node.content?.map((n) => n.text || '').join('') || ''
        const lang = node.attrs?.language || ''
        const langClass = lang ? ` class="language-${esc(lang)}"` : ''
        parts.push(`<pre><code${langClass}>${esc(code)}</code></pre>`)
        break
      }

      case 'horizontalRule':
        parts.push('<hr>')
        break

      case 'blockMath': {
        const latex = node.attrs?.latex || ''
        if (node.attrs?.numbered) {
          eqCounter++
          const lbl = node.attrs?.label || ''
          const id = lbl ? ` id="${esc(lbl)}"` : ''
          parts.push(`<div class="math-block"${id}>$$${esc(latex)}$$<span class="eq-number">(${eqCounter})</span></div>`)
          if (lbl) eqMap.set(lbl, eqCounter)
        } else {
          parts.push(`<div class="math-block">$$${esc(latex)}$$</div>`)
        }
        break
      }

      case 'image': {
        const src = node.attrs?.src || ''
        const alt = esc(node.attrs?.alt || 'image')
        parts.push(`<img src="${esc(src)}" alt="${alt}">`)
        break
      }

      case 'graphPlot': {
        const svg = graphSvgs?.get(currentIdx)
        if (svg) {
          const title = node.attrs?.title ? `<p style="text-align:center;color:var(--text-secondary);font-size:0.9em;">${esc(node.attrs.title)}</p>` : ''
          parts.push(`<div class="graph-block">${svg}${title}</div>`)
        } else {
          const funcs = JSON.parse(node.attrs?.functions || '[]')
          const exprs = funcs.map((f: { expression: string }) => esc(f.expression)).filter(Boolean)
          const title = node.attrs?.title ? esc(node.attrs.title) : ''
          const label = title || (exprs.length ? `Graph: ${exprs.join(', ')}` : 'Graph')
          parts.push(`<p><em>[${label}]</em></p>`)
        }
        break
      }
    }
  }

  return parts.join('\n')
}

function inlineToHtml(nodes?: JSONContent[]): string {
  if (!nodes) return ''

  return nodes
    .map((node) => {
      if (node.type === 'inlineMath') {
        return `$${esc(node.attrs?.latex || '')}$`
      }

      if (node.type === 'computeField') {
        const expr = node.attrs?.expression || ''
        const result = node.attrs?.result || ''
        const display = result ? `${esc(expr)} = ${esc(result)}` : esc(expr)
        return `<code class="compute">${display}</code>`
      }

      if (node.type === 'text') {
        let text = esc(node.text || '')
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'bold':
                text = `<strong>${text}</strong>`
                break
              case 'italic':
                text = `<em>${text}</em>`
                break
              case 'strike':
                text = `<s>${text}</s>`
                break
              case 'code':
                text = `<code>${text}</code>`
                break
              case 'subscript':
                text = `<sub>${text}</sub>`
                break
              case 'superscript':
                text = `<sup>${text}</sup>`
                break
            }
          }
        }
        return text
      }

      return ''
    })
    .join('')
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
