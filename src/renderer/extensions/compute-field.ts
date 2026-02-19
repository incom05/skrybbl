import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ComputeFieldView } from '../components/Compute/ComputeFieldView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    computeField: {
      insertComputeField: () => ReturnType
    }
  }
}

export const ComputeField = Node.create({
  name: 'computeField',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      expression: { default: '' },
      result: { default: '' },
      error: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-compute-field]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-compute-field': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ComputeFieldView)
  },

  addCommands() {
    return {
      insertComputeField:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { expression: '', result: '', error: '' }
          })
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Ctrl-Shift-=': () => this.editor.commands.insertComputeField()
    }
  }
})
