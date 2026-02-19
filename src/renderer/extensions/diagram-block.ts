import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { DiagramBlockView } from '../components/Diagram/DiagramBlockView'

export const DiagramBlock = Node.create({
  name: 'diagramBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: { default: '' },
      svg: { default: '' },
      error: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-diagram-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-diagram-block': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramBlockView)
  }
})
