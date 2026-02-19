import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { useNotebookStore } from '../../stores/notebook-store'

export function TabBar(): JSX.Element {
  const tabs = useNotebookStore((s) => s.tabs)
  const activeTabId = useNotebookStore((s) => s.activeTabId)
  const switchTab = useNotebookStore((s) => s.switchTab)
  const closeTab = useNotebookStore((s) => s.closeTab)
  const reorderTabs = useNotebookStore((s) => s.reorderTabs)
  const openInNewTab = useNotebookStore((s) => s.openInNewTab)
  const newNotebookTab = useCallback(() => {
    const now = new Date().toISOString()
    const page = {
      id: nanoid(),
      title: 'Page 1',
      content: { type: 'doc' as const, content: [{ type: 'paragraph' as const }] },
      createdAt: now,
      updatedAt: now
    }
    const nb = {
      version: 1,
      title: 'Untitled Notebook',
      pages: [page],
      activePageId: page.id,
      createdAt: now,
      updatedAt: now
    }
    openInNewTab(nb)
  }, [openInNewTab])

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault()
      if (dragIndex !== null && dragIndex !== toIndex) {
        reorderTabs(dragIndex, toIndex)
      }
      setDragIndex(null)
      setDragOverIndex(null)
    },
    [dragIndex, reorderTabs]
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  if (tabs.length <= 1) return <></>

  return (
    <div className="tab-bar">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId
        const isDragging = dragIndex === index
        const isDragOver = dragOverIndex === index && dragIndex !== index

        return (
          <div
            key={tab.id}
            className={`tab-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
            onClick={() => switchTab(tab.id)}
            onMouseDown={(e) => {
              // Middle-click to close
              if (e.button === 1) {
                e.preventDefault()
                closeTab(tab.id)
              }
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <span className="tab-title">
              {tab.notebook.title}
            </span>
            {tab.isDirty && <span className="tab-dirty">&bull;</span>}
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              title="Close tab"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )
      })}

      <button className="tab-new" onClick={newNotebookTab} title="New notebook tab">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
