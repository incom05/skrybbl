import { useState, useEffect, useRef, useCallback } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { evaluateSymbolic, type SymbolicOp } from '../../lib/symbolic-engine'

const OP_LABELS: Record<SymbolicOp, string> = {
  simplify: 'Simplify',
  expand: 'Expand',
  factor: 'Factor',
  solve: 'Solve',
  differentiate: 'Differentiate',
  integrate: 'Integrate'
}

const OPERATIONS: SymbolicOp[] = ['simplify', 'expand', 'factor', 'solve', 'differentiate', 'integrate']
const NEEDS_VARIABLE: SymbolicOp[] = ['solve', 'differentiate', 'integrate']

export function SymbolicBlockView({ node, updateAttributes, selected }: NodeViewProps): JSX.Element {
  const { expression, operation, variable, result, error } = node.attrs
  const [editing, setEditing] = useState(!expression)
  const [liveExpr, setLiveExpr] = useState(expression || '')
  const [liveOp, setLiveOp] = useState<SymbolicOp>(operation || 'simplify')
  const [liveVar, setLiveVar] = useState(variable || 'x')
  const [liveResult, setLiveResult] = useState(result || '')
  const [liveError, setLiveError] = useState(error || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [editing])

  const runEval = useCallback((expr: string, op: SymbolicOp, v: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { result: r, error: e } = await evaluateSymbolic(expr, op, v)
      setLiveResult(r)
      setLiveError(e)
    }, 250)
  }, [])

  const handleExprChange = useCallback((value: string) => {
    setLiveExpr(value)
    runEval(value, liveOp, liveVar)
  }, [liveOp, liveVar, runEval])

  const handleOpChange = useCallback((op: SymbolicOp) => {
    setLiveOp(op)
    runEval(liveExpr, op, liveVar)
  }, [liveExpr, liveVar, runEval])

  const handleVarChange = useCallback((v: string) => {
    setLiveVar(v)
    runEval(liveExpr, liveOp, v)
  }, [liveExpr, liveOp, runEval])

  const commit = useCallback(() => {
    updateAttributes({
      expression: liveExpr,
      operation: liveOp,
      variable: liveVar,
      result: liveResult,
      error: liveError
    })
    setEditing(false)
  }, [liveExpr, liveOp, liveVar, liveResult, liveError, updateAttributes])

  if (editing) {
    return (
      <NodeViewWrapper contentEditable={false} className="symbolic-block editing">
        <div className="symbolic-block-controls">
          <select
            className="symbolic-block-select"
            value={liveOp}
            onChange={(e) => handleOpChange(e.target.value as SymbolicOp)}
          >
            {OPERATIONS.map((op) => (
              <option key={op} value={op}>{OP_LABELS[op]}</option>
            ))}
          </select>

          <input
            ref={inputRef}
            className="symbolic-block-input"
            value={liveExpr}
            onChange={(e) => handleExprChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); commit() }
            }}
            placeholder="expression..."
            spellCheck={false}
          />

          {NEEDS_VARIABLE.includes(liveOp) && (
            <input
              className="symbolic-block-var"
              value={liveVar}
              onChange={(e) => handleVarChange(e.target.value)}
              placeholder="var"
              spellCheck={false}
            />
          )}

          <button className="symbolic-block-done" onClick={commit}>Done</button>
        </div>

        {(liveResult || liveError) && (
          <div className={`symbolic-block-output ${liveError ? 'error' : ''}`}>
            {liveError || liveResult}
          </div>
        )}
      </NodeViewWrapper>
    )
  }

  // Display mode
  if (!expression) {
    return (
      <NodeViewWrapper
        contentEditable={false}
        className="symbolic-block placeholder"
        onClick={() => setEditing(true)}
      >
        <span className="symbolic-block-label">Symbolic — click to edit</span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      contentEditable={false}
      className={`symbolic-block ${selected ? 'selected' : ''}`}
      onClick={() => setEditing(true)}
    >
      <span className="symbolic-block-label">{OP_LABELS[operation as SymbolicOp] || 'Simplify'}</span>
      <span className="symbolic-block-expr">{expression}</span>
      {result && !error && (
        <>
          <span className="symbolic-block-arrow">=</span>
          <span className="symbolic-block-result">{result}</span>
        </>
      )}
      {error && <span className="symbolic-block-error">{error}</span>}
    </NodeViewWrapper>
  )
}
