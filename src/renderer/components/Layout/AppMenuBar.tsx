import { useState, useRef, useEffect, useCallback } from 'react'
import { useFileOperations } from '../../hooks/useFileOperations'
import { useUIStore, themes, themeLabels, type Theme } from '../../stores/ui-store'
import { useNotebookStore } from '../../stores/notebook-store'

interface MenuItem {
  label: string
  shortcut?: string
  action: () => void
  separator?: false
}

interface MenuSeparator {
  separator: true
}

type MenuEntry = MenuItem | MenuSeparator

interface MenuDef {
  label: string
  items: MenuEntry[]
}

export function AppMenuBar(): JSX.Element {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const { handleOpen, handleSave, handleSaveAs, handleExportLatex, handleExportMarkdown, handleExportHtml, handleExportPdf } =
    useFileOperations()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const toggleFindBar = useUIStore((s) => s.toggleFindBar)
  const toggleShortcuts = useUIStore((s) => s.toggleShortcutsOverlay)
  const setTheme = useUIStore((s) => s.setTheme)
  const currentTheme = useUIStore((s) => s.theme)
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette)
  const cycleFont = useUIStore((s) => s.cycleEditorFont)
  const spellcheck = useUIStore((s) => s.spellcheck)
  const toggleSpellcheck = useUIStore((s) => s.toggleSpellcheck)
  const addPage = useNotebookStore((s) => s.addPage)

  const themeItems: MenuEntry[] = themes.map((t) => ({
    label: `${currentTheme === t ? '\u2713 ' : '  '}${themeLabels[t]}`,
    action: () => setTheme(t as Theme)
  }))

  const goHome = useUIStore((s) => s.goHome)

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'Home', action: goHome },
        { separator: true },
        { label: 'Open...', shortcut: 'Ctrl+O', action: handleOpen },
        { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
        { separator: true },
        { label: 'Export as LaTeX...', action: handleExportLatex },
        { label: 'Export as Markdown...', action: handleExportMarkdown },
        { label: 'Export as HTML...', action: handleExportHtml },
        { label: 'Export as PDF...', action: handleExportPdf }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { separator: true },
        { label: 'Find & Replace', shortcut: 'Ctrl+F', action: toggleFindBar },
        { separator: true },
        { label: 'Insert Link', shortcut: 'Ctrl+L', action: () => window.dispatchEvent(new CustomEvent('skrybl:toggle-link-bubble')) },
        { separator: true },
        { label: `${spellcheck ? '\u2713 ' : '  '}Spellcheck`, action: toggleSpellcheck },
        { separator: true },
        { label: 'Number All Equations', action: () => window.dispatchEvent(new CustomEvent('skrybl:number-equations')) },
        { separator: true },
        { label: 'New Page', action: addPage }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Command Palette', shortcut: 'Ctrl+K', action: toggleCommandPalette },
        { label: 'Toggle Sidebar', shortcut: 'Ctrl+\\', action: toggleSidebar },
        { label: 'Focus Mode', shortcut: 'Ctrl+Shift+F', action: toggleFocusMode },
        { separator: true },
        ...themeItems,
        { separator: true },
        { label: 'Cycle Font', action: cycleFont },
        { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+/', action: toggleShortcuts }
      ]
    }
  ]

  const closeMenu = useCallback(() => {
    setOpenMenu(null)
    setHovering(false)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!openMenu) return
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [openMenu, closeMenu])

  // Close on Escape
  useEffect(() => {
    if (!openMenu) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openMenu, closeMenu])

  const handleClick = (label: string) => {
    if (openMenu === label) {
      closeMenu()
    } else {
      setOpenMenu(label)
      setHovering(true)
    }
  }

  const handleHover = (label: string) => {
    if (hovering && openMenu) {
      setOpenMenu(label)
    }
  }

  const handleItemClick = (action: () => void) => {
    closeMenu()
    action()
  }

  return (
    <div className="app-menubar" ref={barRef}>
      {menus.map((menu) => (
        <div key={menu.label} className="app-menu-wrapper">
          <button
            className={`app-menu-trigger ${openMenu === menu.label ? 'active' : ''}`}
            onClick={() => handleClick(menu.label)}
            onMouseEnter={() => handleHover(menu.label)}
          >
            {menu.label}
          </button>

          {openMenu === menu.label && (
            <div className="app-menu-dropdown">
              {menu.items.map((item, i) =>
                item.separator ? (
                  <div key={i} className="app-menu-separator" />
                ) : (
                  <button
                    key={i}
                    className="app-menu-item"
                    onClick={() => handleItemClick(item.action)}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="app-menu-shortcut">{item.shortcut}</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
