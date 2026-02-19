import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useState, useCallback, useRef } from 'react'

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps): JSX.Element {
  const { src, alt, width } = node.attrs
  const [isEditingAlt, setIsEditingAlt] = useState(false)
  const [altText, setAltText] = useState(alt || '')
  const [resizing, setResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleDoubleClick = useCallback(() => {
    setAltText(alt || '')
    setIsEditingAlt(true)
  }, [alt])

  const handleAltSave = useCallback(() => {
    updateAttributes({ alt: altText })
    setIsEditingAlt(false)
  }, [altText, updateAttributes])

  const handleAltKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAltSave()
      }
      if (e.key === 'Escape') {
        setIsEditingAlt(false)
      }
    },
    [handleAltSave]
  )

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = imgRef.current?.offsetWidth || 400

      const handleMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startXRef.current
        const newWidth = Math.max(100, startWidthRef.current + delta)
        updateAttributes({ width: newWidth })
      }

      const handleUp = () => {
        setResizing(false)
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    },
    [updateAttributes]
  )

  return (
    <NodeViewWrapper className={`image-node ${selected ? 'image-selected' : ''}`}>
      <div className="image-node-container" style={{ width: width ? `${width}px` : undefined }}>
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          draggable={false}
          onDoubleClick={handleDoubleClick}
        />
        {selected && (
          <div
            className="image-resize-handle"
            onMouseDown={handleResizeStart}
            style={{ cursor: resizing ? 'col-resize' : undefined }}
          />
        )}
      </div>

      {isEditingAlt && (
        <div className="image-alt-editor">
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={handleAltSave}
            onKeyDown={handleAltKeyDown}
            placeholder="Alt text..."
            autoFocus
          />
        </div>
      )}

      {!isEditingAlt && alt && (
        <div className="image-alt-display" onDoubleClick={handleDoubleClick}>
          {alt}
        </div>
      )}
    </NodeViewWrapper>
  )
}
