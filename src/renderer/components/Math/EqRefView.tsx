import { useState, useMemo, useCallback } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

export function EqRefView({ node, updateAttributes, editor, selected }: NodeViewProps): JSX.Element {
  const { label } = node.attrs
  const [editing, setEditing] = useState(!label)

  // Compute the equation number for this label
  const eqNumber = useMemo(() => {
    if (!label || !editor) return 0
    let count = 0
    let found = 0
    editor.state.doc.descendants((n) => {
      if (n.type.name === 'blockMath' && n.attrs.numbered) {
        count++
        if (n.attrs.label === label && found === 0) {
          found = count
        }
      }
    })
    return found
  }, [label, editor])

  const scrollToEquation = useCallback(() => {
    if (!label || !editor) return
    let targetPos = -1
    editor.state.doc.descendants((n, pos) => {
      if (targetPos === -1 && n.type.name === 'blockMath' && n.attrs.label === label) {
        targetPos = pos
      }
    })
    if (targetPos >= 0) {
      editor.commands.setTextSelection(targetPos)
      // Scroll into view
      const dom = editor.view.domAtPos(targetPos)
      if (dom.node instanceof HTMLElement) {
        dom.node.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (dom.node.parentElement) {
        dom.node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [label, editor])

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="eq-ref editing">
        <input
          className="eq-ref-input"
          value={label || ''}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault()
              setEditing(false)
            }
          }}
          onBlur={() => setEditing(false)}
          placeholder="eq:label"
          spellCheck={false}
          autoFocus
        />
      </NodeViewWrapper>
    )
  }

  if (!label) {
    return (
      <NodeViewWrapper
        as="span"
        className="eq-ref placeholder"
        onClick={() => setEditing(true)}
      >
        (ref?)
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`eq-ref ${selected ? 'selected' : ''}`}
      onClick={scrollToEquation}
      onDoubleClick={() => setEditing(true)}
      title={`Equation ref: ${label}`}
    >
      ({eqNumber || '?'})
    </NodeViewWrapper>
  )
}
