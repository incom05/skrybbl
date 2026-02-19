import { ipcMain, BrowserWindow, dialog } from 'electron'
import { readFile } from 'fs/promises'
import { openNotebook, saveNotebook, saveNotebookAs, exportLatex, exportMarkdown, exportHtml, exportPdf } from './file-service'
import { loadRecentFiles, addRecentFile, removeRecentFile, updateRecentFile, reorderRecentFiles } from './recent-files'
import type { RecentFile } from './recent-files'
import type { Notebook } from './types'

export function registerIpcHandlers(): void {
  ipcMain.handle('file:open', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return openNotebook(win)
  })

  ipcMain.handle('file:save', async (_event, filePath: string, data: Notebook) => {
    await saveNotebook(filePath, data)
    return true
  })

  ipcMain.handle('file:save-as', async (event, data: Notebook) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return saveNotebookAs(win, data)
  })

  ipcMain.handle('file:export-latex', async (event, latexContent: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return exportLatex(win, latexContent)
  })

  ipcMain.handle('file:export-markdown', async (event, mdContent: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return exportMarkdown(win, mdContent)
  })

  ipcMain.handle('file:export-html', async (event, htmlContent: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return exportHtml(win, htmlContent)
  })

  ipcMain.handle('file:export-pdf', async (event, htmlContent: string, title: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return exportPdf(win, htmlContent, title)
  })

  ipcMain.handle('recent-files:get', async () => {
    return loadRecentFiles()
  })

  ipcMain.handle('recent-files:add', async (_event, entry: RecentFile) => {
    addRecentFile(entry)
    return true
  })

  ipcMain.handle('recent-files:remove', async (_event, path: string) => {
    removeRecentFile(path)
    return true
  })

  ipcMain.handle('recent-files:update', async (_event, path: string, updates: Partial<{ title: string; icon: string; color: string }>) => {
    updateRecentFile(path, updates)
    return true
  })

  ipcMain.handle('recent-files:reorder', async (_event, orderedPaths: string[]) => {
    reorderRecentFiles(orderedPaths)
    return true
  })

  ipcMain.handle('recent-files:open-path', async (_event, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      const data = JSON.parse(content) as Notebook
      return { path: filePath, data }
    } catch {
      return null
    }
  })

  ipcMain.handle('image:pick-file', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Insert Image',
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || !result.filePaths.length) return null
    const filePath = result.filePaths[0]
    const buffer = await readFile(filePath)
    const ext = filePath.split('.').pop()?.toLowerCase() || 'png'
    const mimeMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml'
    }
    const mime = mimeMap[ext] || 'image/png'
    const data = `data:${mime};base64,${buffer.toString('base64')}`
    const name = filePath.replace(/\\/g, '/').split('/').pop() || 'image'
    return { data, name }
  })

  ipcMain.handle('theme:set-titlebar', async (event, colors: { color: string; symbolColor: string }) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    win.setTitleBarOverlay({
      color: colors.color,
      symbolColor: colors.symbolColor
    })
  })
}
