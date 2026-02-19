import { useState, useEffect, useRef, useCallback } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { renderDiagram } from '../../lib/diagram-engine'

export function DiagramBlockView({ node, updateAttributes, selected }: NodeViewProps): JSX.Element {
  const { code, svg, error } = node.attrs
  const [editing, setEditing] = useState(!code)
  const [liveCode, setLiveCode] = useState(code || '')
  const [liveSvg, setLiveSvg] = useState(svg || '')
  const [liveError, setLiveError] = useState(error || '')
  const [rendering, setRendering] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [editing])

  // Auto-render on mount if code exists but svg is empty
  useEffect(() => {
    if (code && !svg && !editing) {
      renderDiagram(code).then(({ svg: s, error: e }) => {
        setLiveSvg(s)
        setLiveError(e)
        updateAttributes({ svg: s, error: e })
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePreview = useCallback(async () => {
    if (!liveCode.trim()) return
    setRendering(true)
    const { svg: s, error: e } = await renderDiagram(liveCode)
    setLiveSvg(s)
    setLiveError(e)
    setRendering(false)
  }, [liveCode])

  const commit = useCallback(() => {
    updateAttributes({
      code: liveCode,
      svg: liveSvg,
      error: liveError
    })
    setEditing(false)
  }, [liveCode, liveSvg, liveError, updateAttributes])

  if (editing) {
    return (
      <NodeViewWrapper contentEditable={false} className="diagram-block editing">
        <textarea
          ref={textareaRef}
          className="diagram-block-textarea"
          value={liveCode}
          onChange={(e) => setLiveCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); commit() }
          }}
          placeholder={`graph LR\n  A["Start"] --> B["End"]`}
          spellCheck={false}
          rows={6}
        />

        <div className="diagram-block-actions">
          <button className="diagram-block-btn" onClick={handlePreview} disabled={rendering}>
            {rendering ? 'Rendering...' : 'Preview'}
          </button>
          <button className="diagram-block-btn" onClick={commit}>Done</button>
        </div>

        {liveError && <div className="diagram-block-error">{liveError}</div>}
        {liveSvg && !liveError && (
          <div className="diagram-block-preview" dangerouslySetInnerHTML={{ __html: liveSvg }} />
        )}
      </NodeViewWrapper>
    )
  }

  // Display mode
  if (!code && !svg) {
    return (
      <NodeViewWrapper
        contentEditable={false}
        className="diagram-block placeholder"
        onClick={() => setEditing(true)}
      >
        <span className="diagram-block-placeholder-text">Diagram — click to edit</span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      contentEditable={false}
      className={`diagram-block ${selected ? 'selected' : ''}`}
      onClick={() => setEditing(true)}
    >
      {svg ? (
        <div className="diagram-block-render" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="diagram-block-code-preview">
          <pre>{code}</pre>
        </div>
      )}
      {error && <div className="diagram-block-error">{error}</div>}
    </NodeViewWrapper>
  )
}
