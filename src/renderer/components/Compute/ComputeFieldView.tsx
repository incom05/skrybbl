import { useState, useEffect, useRef, useCallback } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { evaluate } from '../../lib/math-engine'

export function ComputeFieldView({ node, updateAttributes, selected }: NodeViewProps): JSX.Element {
  const { expression, result, error } = node.attrs
  const [editing, setEditing] = useState(!expression)
  const [liveExpr, setLiveExpr] = useState(expression || '')
  const [liveResult, setLiveResult] = useState(result || '')
  const [liveError, setLiveError] = useState(error || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Focus input on edit
  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [editing])

  // Live evaluation on keystroke
  const handleChange = useCallback((value: string) => {
    setLiveExpr(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { result: r, error: e } = await evaluate(value)
      setLiveResult(r || '')
      setLiveError(e || '')
    }, 150)
  }, [])

  const commitAndClose = useCallback(() => {
    updateAttributes({
      expression: liveExpr,
      result: liveResult,
      error: liveError
    })
    setEditing(false)
  }, [liveExpr, liveResult, liveError, updateAttributes])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        commitAndClose()
      }
    },
    [commitAndClose]
  )

  // Edit mode
  if (editing) {
    return (
      <NodeViewWrapper as="span" className="compute-field-editing">
        <input
          ref={inputRef}
          className="compute-field-input"
          value={liveExpr}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitAndClose}
          placeholder="expression..."
          spellCheck={false}
        />
        {liveResult && (
          <span className="compute-field-live-result">= {liveResult}</span>
        )}
        {liveError && (
          <span className="compute-field-live-result">{liveError}</span>
        )}
      </NodeViewWrapper>
    )
  }

  // Display mode
  if (!expression) {
    return (
      <NodeViewWrapper
        as="span"
        className="compute-field-inline"
        onClick={() => setEditing(true)}
        style={{ cursor: 'pointer' }}
      >
        <span className="compute-field-expression" style={{ fontStyle: 'italic' }}>
          compute...
        </span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`compute-field-inline ${selected ? 'math-selected' : ''}`}
      onClick={() => setEditing(true)}
      style={{ cursor: 'pointer' }}
    >
      <span className={error ? 'compute-field-error' : 'compute-field-expression'}>
        {expression}
      </span>
      {result && !error && (
        <>
          <span className="compute-field-arrow">&rarr;</span>
          <span className="compute-field-result">{result}</span>
        </>
      )}
    </NodeViewWrapper>
  )
}
