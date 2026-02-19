import { Extension, InputRule } from '@tiptap/core'

export const MathInputRules = Extension.create({
  name: 'mathInputRules',

  addInputRules() {
    return [
      // $...$ -> inline math
      // Match: $<content>$ where content is non-empty and doesn't contain $
      new InputRule({
        find: /(?:^|\s)\$([^$]+)\$$/,
        handler: ({ state, range, match }) => {
          const latex = match[1].trim()
          if (!latex) return

          const { tr } = state
          // Adjust range to not include leading space if present
          const from = match[0].startsWith(' ') || match[0].startsWith('\n')
            ? range.from + 1
            : range.from
          tr.replaceWith(
            from,
            range.to,
            state.schema.nodes.inlineMath.create({ latex })
          )
        }
      }),

      // $$ at the start of a line -> block math
      new InputRule({
        find: /^\$\$$/,
        handler: ({ state, range }) => {
          const { tr } = state
          tr.replaceWith(
            range.from,
            range.to,
            state.schema.nodes.blockMath.create({ latex: '' })
          )
        }
      }),

      // = at the start of a line -> compute field
      new InputRule({
        find: /^= $/,
        handler: ({ state, range }) => {
          const { tr } = state
          if (state.schema.nodes.computeField) {
            tr.replaceWith(
              range.from,
              range.to,
              state.schema.nodes.computeField.create({ expression: '', result: '', error: '' })
            )
          }
        }
      })
    ]
  }
})
