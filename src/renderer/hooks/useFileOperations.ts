import { useCallback } from 'react'
import { useNotebookStore } from '../stores/notebook-store'
import { useUIStore } from '../stores/ui-store'
import { notebookToLatex } from '../lib/latex-export'
import { notebookToMarkdown } from '../lib/markdown-export'
import { notebookToHtml } from '../lib/html-export'
import { renderAllGraphSvgs } from '../lib/graph-to-svg'

async function addToRecents(path: string, title: string, updatedAt: string, pageCount: number): Promise<void> {
  try {
    await window.electron.addRecentFile({ path, title, updatedAt, pageCount })
  } catch {
    // Ignore — recents are best-effort
  }
}

export function useFileOperations() {
  const openInNewTab = useNotebookStore((s) => s.openInNewTab)
  const filePath = useNotebookStore((s) => s.filePath)
  const setFilePath = useNotebookStore((s) => s.setFilePath)
  const setDirty = useNotebookStore((s) => s.setDirty)
  const getNotebookData = useNotebookStore((s) => s.getNotebookData)
  const setView = useUIStore((s) => s.setView)

  const handleOpen = useCallback(async () => {
    const result = await window.electron.openFile()
    if (result) {
      openInNewTab(result.data, result.path)
      await addToRecents(result.path, result.data.title, result.data.updatedAt, result.data.pages.length)
      setView('editor')
    }
  }, [openInNewTab, setView])

  const handleSave = useCallback(async () => {
    const data = getNotebookData()
    if (filePath) {
      await window.electron.saveFile(filePath, data)
      setDirty(false)
      await addToRecents(filePath, data.title, data.updatedAt, data.pages.length)
    } else {
      const newPath = await window.electron.saveFileAs(data)
      if (newPath) {
        setFilePath(newPath)
        setDirty(false)
        await addToRecents(newPath, data.title, data.updatedAt, data.pages.length)
      }
    }
  }, [filePath, getNotebookData, setFilePath, setDirty])

  const handleSaveAs = useCallback(async () => {
    const data = getNotebookData()
    const newPath = await window.electron.saveFileAs(data)
    if (newPath) {
      setFilePath(newPath)
      setDirty(false)
      await addToRecents(newPath, data.title, data.updatedAt, data.pages.length)
    }
  }, [getNotebookData, setFilePath, setDirty])

  const handleExportLatex = useCallback(async () => {
    const data = getNotebookData()
    const latex = notebookToLatex(data)
    await window.electron.exportLatex(latex)
  }, [getNotebookData])

  const handleExportMarkdown = useCallback(async () => {
    const data = getNotebookData()
    const md = notebookToMarkdown(data)
    await window.electron.exportMarkdown(md)
  }, [getNotebookData])

  const handleExportHtml = useCallback(async () => {
    const data = getNotebookData()
    const graphSvgs = await renderAllGraphSvgs(data)
    const html = notebookToHtml(data, graphSvgs)
    await window.electron.exportHtml(html)
  }, [getNotebookData])

  const handleExportPdf = useCallback(async () => {
    const data = getNotebookData()
    const graphSvgs = await renderAllGraphSvgs(data)
    const html = notebookToHtml(data, graphSvgs)
    await window.electron.exportPdf(html, data.title)
  }, [getNotebookData])

  return { handleOpen, handleSave, handleSaveAs, handleExportLatex, handleExportMarkdown, handleExportHtml, handleExportPdf }
}
