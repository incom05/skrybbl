import { Menu, BrowserWindow } from 'electron'

export function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:open')
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:save')
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:save-as')
          }
        },
        { type: 'separator' },
        {
          label: 'Export as LaTeX...',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:export-latex')
          }
        },
        {
          label: 'Export as Markdown...',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:export-markdown')
          }
        },
        {
          label: 'Export as HTML...',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:export-html')
          }
        },
        {
          label: 'Export as PDF...',
          click: (_item, win) => {
            if (win) win.webContents.send('menu:export-pdf')
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
