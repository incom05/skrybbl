import { readFile, writeFile } from 'fs/promises'
import { dialog, BrowserWindow } from 'electron'
import type { Notebook } from './types'

export async function exportPdf(
  win: BrowserWindow,
  htmlContent: string,
  title: string
): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: 'Export as PDF',
    defaultPath: `${title || 'document'}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  })

  if (result.canceled || !result.filePath) return null

  const hidden = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: { offscreen: true }
  })

  try {
    const encoded = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    await hidden.loadURL(encoded)
    // Wait for KaTeX / highlight.js to render
    await new Promise((r) => setTimeout(r, 1500))
    const pdfBuffer = await hidden.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
    })
    await writeFile(result.filePath, pdfBuffer)
    return result.filePath
  } finally {
    hidden.destroy()
  }
}

export async function openNotebook(win: BrowserWindow): Promise<{ path: string; data: Notebook } | null> {
  const result = await dialog.showOpenDialog(win, {
    title: 'Open Notebook',
    filters: [
      { name: 'Skrybbl Notebooks', extensions: ['skrybl'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const content = await readFile(filePath, 'utf-8')
  const data = JSON.parse(content) as Notebook

  return { path: filePath, data }
}

export async function saveNotebook(
  filePath: string,
  data: Notebook
): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function saveNotebookAs(
  win: BrowserWindow,
  data: Notebook
): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: 'Save Notebook As',
    defaultPath: `${data.title || 'Untitled'}.skrybl`,
    filters: [
      { name: 'Skrybbl Notebooks', extensions: ['skrybl'] }
    ]
  })

  if (result.canceled || !result.filePath) return null

  await saveNotebook(result.filePath, data)
  return result.filePath
}

export async function exportLatex(
  win: BrowserWindow,
  latexContent: string
): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: 'Export as LaTeX',
    defaultPath: 'document.tex',
    filters: [
      { name: 'LaTeX Files', extensions: ['tex'] }
    ]
  })

  if (result.canceled || !result.filePath) return null

  await writeFile(result.filePath, latexContent, 'utf-8')
  return result.filePath
}

export async function exportMarkdown(
  win: BrowserWindow,
  mdContent: string
): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: 'Export as Markdown',
    defaultPath: 'document.md',
    filters: [
      { name: 'Markdown Files', extensions: ['md'] }
    ]
  })

  if (result.canceled || !result.filePath) return null

  await writeFile(result.filePath, mdContent, 'utf-8')
  return result.filePath
}

export async function exportHtml(
  win: BrowserWindow,
  htmlContent: string
): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: 'Export as HTML',
    defaultPath: 'document.html',
    filters: [
      { name: 'HTML Files', extensions: ['html'] }
    ]
  })

  if (result.canceled || !result.filePath) return null

  await writeFile(result.filePath, htmlContent, 'utf-8')
  return result.filePath
}
