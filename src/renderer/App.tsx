import { useEffect } from 'react'
import { Layout } from './components/Layout/Layout'
import { useFileOperations } from './hooks/useFileOperations'
import { useCommandStore, type Command } from './stores/command-store'
import { useUIStore } from './stores/ui-store'
import { useNotebookStore } from './stores/notebook-store'

export default function App(): JSX.Element {
  const { handleOpen, handleSave, handleSaveAs, handleExportLatex, handleExportMarkdown, handleExportHtml, handleExportPdf } =
    useFileOperations()

  useEffect(() => {
    const cleanups = [
      window.electron.onMenuOpen(handleOpen),
      window.electron.onMenuSave(handleSave),
      window.electron.onMenuSaveAs(handleSaveAs),
      window.electron.onMenuExportLatex(handleExportLatex),
      window.electron.onMenuExportMarkdown(handleExportMarkdown),
      window.electron.onMenuExportHtml(handleExportHtml),
      window.electron.onMenuExportPdf(handleExportPdf)
    ]
    return () => cleanups.forEach((fn) => fn())
  }, [handleOpen, handleSave, handleSaveAs, handleExportLatex, handleExportMarkdown, handleExportHtml, handleExportPdf])

  // Global keyboard shortcuts for file operations
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && e.key === 'o') {
        e.preventDefault()
        handleOpen()
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        handleSaveAs()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleOpen, handleSave, handleSaveAs])

  // Register global commands
  useEffect(() => {
    const commands: Command[] = [
      // File
      {
        id: 'file:open',
        title: 'Open Notebook',
        subtitle: 'Ctrl+O',
        category: 'File',
        keywords: ['open', 'load', 'file'],
        action: handleOpen
      },
      {
        id: 'file:save',
        title: 'Save',
        subtitle: 'Ctrl+S',
        category: 'File',
        keywords: ['save', 'write'],
        action: handleSave
      },
      {
        id: 'file:save-as',
        title: 'Save As',
        subtitle: 'Ctrl+Shift+S',
        category: 'File',
        keywords: ['save', 'export', 'as'],
        action: handleSaveAs
      },
      {
        id: 'file:export-latex',
        title: 'Export as LaTeX',
        category: 'File',
        keywords: ['export', 'latex', 'tex'],
        action: handleExportLatex
      },
      {
        id: 'file:export-markdown',
        title: 'Export as Markdown',
        category: 'File',
        keywords: ['export', 'markdown', 'md'],
        action: handleExportMarkdown
      },
      {
        id: 'file:export-html',
        title: 'Export as HTML',
        subtitle: 'Blog-style standalone page',
        category: 'File',
        keywords: ['export', 'html', 'web', 'blog', 'publish'],
        action: handleExportHtml
      },
      {
        id: 'file:export-pdf',
        title: 'Export as PDF',
        category: 'File',
        keywords: ['export', 'pdf', 'print'],
        action: handleExportPdf
      },
      // View
      {
        id: 'view:toggle-sidebar',
        title: 'Toggle Sidebar',
        subtitle: 'Ctrl+\\',
        category: 'View',
        keywords: ['sidebar', 'panel', 'toggle'],
        action: () => useUIStore.getState().toggleSidebar()
      },
      {
        id: 'view:focus-mode',
        title: 'Toggle Focus Mode',
        subtitle: 'Ctrl+Shift+F',
        category: 'View',
        keywords: ['focus', 'zen', 'distraction'],
        action: () => useUIStore.getState().toggleFocusMode()
      },
      {
        id: 'view:find',
        title: 'Find & Replace',
        subtitle: 'Ctrl+F',
        category: 'View',
        keywords: ['find', 'search', 'replace'],
        action: () => useUIStore.getState().toggleFindBar()
      },
      {
        id: 'view:shortcuts',
        title: 'Keyboard Shortcuts',
        subtitle: 'Ctrl+/',
        category: 'View',
        keywords: ['shortcuts', 'keys', 'help'],
        action: () => useUIStore.getState().toggleShortcutsOverlay()
      },
      {
        id: 'view:cycle-theme',
        title: 'Cycle Theme',
        subtitle: 'Dark / Light / Midnight / Paper / Nord / Green',
        category: 'View',
        keywords: ['theme', 'dark', 'light', 'midnight', 'paper', 'nord', 'green', 'mode'],
        action: () => useUIStore.getState().cycleTheme()
      },
      {
        id: 'view:cycle-font',
        title: 'Cycle Editor Font',
        subtitle: 'Mono / Sans / Serif',
        category: 'View',
        keywords: ['font', 'typeface', 'mono', 'sans', 'serif'],
        action: () => useUIStore.getState().cycleEditorFont()
      },
      // Settings
      {
        id: 'view:settings',
        title: 'Settings',
        category: 'View',
        keywords: ['settings', 'preferences', 'config', 'options'],
        action: () => useUIStore.getState().toggleSettings()
      },
      {
        id: 'view:configure-handwriting',
        title: 'Configure Handwriting Recognition',
        subtitle: 'MyScript iink API keys',
        category: 'View',
        keywords: ['handwriting', 'draw', 'myscript', 'iink', 'api', 'key'],
        action: () => useUIStore.getState().setSettingsOpen(true)
      },
      // Edit
      {
        id: 'edit:toggle-spellcheck',
        title: 'Toggle Spellcheck',
        category: 'Edit',
        keywords: ['spellcheck', 'spell', 'check', 'spelling'],
        action: () => useUIStore.getState().toggleSpellcheck()
      },
      {
        id: 'edit:insert-link',
        title: 'Insert Link',
        subtitle: 'Ctrl+L',
        category: 'Edit',
        keywords: ['link', 'url', 'hyperlink', 'href'],
        action: () => window.dispatchEvent(new CustomEvent('skrybl:toggle-link-bubble'))
      },
      {
        id: 'edit:number-equations',
        title: 'Number All Equations',
        subtitle: 'Number block equations in order',
        category: 'Edit',
        keywords: ['number', 'equation', 'label', 'numbered'],
        action: () => {
          // Dispatch a custom event that EditorArea listens to
          window.dispatchEvent(new CustomEvent('skrybl:number-equations'))
        }
      },
      // Navigation
      {
        id: 'nav:new-page',
        title: 'New Page',
        category: 'Navigation',
        keywords: ['new', 'page', 'add', 'create'],
        action: () => useNotebookStore.getState().addPage()
      },
      // History
      {
        id: 'history:create-snapshot',
        title: 'Create Snapshot',
        category: 'History',
        keywords: ['snapshot', 'version', 'save', 'backup'],
        action: () => useNotebookStore.getState().createSnapshot()
      },
      {
        id: 'history:version-history',
        title: 'Version History',
        category: 'History',
        keywords: ['version', 'history', 'snapshot', 'restore'],
        action: () => useUIStore.getState().toggleVersionHistory()
      },
      // Tabs
      {
        id: 'tab:close',
        title: 'Close Tab',
        subtitle: 'Ctrl+W',
        category: 'Tabs',
        keywords: ['close', 'tab'],
        action: () => {
          const s = useNotebookStore.getState()
          s.closeTab(s.activeTabId)
        }
      },
      {
        id: 'tab:next',
        title: 'Next Tab',
        subtitle: 'Ctrl+Tab',
        category: 'Tabs',
        keywords: ['next', 'tab', 'switch'],
        action: () => {
          const s = useNotebookStore.getState()
          if (s.tabs.length <= 1) return
          const idx = s.tabs.findIndex((t) => t.id === s.activeTabId)
          s.switchTab(s.tabs[(idx + 1) % s.tabs.length].id)
        }
      },
      {
        id: 'tab:prev',
        title: 'Previous Tab',
        subtitle: 'Ctrl+Shift+Tab',
        category: 'Tabs',
        keywords: ['previous', 'tab', 'switch'],
        action: () => {
          const s = useNotebookStore.getState()
          if (s.tabs.length <= 1) return
          const idx = s.tabs.findIndex((t) => t.id === s.activeTabId)
          s.switchTab(s.tabs[(idx - 1 + s.tabs.length) % s.tabs.length].id)
        }
      }
    ]

    useCommandStore.getState().register(commands)
    return () => useCommandStore.getState().unregister(commands.map((c) => c.id))
  }, [handleOpen, handleSave, handleSaveAs, handleExportLatex, handleExportMarkdown, handleExportHtml, handleExportPdf])

  return <Layout />
}
