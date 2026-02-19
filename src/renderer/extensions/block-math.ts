import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { BlockMathView } from '../components/Math/BlockMathView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockMath: {
      insertBlockMath: (latex?: string) => ReturnType
    }
  }
}

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      latex: { default: '' },
      numbered: { default: false },
      label: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="block-math"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'block-math' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockMathView, {
      stopEvent: () => true,
      ignoreMutation: () => true
    })
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => this.editor.commands.insertBlockMath()
    }
  },

  addCommands() {
    return {
      insertBlockMath:
        (latex = '') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex }
          })
        }
    }
  }
})
