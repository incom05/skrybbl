import type { JSONContent } from '@tiptap/core'
import type { Notebook } from '../types'

export function notebookToLatex(notebook: Notebook): string {
  const lines: string[] = [
    '\\documentclass{article}',
    '\\usepackage{amsmath}',
    '\\usepackage{amssymb}',
    '\\usepackage{enumitem}',
    '',
    `\\title{${escapeLatex(notebook.title)}}`,
    '\\date{}',
    '',
    '\\begin{document}',
    '\\maketitle',
    ''
  ]

  for (const page of notebook.pages) {
    if (notebook.pages.length > 1) {
      lines.push(`\\section*{${escapeLatex(page.title)}}`)
      lines.push('')
    }
    if (page.content?.content) {
      lines.push(contentToLatex(page.content.content))
    }
    lines.push('')
  }

  lines.push('\\end{document}')
  return lines.join('\n')
}

function contentToLatex(nodes: JSONContent[]): string {
  const lines: string[] = []
  let i = 0

  while (i < nodes.length) {
    const node = nodes[i]

    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level ?? 1
        const cmds = ['\\section', '\\subsection', '\\subsubsection']
        const cmd = cmds[level - 1] || cmds[0]
        lines.push(`${cmd}{${inlineToLatex(node.content)}}`)
        lines.push('')
        break
      }

      case 'paragraph':
        lines.push(inlineToLatex(node.content))
        lines.push('')
        break

      case 'bulletList': {
        lines.push('\\begin{itemize}')
        if (node.content) {
          for (const li of node.content) {
            lines.push(`  \\item ${inlineToLatex(li.content?.[0]?.content)}`)
          }
        }
        lines.push('\\end{itemize}')
        lines.push('')
        break
      }

      case 'orderedList': {
        lines.push('\\begin{enumerate}')
        if (node.content) {
          for (const li of node.content) {
            lines.push(`  \\item ${inlineToLatex(li.content?.[0]?.content)}`)
          }
        }
        lines.push('\\end{enumerate}')
        lines.push('')
        break
      }

      case 'blockquote':
        lines.push('\\begin{quote}')
        if (node.content) {
          lines.push(contentToLatex(node.content))
        }
        lines.push('\\end{quote}')
        lines.push('')
        break

      case 'codeBlock':
        lines.push('\\begin{verbatim}')
        lines.push(node.content?.map(n => n.text || '').join('') || '')
        lines.push('\\end{verbatim}')
        lines.push('')
        break

      case 'horizontalRule':
        lines.push('\\noindent\\rule{\\textwidth}{0.4pt}')
        lines.push('')
        break

      case 'blockMath':
        if (node.attrs?.numbered) {
          const lbl = node.attrs?.label ? `\\label{${escapeLatex(node.attrs.label)}}` : ''
          lines.push(`\\begin{equation}${lbl}`)
          lines.push(node.attrs?.latex || '')
          lines.push('\\end{equation}')
        } else {
          lines.push(`\\[${node.attrs?.latex || ''}\\]`)
        }
        lines.push('')
        break

      case 'image': {
        const altText = node.attrs?.alt || 'image'
        lines.push(`% [Image: ${escapeLatex(altText)}]`)
        lines.push('')
        break
      }

      case 'graphPlot': {
        const funcs = JSON.parse(node.attrs?.functions || '[]')
        const exprs = funcs.map((f: { expression: string }) => f.expression).filter(Boolean)
        if (exprs.length) {
          lines.push(`% Graph: ${exprs.join(', ')}`)
        } else {
          lines.push('% Graph plot (empty)')
        }
        lines.push('')
        break
      }

      default:
        break
    }

    i++
  }

  return lines.join('\n')
}

function inlineToLatex(nodes?: JSONContent[]): string {
  if (!nodes) return ''

  return nodes
    .map((node) => {
      if (node.type === 'inlineMath') {
        return `$${node.attrs?.latex || ''}$`
      }

      if (node.type === 'computeField') {
        const expr = node.attrs?.expression || ''
        const result = node.attrs?.result || ''
        return result ? `${expr} = ${result}` : expr
      }

      if (node.type === 'text') {
        let text = escapeLatex(node.text || '')
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'bold':
                text = `\\textbf{${text}}`
                break
              case 'italic':
                text = `\\textit{${text}}`
                break
              case 'strike':
                text = `\\sout{${text}}`
                break
              case 'code':
                text = `\\texttt{${text}}`
                break
              case 'subscript':
                text = `\\textsubscript{${text}}`
                break
              case 'superscript':
                text = `\\textsuperscript{${text}}`
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

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}~^]/g, (char) => `\\${char}`)
}
