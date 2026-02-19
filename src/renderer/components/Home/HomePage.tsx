import { useState, useEffect, useCallback, useRef } from 'react'
import { SkryblLogo } from '../SkryblLogo'
import { useUIStore } from '../../stores/ui-store'
import { useNotebookStore } from '../../stores/notebook-store'

interface RecentFile {
  path: string
  title: string
  updatedAt: string
  pageCount: number
  icon?: string
  color?: string
}

// ── Icon set ─────────────────────────────────────────────────
const ICONS: { id: string; label: string; svg: string }[] = [
  { id: 'notebook', label: 'Notebook', svg: '<rect x="2" y="1" width="12" height="14" stroke="currentColor" stroke-width="1.3" fill="none"/><line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="1"/><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1"/><line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" stroke-width="1"/>' },
  { id: 'math', label: 'Math', svg: '<text x="8" y="12" text-anchor="middle" font-size="12" font-weight="600" font-family="serif" fill="currentColor" font-style="italic">x</text>' },
  { id: 'physics', label: 'Physics', svg: '<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3" fill="none"/><ellipse cx="8" cy="8" rx="6" ry="2.5" stroke="currentColor" stroke-width="0.8" fill="none" transform="rotate(60 8 8)"/><ellipse cx="8" cy="8" rx="6" ry="2.5" stroke="currentColor" stroke-width="0.8" fill="none" transform="rotate(-60 8 8)"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/>' },
  { id: 'chemistry', label: 'Chemistry', svg: '<path d="M6 2v6L2 14h12L10 8V2" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><line x1="5" y1="2" x2="11" y2="2" stroke="currentColor" stroke-width="1.3"/>' },
  { id: 'engineering', label: 'Engineering', svg: '<circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="8" cy="8" r="1" fill="currentColor"/><line x1="8" y1="1" x2="8" y2="4" stroke="currentColor" stroke-width="1.3"/><line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" stroke-width="1.3"/><line x1="1" y1="8" x2="4" y2="8" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.3"/>' },
  { id: 'star', label: 'Star', svg: '<path d="M8 2l1.8 3.7L14 6.3l-3 2.9.7 4.1L8 11.3l-3.7 2 .7-4.1-3-2.9 4.2-.6z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/>' },
  { id: 'lightning', label: 'Lightning', svg: '<path d="M9 1L4 9h4l-1 6 5-8H8l1-6z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/>' },
  { id: 'book', label: 'Book', svg: '<path d="M2 13V3c0-1 1-2 3-2h6c2 0 3 1 3 2v10" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.3"/><line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="0.8"/><line x1="5" y1="7.5" x2="9" y2="7.5" stroke="currentColor" stroke-width="0.8"/>' },
  { id: 'grid', label: 'Grid', svg: '<rect x="2" y="2" width="5" height="5" stroke="currentColor" stroke-width="1.2" fill="none"/><rect x="9" y="2" width="5" height="5" stroke="currentColor" stroke-width="1.2" fill="none"/><rect x="2" y="9" width="5" height="5" stroke="currentColor" stroke-width="1.2" fill="none"/><rect x="9" y="9" width="5" height="5" stroke="currentColor" stroke-width="1.2" fill="none"/>' },
  { id: 'graph', label: 'Graph', svg: '<polyline points="2,13 5,8 8,10 11,4 14,6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/>' },
  { id: 'code', label: 'Code', svg: '<polyline points="5,4 2,8 5,12" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="11,4 14,8 11,12" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  { id: 'pencil', label: 'Pencil', svg: '<path d="M11.5 1.5l3 3-9 9H2.5v-3z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><line x1="9" y1="4" x2="12" y2="7" stroke="currentColor" stroke-width="1"/>' },
]

// ── Color palette ────────────────────────────────────────────
const COLORS: { id: string; label: string; value: string }[] = [
  { id: 'none', label: 'None', value: 'transparent' },
  { id: 'red', label: 'Red', value: '#e54545' },
  { id: 'orange', label: 'Orange', value: '#d4853a' },
  { id: 'yellow', label: 'Yellow', value: '#c4a934' },
  { id: 'green', label: 'Green', value: '#45a85a' },
  { id: 'teal', label: 'Teal', value: '#3aa8a0' },
  { id: 'blue', label: 'Blue', value: '#4588cc' },
  { id: 'purple', label: 'Purple', value: '#8855cc' },
  { id: 'pink', label: 'Pink', value: '#cc5588' },
]

function getColorValue(id?: string): string {
  if (!id || id === 'none') return 'transparent'
  return COLORS.find((c) => c.id === id)?.value ?? 'transparent'
}

function getIconSvg(id?: string): string {
  return ICONS.find((i) => i.id === id)?.svg ?? ICONS[0].svg
}

// ── Context menu position ────────────────────────────────────
interface ContextMenu {
  x: number
  y: number
  file: RecentFile
}

export function HomePage(): JSX.Element {
  const [recents, setRecents] = useState<RecentFile[]>([])
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [editingPath, setEditingPath] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [iconPickerPath, setIconPickerPath] = useState<string | null>(null)
  const [colorPickerPath, setColorPickerPath] = useState<string | null>(null)
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)

  const setView = useUIStore((s) => s.setView)
  const setNotebook = useNotebookStore((s) => s.setNotebook)
  const newNotebook = useNotebookStore((s) => s.newNotebook)

  const renameInputRef = useRef<HTMLInputElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const iconPickerRef = useRef<HTMLDivElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const loadRecents = useCallback(async () => {
    const files = await window.electron.getRecentFiles()
    setRecents(files)
  }, [])

  useEffect(() => { loadRecents() }, [loadRecents])

  // Focus rename input
  useEffect(() => {
    if (editingPath && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [editingPath])

  // Close popups on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const inCtx = contextMenuRef.current?.contains(target)
      const inIcon = iconPickerRef.current?.contains(target)
      const inColor = colorPickerRef.current?.contains(target)

      // If clicking inside any popup, don't close anything
      if (inCtx || inIcon || inColor) return

      // Clicking outside all popups — close everything
      if (contextMenu) setContextMenu(null)
      if (iconPickerPath) { setIconPickerPath(null); setPickerPos(null) }
      if (colorPickerPath) { setColorPickerPath(null); setPickerPos(null) }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [contextMenu, iconPickerPath, colorPickerPath])

  // Close popups on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null)
        setIconPickerPath(null)
        setColorPickerPath(null)
        setPickerPos(null)
        if (editingPath) setEditingPath(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editingPath])

  // ── Actions ──────────────────────────────────────────────
  const handleNew = useCallback(() => {
    newNotebook()
    setView('editor')
  }, [newNotebook, setView])

  const handleOpen = useCallback(async () => {
    const result = await window.electron.openFile()
    if (result) {
      setNotebook(result.data, result.path)
      await window.electron.addRecentFile({
        path: result.path,
        title: result.data.title,
        updatedAt: result.data.updatedAt,
        pageCount: result.data.pages.length
      })
      setView('editor')
    }
  }, [setNotebook, setView])

  const handleOpenRecent = useCallback(async (filePath: string) => {
    const result = await window.electron.openFilePath(filePath)
    if (result) {
      setNotebook(result.data, result.path)
      await window.electron.addRecentFile({
        path: result.path,
        title: result.data.title,
        updatedAt: result.data.updatedAt,
        pageCount: result.data.pages.length
      })
      setView('editor')
    } else {
      await window.electron.removeRecentFile(filePath)
      loadRecents()
    }
  }, [setNotebook, setView, loadRecents])

  const handleRemove = useCallback(async (path: string) => {
    await window.electron.removeRecentFile(path)
    setContextMenu(null)
    loadRecents()
  }, [loadRecents])

  const handleRenameStart = useCallback((file: RecentFile) => {
    setEditingPath(file.path)
    setEditValue(file.title)
    setContextMenu(null)
  }, [])

  const handleRenameCommit = useCallback(async () => {
    if (editingPath && editValue.trim()) {
      await window.electron.updateRecentFile(editingPath, { title: editValue.trim() })
      loadRecents()
    }
    setEditingPath(null)
  }, [editingPath, editValue, loadRecents])

  const handleSetIcon = useCallback(async (path: string, icon: string) => {
    await window.electron.updateRecentFile(path, { icon })
    setIconPickerPath(null)
    setPickerPos(null)
    loadRecents()
  }, [loadRecents])

  const handleSetColor = useCallback(async (path: string, color: string) => {
    await window.electron.updateRecentFile(path, { color })
    setColorPickerPath(null)
    setPickerPos(null)
    loadRecents()
  }, [loadRecents])

  const handleContextMenu = useCallback((e: React.MouseEvent, file: RecentFile) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, file })
    setIconPickerPath(null)
    setColorPickerPath(null)
  }, [])

  // ── Drag & Drop ──────────────────────────────────────────
  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== idx) {
      setDropIdx(idx)
    }
  }, [dragIdx])

  const handleDrop = useCallback(async () => {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      const items = [...recents]
      const [moved] = items.splice(dragIdx, 1)
      items.splice(dropIdx, 0, moved)
      setRecents(items)
      await window.electron.reorderRecentFiles(items.map((f) => f.path))
    }
    setDragIdx(null)
    setDropIdx(null)
  }, [dragIdx, dropIdx, recents])

  const handleDragEnd = useCallback(() => {
    setDragIdx(null)
    setDropIdx(null)
  }, [])

  // ── Helpers ──────────────────────────────────────────────
  const formatDate = (iso: string): string => {
    try {
      const d = new Date(iso)
      const now = new Date()
      const diff = now.getTime() - d.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days === 0) return 'Today'
      if (days === 1) return 'Yesterday'
      if (days < 7) return `${days}d ago`
      if (days < 30) return `${Math.floor(days / 7)}w ago`
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const truncatePath = (p: string): string => {
    const parts = p.replace(/\\/g, '/').split('/')
    if (parts.length <= 3) return p.replace(/\\/g, '/')
    return '.../' + parts.slice(-2).join('/')
  }

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Header */}
        <div className="home-header">
          <SkryblLogo size={40} color="var(--text-primary)" opacity={0.6} />
          <h1 className="home-title">Skrybbl</h1>
          <p className="home-subtitle">Math-powered notebook for students</p>
        </div>

        {/* Action buttons */}
        <div className="home-actions">
          <button className="home-action-btn home-action-primary" onClick={handleNew}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Notebook
          </button>
          <button className="home-action-btn" onClick={handleOpen}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 12V5a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            Open...
          </button>
        </div>

        {/* Recent notebooks */}
        {recents.length > 0 ? (
          <div className="home-recents">
            <div className="home-recents-label">Recent Notebooks</div>
            <div className="home-recents-grid">
              {recents.map((file, idx) => (
                <div
                  key={file.path}
                  className={`home-card${dragIdx === idx ? ' home-card-dragging' : ''}${dropIdx === idx ? ' home-card-drop-target' : ''}`}
                  onClick={() => editingPath !== file.path && handleOpenRecent(file.path)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                >
                  {/* Color stripe */}
                  {file.color && file.color !== 'none' && (
                    <div className="home-card-stripe" style={{ background: getColorValue(file.color) }} />
                  )}

                  <div className="home-card-top">
                    <div
                      className="home-card-icon"
                      dangerouslySetInnerHTML={{ __html: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${getIconSvg(file.icon)}</svg>` }}
                    />
                    <div className="home-card-actions">
                      <button
                        className="home-card-menu-btn"
                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, file) }}
                        title="Options"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="3" r="1" fill="currentColor" />
                          <circle cx="7" cy="7" r="1" fill="currentColor" />
                          <circle cx="7" cy="11" r="1" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="home-card-body">
                    {editingPath === file.path ? (
                      <input
                        ref={renameInputRef}
                        className="home-card-rename-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleRenameCommit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCommit()
                          if (e.key === 'Escape') setEditingPath(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="home-card-title">{file.title}</div>
                    )}
                    <div className="home-card-meta">
                      <span>{formatDate(file.updatedAt)}</span>
                      <span className="home-card-meta-sep" />
                      <span>{file.pageCount} {file.pageCount === 1 ? 'pg' : 'pgs'}</span>
                    </div>
                  </div>

                  <div className="home-card-path">{truncatePath(file.path)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="home-empty">
            <SkryblLogo size={64} color="var(--text-faint)" opacity={0.3} />
            <p className="home-empty-text">Create your first notebook</p>
            <p className="home-empty-hint">Press the button above or Ctrl+O to open a file</p>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="home-ctx-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button className="home-ctx-item" onClick={() => handleOpenRecent(contextMenu.file.path)}>
            <span>Open</span>
          </button>
          <button className="home-ctx-item" onClick={() => handleRenameStart(contextMenu.file)}>
            <span>Rename</span>
          </button>
          <div className="home-ctx-sep" />
          <button className="home-ctx-item" onClick={() => { setPickerPos({ x: contextMenu.x, y: contextMenu.y }); setIconPickerPath(contextMenu.file.path); setColorPickerPath(null); setContextMenu(null); }}>
            <span>Change Icon</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M4 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="home-ctx-item" onClick={() => { setPickerPos({ x: contextMenu.x, y: contextMenu.y }); setColorPickerPath(contextMenu.file.path); setIconPickerPath(null); setContextMenu(null); }}>
            <span>Color Tag</span>
            {contextMenu.file.color && contextMenu.file.color !== 'none' && (
              <span className="home-ctx-color-dot" style={{ background: getColorValue(contextMenu.file.color) }} />
            )}
          </button>
          <div className="home-ctx-sep" />
          <button className="home-ctx-item home-ctx-danger" onClick={() => handleRemove(contextMenu.file.path)}>
            <span>Remove from Recents</span>
          </button>
        </div>
      )}

      {/* Icon picker */}
      {iconPickerPath && pickerPos && (
        <div
          ref={iconPickerRef}
          className="home-picker"
          style={{ left: pickerPos.x, top: pickerPos.y }}
        >
          <div className="home-picker-label">Choose Icon</div>
          <div className="home-picker-grid">
            {ICONS.map((icon) => (
              <button
                key={icon.id}
                className={`home-picker-item${recents.find(f => f.path === iconPickerPath)?.icon === icon.id ? ' active' : ''}`}
                onClick={() => handleSetIcon(iconPickerPath, icon.id)}
                title={icon.label}
                dangerouslySetInnerHTML={{ __html: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${icon.svg}</svg>` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Color picker */}
      {colorPickerPath && pickerPos && (
        <div
          ref={colorPickerRef}
          className="home-picker"
          style={{ left: pickerPos.x, top: pickerPos.y }}
        >
          <div className="home-picker-label">Color Tag</div>
          <div className="home-picker-colors">
            {COLORS.map((color) => (
              <button
                key={color.id}
                className={`home-picker-color${recents.find(f => f.path === colorPickerPath)?.color === color.id ? ' active' : ''}`}
                onClick={() => handleSetColor(colorPickerPath, color.id)}
                title={color.label}
              >
                {color.id === 'none' ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 2" />
                    <line x1="4" y1="14" x2="14" y2="4" stroke="var(--text-muted)" strokeWidth="1.2" />
                  </svg>
                ) : (
                  <span className="home-picker-color-swatch" style={{ background: color.value }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
