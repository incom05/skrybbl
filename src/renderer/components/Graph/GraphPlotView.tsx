import { useState, useCallback } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { GraphRenderer } from './GraphRenderer'
import { GraphEditor } from './GraphEditor'

export interface GraphFunc {
  expression: string
  style: string
}

export function GraphPlotView({ node, updateAttributes, selected }: NodeViewProps): JSX.Element {
  const [editing, setEditing] = useState(false)

  const functions: GraphFunc[] = JSON.parse(node.attrs.functions || '[]')
  const xDomain: [number, number] = JSON.parse(node.attrs.xDomain || '[-6.28,6.28]')
  const yDomain: [number, number] = JSON.parse(node.attrs.yDomain || '[-2,2]')
  const { width, height, showGrid, title } = node.attrs

  const updateFunctions = useCallback(
    (fns: GraphFunc[]) => updateAttributes({ functions: JSON.stringify(fns) }),
    [updateAttributes]
  )

  const updateDomains = useCallback(
    (xd: [number, number], yd: [number, number]) =>
      updateAttributes({
        xDomain: JSON.stringify(xd),
        yDomain: JSON.stringify(yd)
      }),
    [updateAttributes]
  )

  const updateTitle = useCallback(
    (t: string) => updateAttributes({ title: t }),
    [updateAttributes]
  )

  return (
    <NodeViewWrapper>
      <div className={`graph-plot-block ${selected ? 'graph-selected' : ''}`}>
        <div className="graph-plot-header">
          <span>{title || 'GRAPH'}</span>
          <button
            className="graph-plot-btn"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>

        <div className="graph-plot-container">
          <GraphRenderer
            functions={functions}
            xDomain={xDomain}
            yDomain={yDomain}
            width={width}
            height={height}
            showGrid={showGrid}
          />
        </div>

        {editing && (
          <GraphEditor
            functions={functions}
            xDomain={xDomain}
            yDomain={yDomain}
            title={title || ''}
            onUpdateFunctions={updateFunctions}
            onUpdateDomains={updateDomains}
            onUpdateTitle={updateTitle}
          />
        )}
      </div>
    </NodeViewWrapper>
  )
}
