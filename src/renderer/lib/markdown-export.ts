import type { JSONContent } from '@tiptap/core'
import type { Notebook } from '../types'

export function notebookToMarkdown(notebook: Notebook): string {
  const lines: string[] = []

  lines.push(`# ${notebook.title}`)
  lines.push('')

  for (const page of notebook.pages) {
    if (notebook.pages.length > 1) {
      lines.push(`## ${page.title}`)
      lines.push('')
    }
    if (page.content?.content) {
      lines.push(contentToMd(page.content.content))
    }
    lines.push('')
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n')
}

function contentToMd(nodes: JSONContent[]): string {
  const lines: string[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level ?? 1
        const prefix = '#'.repeat(level + 1) // +1 because notebook title is H1
        lines.push(`${prefix} ${inlineToMd(node.content)}`)
        lines.push('')
        break
      }

      case 'paragraph':
        lines.push(inlineToMd(node.content))
        lines.push('')
        break

      case 'bulletList':
        if (node.content) {
          for (const li of node.content) {
            lines.push(`- ${inlineToMd(li.content?.[0]?.content)}`)
          }
        }
        lines.push('')
        break

      case 'orderedList':
        if (node.content) {
          node.content.forEach((li, i) => {
            lines.push(`${i + 1}. ${inlineToMd(li.content?.[0]?.content)}`)
          })
        }
        lines.push('')
        break

      case 'blockquote':
        if (node.content) {
          const inner = contentToMd(node.content).split('\n')
          for (const line of inner) {
            lines.push(`> ${line}`)
          }
        }
        lines.push('')
        break

      case 'codeBlock': {
        const lang = node.attrs?.language || ''
        lines.push('```' + lang)
        lines.push(node.content?.map((n) => n.text || '').join('') || '')
        lines.push('```')
        lines.push('')
        break
      }

      case 'horizontalRule':
        lines.push('---')
        lines.push('')
        break

      case 'blockMath': {
        const lbl = node.attrs?.label || ''
        lines.push('$$')
        lines.push(node.attrs?.latex || '')
        lines.push('$$')
        if (node.attrs?.numbered && lbl) {
          lines.push(`<!-- eq:${lbl} -->`)
        }
        lines.push('')
        break
      }

      case 'image': {
        const imgAlt = node.attrs?.alt || 'image'
        lines.push(`![${imgAlt}](image)`)
        lines.push('')
        break
      }

      case 'graphPlot': {
        const funcs = JSON.parse(node.attrs?.functions || '[]')
        const exprs = funcs.map((f: any) => f.expression).join(', ')
        lines.push(`<!-- Graph: ${exprs} -->`)
        lines.push('')
        break
      }
    }
  }

  return lines.join('\n')
}

function inlineToMd(nodes?: JSONContent[]): string {
  if (!nodes) return ''

  return nodes
    .map((node) => {
      if (node.type === 'inlineMath') {
        return `$${node.attrs?.latex || ''}$`
      }

      if (node.type === 'computeField') {
        const expr = node.attrs?.expression || ''
        const result = node.attrs?.result || ''
        return result ? `\`${expr} = ${result}\`` : `\`${expr}\``
      }

      if (node.type === 'text') {
        let text = node.text || ''
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'bold':
                text = `**${text}**`
                break
              case 'italic':
                text = `*${text}*`
                break
              case 'strike':
                text = `~~${text}~~`
                break
              case 'code':
                text = `\`${text}\``
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
