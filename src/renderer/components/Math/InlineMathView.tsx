import { NodeViewWrapper } from '@tiptap/react'
import { MathField } from './MathField'
import type { NodeViewProps } from '@tiptap/react'

export function InlineMathView({ node, updateAttributes, selected }: NodeViewProps): JSX.Element {
  return (
    <NodeViewWrapper
      as="span"
      className={`math-node-inline ${selected ? 'math-selected' : ''}`}
      contentEditable={false}
    >
      <MathField
        latex={node.attrs.latex}
        onChange={(latex) => updateAttributes({ latex })}
        isBlock={false}
      />
    </NodeViewWrapper>
  )
}
