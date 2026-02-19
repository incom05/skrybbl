import { useCallback } from 'react'
import type { GraphFunc } from './GraphPlotView'

interface GraphEditorProps {
  functions: GraphFunc[]
  xDomain: [number, number]
  yDomain: [number, number]
  title: string
  onUpdateFunctions: (fns: GraphFunc[]) => void
  onUpdateDomains: (xd: [number, number], yd: [number, number]) => void
  onUpdateTitle: (title: string) => void
}

export function GraphEditor({
  functions,
  xDomain,
  yDomain,
  title,
  onUpdateFunctions,
  onUpdateDomains,
  onUpdateTitle
}: GraphEditorProps): JSX.Element {
  const updateExpr = useCallback(
    (index: number, expression: string) => {
      const updated = [...functions]
      updated[index] = { ...updated[index], expression }
      onUpdateFunctions(updated)
    },
    [functions, onUpdateFunctions]
  )

  const addFunction = useCallback(() => {
    onUpdateFunctions([...functions, { expression: '', style: 'solid' }])
  }, [functions, onUpdateFunctions])

  const removeFunction = useCallback(
    (index: number) => {
      if (functions.length <= 1) return
      onUpdateFunctions(functions.filter((_, i) => i !== index))
    },
    [functions, onUpdateFunctions]
  )

  return (
    <div className="graph-plot-editor">
      {/* Caption/title */}
      <div className="graph-plot-func-row">
        <span style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)', minWidth: 50 }}>
          Caption
        </span>
        <input
          className="graph-plot-func-input"
          value={title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Graph title..."
          spellCheck={false}
        />
      </div>

      {/* Function expressions */}
      {functions.map((fn, i) => (
        <div key={i} className="graph-plot-func-row">
          <span style={{ color: 'var(--text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 50 }}>
            f{functions.length > 1 ? i + 1 : ''}(x)
          </span>
          <input
            className="graph-plot-func-input"
            value={fn.expression}
            onChange={(e) => updateExpr(i, e.target.value)}
            placeholder="e.g. sin(x)"
            spellCheck={false}
          />
          {functions.length > 1 && (
            <button className="graph-plot-btn" onClick={() => removeFunction(i)}>
              &times;
            </button>
          )}
        </div>
      ))}

      <div className="graph-plot-func-row">
        <button className="graph-plot-btn" onClick={addFunction}>
          + Add function
        </button>
      </div>

      <div className="graph-plot-func-row" style={{ gap: 12 }}>
        <label style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          X:
        </label>
        <input
          className="graph-plot-func-input"
          style={{ width: 60, flex: 'none' }}
          type="number"
          value={xDomain[0]}
          onChange={(e) => onUpdateDomains([parseFloat(e.target.value) || -6.28, xDomain[1]], yDomain)}
        />
        <span style={{ color: 'var(--text-faint)' }}>to</span>
        <input
          className="graph-plot-func-input"
          style={{ width: 60, flex: 'none' }}
          type="number"
          value={xDomain[1]}
          onChange={(e) => onUpdateDomains([xDomain[0], parseFloat(e.target.value) || 6.28], yDomain)}
        />

        <label style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)', marginLeft: 12 }}>
          Y:
        </label>
        <input
          className="graph-plot-func-input"
          style={{ width: 60, flex: 'none' }}
          type="number"
          value={yDomain[0]}
          onChange={(e) => onUpdateDomains(xDomain, [parseFloat(e.target.value) || -2, yDomain[1]])}
        />
        <span style={{ color: 'var(--text-faint)' }}>to</span>
        <input
          className="graph-plot-func-input"
          style={{ width: 60, flex: 'none' }}
          type="number"
          value={yDomain[1]}
          onChange={(e) => onUpdateDomains(xDomain, [yDomain[0], parseFloat(e.target.value) || 2])}
        />
      </div>
    </div>
  )
}
