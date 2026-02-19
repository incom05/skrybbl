import { useState, useEffect, useCallback } from 'react'
import { useUIStore } from '../../stores/ui-store'
import { useNotebookStore } from '../../stores/notebook-store'

export function VersionHistoryPanel(): JSX.Element | null {
  const isOpen = useUIStore((s) => s.versionHistoryOpen)
  const close = useCallback(() => useUIStore.getState().setVersionHistoryOpen(false), [])
  const notebook = useNotebookStore((s) => s.notebook)
  const restoreSnapshot = useNotebookStore((s) => s.restoreSnapshot)
  const createSnapshot = useNotebookStore((s) => s.createSnapshot)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const snapshots = notebook.snapshots || []
  const sorted = [...snapshots].reverse()

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  if (!isOpen) return null

  const handleRestore = () => {
    if (!selectedId) return
    restoreSnapshot(selectedId)
    close()
  }

  const handleCreateSnapshot = () => {
    createSnapshot()
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="version-history-overlay" onClick={close}>
      <div className="version-history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="version-history-header">
          <span className="version-history-title">Version History</span>
          <button className="version-history-close" onClick={close}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="version-history-actions">
          <button className="version-history-btn" onClick={handleCreateSnapshot}>
            Create Snapshot
          </button>
          {selectedId && (
            <button className="version-history-btn restore" onClick={handleRestore}>
              Restore
            </button>
          )}
        </div>

        <div className="version-history-list">
          {sorted.length === 0 ? (
            <div className="version-history-empty">
              No snapshots yet. Snapshots are created automatically on save.
            </div>
          ) : (
            sorted.map((snap) => (
              <div
                key={snap.id}
                className={`version-history-item ${selectedId === snap.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(snap.id === selectedId ? null : snap.id)}
              >
                <div className="version-history-item-title">{snap.title}</div>
                <div className="version-history-item-time">{formatTime(snap.timestamp)}</div>
                <div className="version-history-item-meta">
                  {snap.pages.length} {snap.pages.length === 1 ? 'page' : 'pages'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
