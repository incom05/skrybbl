import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export const CodeBlockHighlight = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Tab: ({ editor }) => {
        if (!editor.isActive('codeBlock')) return false
        editor.commands.insertContent('  ')
        return true
      },
      'Shift-Tab': ({ editor }) => {
        if (!editor.isActive('codeBlock')) return false
        // Remove up to 2 leading spaces from current line
        const { state } = editor
        const { $from } = state.selection
        const lineStart = $from.start()
        const textBefore = state.doc.textBetween(lineStart, $from.pos)
        // Find start of current line
        const lastNewline = textBefore.lastIndexOf('\n')
        const lineOffset = lastNewline === -1 ? 0 : lastNewline + 1
        const lineText = textBefore.slice(lineOffset)
        const spaces = lineText.match(/^ {1,2}/)?.[0].length || 0
        if (spaces > 0) {
          const from = lineStart + lineOffset
          editor.commands.deleteRange({ from, to: from + spaces })
        }
        return true
      }
    }
  }
}).configure({
  lowlight
})
