import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { InlineMathView } from '../components/Math/InlineMathView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      insertInlineMath: (latex?: string) => ReturnType
    }
  }
}

export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      latex: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-math"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathView, {
      stopEvent: () => true,
      ignoreMutation: () => true
    })
  },

  addCommands() {
    return {
      insertInlineMath:
        (latex = '') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex }
          })
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-e': () => this.editor.commands.insertInlineMath()
    }
  }
})
