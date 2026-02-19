import { useEffect } from 'react'
import { Sidebar } from '../Sidebar/Sidebar'
import { EditorArea } from '../Editor/EditorArea'
import { StatusBar } from './StatusBar'
import { TabBar } from './TabBar'
import { ShortcutsOverlay } from './ShortcutsOverlay'
import { CommandPalette } from '../CommandPalette/CommandPalette'
import { SettingsPanel } from '../Settings/SettingsPanel'
import { VersionHistoryPanel } from '../History/VersionHistoryPanel'
import { HomePage } from '../Home/HomePage'
import { useUIStore } from '../../stores/ui-store'
import { useNotebookStore } from '../../stores/notebook-store'
import { SkryblLogo } from '../SkryblLogo'
import { AppMenuBar } from './AppMenuBar'

export function Layout(): JSX.Element {
  const view = useUIStore((s) => s.view)
  const goHome = useUIStore((s) => s.goHome)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const focusMode = useUIStore((s) => s.focusMode)
  const theme = useUIStore((s) => s.theme)
  const isDirty = useNotebookStore((s) => s.isDirty)

  // Apply data-theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (view === 'home') {
    return (
      <div className="flex flex-col h-screen">
        <div className="titlebar">
          <div className="titlebar-left" style={{ paddingLeft: '8px' }} />
          <div className="titlebar-text" />
        </div>
        <HomePage />
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${focusMode ? 'focus-mode' : ''}`}>
      {/* Title bar */}
      <div className="titlebar">
        <div
          className="titlebar-left"
          style={{
            paddingLeft: !focusMode && sidebarOpen
              ? `calc(var(--sidebar-width) + 4px)`
              : !focusMode ? '42px' : '8px',
            transition: 'padding-left 0.2s var(--ease-out)'
          }}
        >
          {!focusMode && (
            <>
              <button className="titlebar-home-btn" onClick={goHome} title="Home">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8.5l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 7v6.5h3.5V10h2v3.5h3.5V7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
              <AppMenuBar />
            </>
          )}
        </div>

        <div className="titlebar-text">
          {isDirty && (
            <span style={{ color: 'var(--text-secondary)', marginRight: 4 }}>&#9675;</span>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {!focusMode && sidebarOpen && <Sidebar />}

        {/* Collapsed sidebar rail — visible when sidebar is closed */}
        {!focusMode && !sidebarOpen && (
          <div
            className="sidebar-collapsed"
            onClick={toggleSidebar}
            title="Show sidebar (Ctrl+\\)"
          >
            <div className="sidebar-collapsed-icon">
              <SkryblLogo size={14} color="currentColor" />
            </div>
            <div className="sidebar-collapsed-chevron">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--bg-editor)' }}>
          {!focusMode && <TabBar />}
          <EditorArea />
        </main>
      </div>

      {/* Status bar */}
      {!focusMode && <StatusBar />}

      <ShortcutsOverlay />
      <CommandPalette />
      <SettingsPanel />
      <VersionHistoryPanel />
    </div>
  )
}
