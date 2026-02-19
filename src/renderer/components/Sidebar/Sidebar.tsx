import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNotebookStore } from '../../stores/notebook-store'
import { useUIStore, type SidebarSort } from '../../stores/ui-store'
import { SkryblLogo } from '../SkryblLogo'

export function Sidebar(): JSX.Element {
  const notebook = useNotebookStore((s) => s.notebook)
  const activePage = useNotebookStore((s) => s.activePage)
  const setActivePage = useNotebookStore((s) => s.setActivePage)
  const addPage = useNotebookStore((s) => s.addPage)
  const deletePage = useNotebookStore((s) => s.deletePage)
  const renamePage = useNotebookStore((s) => s.renamePage)
  const renameNotebook = useNotebookStore((s) => s.renameNotebook)
  const reorderPages = useNotebookStore((s) => s.reorderPages)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const sidebarSort = useUIStore((s) => s.sidebarSort)
  const setSidebarSort = useUIStore((s) => s.setSidebarSort)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingNotebook, setEditingNotebook] = useState(false)
  const [notebookTitle, setNotebookTitle] = useState(notebook.title)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sortedPages = useMemo(() => {
    if (sidebarSort === 'lastOpened') {
      return [...notebook.pages].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }
    return notebook.pages
  }, [notebook.pages, sidebarSort])

  const isDragEnabled = sidebarSort === 'default'

  useEffect(() => { setNotebookTitle(notebook.title) }, [notebook.title])

  useEffect(() => {
    if ((editingId || editingNotebook) && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId, editingNotebook])

  const startRename = (pageId: string, title: string) => {
    setEditingId(pageId)
    setEditValue(title)
  }

  const commitRename = () => {
    if (editingId && editValue.trim()) renamePage(editingId, editValue.trim())
    setEditingId(null)
  }

  const commitNotebookRename = () => {
    if (notebookTitle.trim()) renameNotebook(notebookTitle.trim())
    setEditingNotebook(false)
  }

  // Drag-and-drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Transparent drag image
    const ghost = document.createElement('div')
    ghost.className = 'drag-ghost'
    ghost.textContent = notebook.pages[index].title
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    requestAnimationFrame(() => document.body.removeChild(ghost))
  }, [notebook.pages])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderPages(dragIndex, toIndex)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, reorderPages])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        {editingNotebook ? (
          <input
            ref={inputRef}
            value={notebookTitle}
            onChange={(e) => setNotebookTitle(e.target.value)}
            onBlur={commitNotebookRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitNotebookRename()
              if (e.key === 'Escape') setEditingNotebook(false)
            }}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
              <SkryblLogo size={14} color="var(--text-muted)" />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 650,
                  color: 'var(--text-primary)',
                  cursor: 'default',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onDoubleClick={() => setEditingNotebook(true)}
              >
                {notebook.title}
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-faint)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: 'var(--radius-xs)',
                transition: 'color 0.1s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
              title="Hide sidebar (Ctrl+\\)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Section label + sort toggle */}
      <div className="sidebar-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Pages</span>
        <button
          className="sidebar-sort-toggle"
          onClick={() => setSidebarSort(sidebarSort === 'default' ? 'lastOpened' : 'default')}
          title={sidebarSort === 'default' ? 'Sort: Manual order' : 'Sort: Last opened'}
        >
          {sidebarSort === 'default' ? 'Manual' : 'Recent'}
        </button>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 4 }}>
        {sortedPages.map((page, index) => {
          const isActive = page.id === activePage.id
          const isEditing = editingId === page.id
          const isDragging = isDragEnabled && dragIndex === index
          const isDragOver = isDragEnabled && dragOverIndex === index && dragIndex !== index

          return (
            <div
              key={page.id}
              className={`sidebar-page-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
              onClick={() => setActivePage(page.id)}
              onDoubleClick={() => startRename(page.id, page.title)}
              draggable={isDragEnabled && !isEditing}
              onDragStart={isDragEnabled ? (e) => handleDragStart(e, index) : undefined}
              onDragOver={isDragEnabled ? (e) => handleDragOver(e, index) : undefined}
              onDrop={isDragEnabled ? (e) => handleDrop(e, index) : undefined}
              onDragEnd={isDragEnabled ? handleDragEnd : undefined}
            >
              {/* Page icon */}
              <svg className="sidebar-page-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.1" />
                <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
              </svg>

              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '1px 4px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none'
                  }}
                />
              ) : (
                <span className="sidebar-page-title">{page.title}</span>
              )}

              {!isEditing && notebook.pages.length > 1 && (
                <button
                  className="sidebar-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePage(page.id)
                  }}
                  title="Delete page"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* New page */}
      <div style={{ padding: '8px 6px' }}>
        <button className="sidebar-new-page-btn" onClick={addPage}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          new page
        </button>
      </div>
    </aside>
  )
}
