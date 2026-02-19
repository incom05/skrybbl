import type { Editor } from '@tiptap/core'
import { useUIStore } from '../../stores/ui-store'

interface ToolbarProps {
  editor: Editor | null
}

function Btn({
  active,
  onClick,
  title,
  children,
  className = ''
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      className={`toolbar-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="toolbar-sep" />
}

const fontLabels = { mono: 'Mono', sans: 'Sans', serif: 'Serif' } as const

function FontBtn() {
  const editorFont = useUIStore((s) => s.editorFont)
  const cycleEditorFont = useUIStore((s) => s.cycleEditorFont)
  return (
    <button
      className="toolbar-btn"
      onClick={cycleEditorFont}
      title={`Editor font: ${fontLabels[editorFont]} (click to cycle)`}
      style={{ width: 'auto', padding: '0 8px', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}
    >
      {fontLabels[editorFont]}
    </button>
  )
}

export function Toolbar({ editor }: ToolbarProps): JSX.Element {
  const focusMode = useUIStore((s) => s.focusMode)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const toggleFindBar = useUIStore((s) => s.toggleFindBar)
  const theme = useUIStore((s) => s.theme)
  const cycleTheme = useUIStore((s) => s.cycleTheme)

  if (!editor) {
    return <div className="toolbar" />
  }

  return (
    <div className="toolbar">
      {/* Headings */}
      <Btn
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <span style={{ fontWeight: 700, fontSize: 12 }}>H1</span>
      </Btn>
      <Btn
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <span style={{ fontWeight: 600, fontSize: 12 }}>H2</span>
      </Btn>
      <Btn
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <span style={{ fontWeight: 500, fontSize: 12 }}>H3</span>
      </Btn>

      <Sep />

      {/* Text formatting */}
      <Btn
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <strong style={{ fontSize: 13 }}>B</strong>
      </Btn>
      <Btn
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <em style={{ fontSize: 13 }}>I</em>
      </Btn>
      <Btn
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <span style={{ fontSize: 13, textDecoration: 'underline' }}>U</span>
      </Btn>
      <Btn
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <s style={{ fontSize: 12 }}>S</s>
      </Btn>
      <Btn
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{'{}'}</span>
      </Btn>
      <Btn
        active={editor.isActive('link')}
        onClick={() => window.dispatchEvent(new CustomEvent('skrybl:toggle-link-bubble'))}
        title="Link (Ctrl+L)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.5 8.5a2.5 2.5 0 003.54 0l2-2a2.5 2.5 0 00-3.54-3.54l-.5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8.5 5.5a2.5 2.5 0 00-3.54 0l-2 2a2.5 2.5 0 003.54 3.54l.5-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="2.5" width="3" height="3" fill="currentColor" />
          <rect x="1.5" y="8.5" width="3" height="3" fill="currentColor" />
          <line x1="6.5" y1="4" x2="12.5" y2="4" stroke="currentColor" strokeWidth="1.2" />
          <line x1="6.5" y1="10" x2="12.5" y2="10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </Btn>
      <Btn
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <text x="1.5" y="6" fontSize="6" fill="currentColor" fontFamily="var(--font-mono)" fontWeight="700">1</text>
          <text x="1.5" y="12" fontSize="6" fill="currentColor" fontFamily="var(--font-mono)" fontWeight="700">2</text>
          <line x1="6.5" y1="4" x2="12.5" y2="4" stroke="currentColor" strokeWidth="1.2" />
          <line x1="6.5" y1="10" x2="12.5" y2="10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </Btn>
      <Btn
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="2" height="10" rx="0.5" fill="currentColor" />
          <line x1="5" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
          <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1" />
          <line x1="5" y1="10" x2="9" y2="10" stroke="currentColor" strokeWidth="1" />
        </svg>
      </Btn>

      <Sep />

      {/* Math */}
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({ type: 'inlineMath', attrs: { latex: '' } }).run()
        }
        title="Inline math (Ctrl+Shift+E)"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontStyle: 'italic' }}>x²</span>
      </Btn>
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({ type: 'blockMath', attrs: { latex: '' } }).run()
        }
        title="Block math (equation)"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>∫f</span>
      </Btn>

      <Sep />

      {/* Code block */}
      <Btn
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code block"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4.5 3.5L1.5 7l3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 3.5l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Btn>

      {/* Divider */}
      <Btn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Btn>

      <div className="toolbar-spacer" />

      {/* Font switcher */}
      <FontBtn />

      <Sep />

      {/* Settings */}
      <Btn onClick={() => useUIStore.getState().toggleSettings()} title="Settings">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.76 2.76l1.06 1.06M10.18 10.18l1.06 1.06M11.24 2.76l-1.06 1.06M3.82 10.18l-1.06 1.06" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </Btn>

      <Sep />

      {/* Theme cycle */}
      <Btn onClick={cycleTheme} title={`Theme: ${theme}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 2a5 5 0 010 10" fill="currentColor" />
        </svg>
      </Btn>

      <Sep />

      {/* Find */}
      <Btn onClick={toggleFindBar} title="Find & replace (Ctrl+F)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </Btn>

      <Sep />

      {/* Focus mode */}
      <Btn
        active={focusMode}
        onClick={toggleFocusMode}
        title="Focus mode (Ctrl+Shift+F)"
        className="toolbar-focus-btn"
      >
        Focus
      </Btn>
    </div>
  )
}
