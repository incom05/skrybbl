import { useState, useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/core'

interface LinkBubbleProps {
  editor: Editor | null
}

export function LinkBubble({ editor }: LinkBubbleProps): JSX.Element | null {
  const [visible, setVisible] = useState(false)
  const [url, setUrl] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    if (!editor) return
    // Get current link URL if on a link
    const attrs = editor.getAttributes('link')
    setUrl(attrs.href || '')
    // Position near selection
    const { from } = editor.state.selection
    const coords = editor.view.coordsAtPos(from)
    setPosition({ top: coords.bottom + 6, left: coords.left })
    setVisible(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [editor])

  const hide = useCallback(() => {
    setVisible(false)
    setUrl('')
  }, [])

  // Listen for Ctrl+L toggle event
  useEffect(() => {
    const handler = () => {
      if (visible) {
        hide()
      } else {
        show()
      }
    }
    window.addEventListener('skrybl:toggle-link-bubble', handler)
    return () => window.removeEventListener('skrybl:toggle-link-bubble', handler)
  }, [visible, show, hide])

  // Close on Escape or outside click
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    const onClick = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        hide()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [visible, hide])

  const applyLink = () => {
    if (!editor) return
    if (url.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
    }
    hide()
  }

  const removeLink = () => {
    if (!editor) return
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    hide()
  }

  if (!visible || !editor) return null

  return (
    <div
      ref={bubbleRef}
      className="link-bubble"
      style={{ top: position.top, left: position.left }}
    >
      <input
        ref={inputRef}
        type="text"
        className="link-bubble-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') applyLink()
          if (e.key === 'Escape') hide()
        }}
        placeholder="https://..."
      />
      <button className="link-bubble-btn" onClick={applyLink}>
        Apply
      </button>
      {editor.isActive('link') && (
        <button className="link-bubble-btn link-bubble-btn-remove" onClick={removeLink}>
          Remove
        </button>
      )}
    </div>
  )
}
