import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { EqRefView } from '../components/Math/EqRefView'

export const EquationRef = Node.create({
  name: 'equationRef',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      label: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-equation-ref]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-equation-ref': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EqRefView)
  }
})
