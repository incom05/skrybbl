import { NodeViewWrapper } from '@tiptap/react'
import { MathField } from './MathField'
import { HandwritingOverlay } from './HandwritingOverlay'
import { hasMyScriptKeys } from '../../lib/handwriting-engine'
import { useState, useMemo } from 'react'
import type { NodeViewProps } from '@tiptap/react'

export function BlockMathView({ node, updateAttributes, selected, editor }: NodeViewProps): JSX.Element {
  const [drawOpen, setDrawOpen] = useState(false)
  const showDraw = hasMyScriptKeys()
  const { numbered } = node.attrs

  // Compute equation number by scanning doc for numbered blockMath nodes
  const eqNumber = useMemo(() => {
    if (!numbered || !editor) return 0
    let count = 0
    let found = 0
    editor.state.doc.descendants((n, pos) => {
      if (n.type.name === 'blockMath' && n.attrs.numbered) {
        count++
        // Match by position — find our own node
        if (found === 0) {
          let ourPos = -1
          editor.state.doc.descendants((check, checkPos) => {
            if (check === node && ourPos === -1) ourPos = checkPos
          })
          if (pos === ourPos) found = count
        }
      }
    })
    return found
  }, [numbered, editor, node])

  return (
    <NodeViewWrapper
      className={`math-node-block ${selected ? 'math-selected' : ''}`}
      contentEditable={false}
    >
      {showDraw && (
        <button
          className="block-math-draw-btn"
          onClick={() => setDrawOpen(true)}
          title="Draw math (handwriting recognition)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 1.5l2 2-8 8H2.5v-2l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M8.5 3.5l2 2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      )}

      <div className="block-math-body">
        <div className="block-math-field-wrap">
          <MathField
            latex={node.attrs.latex}
            onChange={(latex) => updateAttributes({ latex })}
            isBlock={true}
          />
        </div>

        {numbered && eqNumber > 0 && (
          <span className="eq-number">({eqNumber})</span>
        )}
      </div>

      {drawOpen && (
        <HandwritingOverlay
          onRecognized={(latex) => {
            updateAttributes({ latex })
            setDrawOpen(false)
          }}
          onCancel={() => setDrawOpen(false)}
        />
      )}
    </NodeViewWrapper>
  )
}
