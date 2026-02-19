import { useState, useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/core'

interface EditorContextMenuProps {
  editor: Editor | null
}

interface CtxItem {
  label: string
  shortcut?: string
  action: () => void
}

interface CtxSep {
  separator: true
}

type CtxEntry = CtxItem | CtxSep

export function EditorContextMenu({ editor }: EditorContextMenuProps): JSX.Element | null {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const hide = useCallback(() => setVisible(false), [])

  // Right-click handler on editor
  useEffect(() => {
    if (!editor) return
    const editorEl = editor.view.dom
    const handler = (e: MouseEvent) => {
      e.preventDefault()
      setPosition({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    editorEl.addEventListener('contextmenu', handler)
    return () => editorEl.removeEventListener('contextmenu', handler)
  }, [editor])

  // Close on click outside, Escape, or scroll
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) hide()
    }
    const onScroll = () => hide()
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [visible, hide])

  // Adjust position to stay in viewport
  useEffect(() => {
    if (!visible || !menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let { x, y } = position
    if (x + rect.width > vw) x = vw - rect.width - 4
    if (y + rect.height > vh) y = vh - rect.height - 4
    if (x !== position.x || y !== position.y) setPosition({ x, y })
  }, [visible])

  if (!visible || !editor) return null

  const hasSelection = !editor.state.selection.empty

  const items: CtxEntry[] = []

  // Text formatting (when text selected)
  if (hasSelection) {
    items.push(
      { label: 'Bold', shortcut: 'Ctrl+B', action: () => editor.chain().focus().toggleBold().run() },
      { label: 'Italic', shortcut: 'Ctrl+I', action: () => editor.chain().focus().toggleItalic().run() },
      { label: 'Underline', shortcut: 'Ctrl+U', action: () => editor.chain().focus().toggleUnderline().run() },
      { label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run() },
      { label: 'Code', action: () => editor.chain().focus().toggleCode().run() },
      { separator: true }
    )
  }

  // Link section
  if (hasSelection) {
    items.push({
      label: 'Insert Link',
      shortcut: 'Ctrl+L',
      action: () => window.dispatchEvent(new CustomEvent('skrybl:toggle-link-bubble'))
    })
  }
  if (editor.isActive('link')) {
    const href = editor.getAttributes('link').href
    if (href) {
      items.push({
        label: 'Open Link',
        action: () => window.open(href, '_blank')
      })
    }
    items.push({
      label: 'Remove Link',
      action: () => editor.chain().focus().extendMarkRange('link').unsetLink().run()
    })
  }
  if (hasSelection || editor.isActive('link')) {
    items.push({ separator: true })
  }

  // Block section
  items.push(
    { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run() },
    { separator: true }
  )

  // Insert section
  items.push(
    { label: 'Inline Math', shortcut: 'Ctrl+Shift+E', action: () => editor.chain().focus().insertContent({ type: 'inlineMath', attrs: { latex: '' } }).run() },
    { label: 'Block Math', action: () => editor.chain().focus().insertContent({ type: 'blockMath', attrs: { latex: '' } }).run() },
    { label: 'Compute Field', shortcut: 'Ctrl+Shift+=', action: () => editor.chain().focus().insertContent({ type: 'computeField', attrs: { expression: '' } }).run() },
    { label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run() },
    { separator: true }
  )

  // Clipboard
  items.push(
    { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
    { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
    { label: 'Paste', shortcut: 'Ctrl+V', action: () => navigator.clipboard.readText().then((t) => editor.chain().focus().insertContent(t).run()).catch(() => {}) }
  )

  const handleItemClick = (action: () => void) => {
    hide()
    action()
  }

  return (
    <div
      ref={menuRef}
      className="editor-ctx-menu"
      style={{ top: position.y, left: position.x }}
    >
      {items.map((item, i) =>
        'separator' in item ? (
          <div key={i} className="editor-ctx-separator" />
        ) : (
          <button
            key={i}
            className="editor-ctx-item"
            onClick={() => handleItemClick(item.action)}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="editor-ctx-shortcut">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  )
}
