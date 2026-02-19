import { useNotebookStore } from '../../stores/notebook-store'
import { useUIStore } from '../../stores/ui-store'
import { useEditorStats } from '../../hooks/useEditorStats'

export function StatusBar(): JSX.Element {
  const isDirty = useNotebookStore((s) => s.isDirty)
  const filePath = useNotebookStore((s) => s.filePath)
  const notebook = useNotebookStore((s) => s.notebook)
  const activePage = useNotebookStore((s) => s.activePage)
  const focusMode = useUIStore((s) => s.focusMode)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const { words, chars } = useEditorStats()

  const pageIndex = notebook.pages.findIndex((p) => p.id === activePage.id) + 1

  const saveStatus = !filePath ? 'new-file' : isDirty ? 'unsaved' : 'saved'
  const saveLabel = !filePath ? 'Not saved' : isDirty ? 'Unsaved' : 'Saved'

  return (
    <div className="statusbar">
      {/* Save status — shape-based */}
      <div className="statusbar-item">
        <div className={`statusbar-dot ${saveStatus}`} />
        <span>{saveLabel}</span>
      </div>

      <div className="statusbar-sep" />

      {/* Page info */}
      <div className="statusbar-item">
        Page {pageIndex}/{notebook.pages.length}
      </div>

      <div className="statusbar-sep" />

      {/* Word count */}
      <div className="statusbar-item">
        {words} {words === 1 ? 'word' : 'words'}
      </div>

      <div className="statusbar-sep" />

      {/* Char count */}
      <div className="statusbar-item">
        {chars} chars
      </div>

      <div className="statusbar-spacer" />

      {/* Focus mode toggle */}
      <button
        className="statusbar-item"
        style={{
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          color: focusMode ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px',
          letterSpacing: '0.03em'
        }}
        onClick={toggleFocusMode}
        title="Toggle focus mode (Ctrl+Shift+F)"
      >
        Focus
      </button>
    </div>
  )
}
