import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SymbolicBlockView } from '../components/Compute/SymbolicBlockView'

export const SymbolicBlock = Node.create({
  name: 'symbolicBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      expression: { default: '' },
      operation: { default: 'simplify' },
      variable: { default: 'x' },
      result: { default: '' },
      error: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-symbolic-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-symbolic-block': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SymbolicBlockView)
  }
})
