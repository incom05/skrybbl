import { useEffect, useRef } from 'react'
import { useNotebookStore } from '../stores/notebook-store'

const AUTO_SAVE_DELAY = 2000

export function useAutoSave(): void {
  const isDirty = useNotebookStore((s) => s.isDirty)
  const filePath = useNotebookStore((s) => s.filePath)
  const getNotebookData = useNotebookStore((s) => s.getNotebookData)
  const setDirty = useNotebookStore((s) => s.setDirty)
  const createSnapshot = useNotebookStore((s) => s.createSnapshot)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDirty || !filePath) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      try {
        await window.electron.saveFile(filePath, getNotebookData())
        setDirty(false)
        const now = new Date()
        const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        createSnapshot(`Auto-save ${timeStr}`)
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, AUTO_SAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, filePath, getNotebookData, setDirty, createSnapshot])
}
