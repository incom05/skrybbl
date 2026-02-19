import { contextBridge, ipcRenderer } from 'electron'
import type { Notebook } from '../main/types'

const api = {
  openFile: (): Promise<{ path: string; data: Notebook } | null> =>
    ipcRenderer.invoke('file:open'),

  saveFile: (filePath: string, data: Notebook): Promise<boolean> =>
    ipcRenderer.invoke('file:save', filePath, data),

  saveFileAs: (data: Notebook): Promise<string | null> =>
    ipcRenderer.invoke('file:save-as', data),

  exportLatex: (latexContent: string): Promise<string | null> =>
    ipcRenderer.invoke('file:export-latex', latexContent),

  exportMarkdown: (mdContent: string): Promise<string | null> =>
    ipcRenderer.invoke('file:export-markdown', mdContent),

  exportHtml: (htmlContent: string): Promise<string | null> =>
    ipcRenderer.invoke('file:export-html', htmlContent),

  exportPdf: (htmlContent: string, title: string): Promise<string | null> =>
    ipcRenderer.invoke('file:export-pdf', htmlContent, title),

  getRecentFiles: (): Promise<{ path: string; title: string; updatedAt: string; pageCount: number; icon?: string; color?: string }[]> =>
    ipcRenderer.invoke('recent-files:get'),

  addRecentFile: (entry: { path: string; title: string; updatedAt: string; pageCount: number; icon?: string; color?: string }): Promise<boolean> =>
    ipcRenderer.invoke('recent-files:add', entry),

  removeRecentFile: (path: string): Promise<boolean> =>
    ipcRenderer.invoke('recent-files:remove', path),

  updateRecentFile: (path: string, updates: Partial<{ title: string; icon: string; color: string }>): Promise<boolean> =>
    ipcRenderer.invoke('recent-files:update', path, updates),

  reorderRecentFiles: (orderedPaths: string[]): Promise<boolean> =>
    ipcRenderer.invoke('recent-files:reorder', orderedPaths),

  openFilePath: (path: string): Promise<{ path: string; data: Notebook } | null> =>
    ipcRenderer.invoke('recent-files:open-path', path),

  onMenuOpen: (callback: () => void) => {
    ipcRenderer.on('menu:open', callback)
    return () => ipcRenderer.removeListener('menu:open', callback)
  },

  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu:save', callback)
    return () => ipcRenderer.removeListener('menu:save', callback)
  },

  onMenuSaveAs: (callback: () => void) => {
    ipcRenderer.on('menu:save-as', callback)
    return () => ipcRenderer.removeListener('menu:save-as', callback)
  },

  onMenuExportLatex: (callback: () => void) => {
    ipcRenderer.on('menu:export-latex', callback)
    return () => ipcRenderer.removeListener('menu:export-latex', callback)
  },

  onMenuExportMarkdown: (callback: () => void) => {
    ipcRenderer.on('menu:export-markdown', callback)
    return () => ipcRenderer.removeListener('menu:export-markdown', callback)
  },

  onMenuExportHtml: (callback: () => void) => {
    ipcRenderer.on('menu:export-html', callback)
    return () => ipcRenderer.removeListener('menu:export-html', callback)
  },

  onMenuExportPdf: (callback: () => void) => {
    ipcRenderer.on('menu:export-pdf', callback)
    return () => ipcRenderer.removeListener('menu:export-pdf', callback)
  },

  pickImage: (): Promise<{ data: string; name: string } | null> =>
    ipcRenderer.invoke('image:pick-file'),

  setTitleBarTheme: (colors: { color: string; symbolColor: string }) =>
    ipcRenderer.invoke('theme:set-titlebar', colors)
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('electron', api)
