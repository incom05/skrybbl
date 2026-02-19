import { create } from 'zustand'

type Theme = 'dark' | 'light' | 'midnight' | 'paper' | 'nord' | 'green'
export type EditorFont = 'mono' | 'sans' | 'serif'
export type AppView = 'home' | 'editor'

const themes: Theme[] = ['dark', 'light', 'midnight', 'paper', 'nord', 'green']

const themeLabels: Record<Theme, string> = {
  dark: 'Dark',
  light: 'Light',
  midnight: 'Midnight',
  paper: 'Paper',
  nord: 'Nord',
  green: 'Green'
}

const themeTitlebarColors: Record<Theme, { color: string; symbolColor: string }> = {
  dark:     { color: '#0a0a0a', symbolColor: '#888888' },
  light:    { color: '#fafafa', symbolColor: '#666666' },
  midnight: { color: '#0b0d14', symbolColor: '#7a8194' },
  paper:    { color: '#f5f0e8', symbolColor: '#6b5d4a' },
  nord:     { color: '#2e3440', symbolColor: '#8890a0' },
  green:    { color: '#080c08', symbolColor: '#5a8a5a' }
}

export type SidebarSort = 'default' | 'lastOpened'

interface UIState {
  view: AppView
  sidebarOpen: boolean
  shortcutsOverlayOpen: boolean
  focusMode: boolean
  findBarOpen: boolean
  commandPaletteOpen: boolean
  settingsOpen: boolean
  versionHistoryOpen: boolean
  theme: Theme
  editorFont: EditorFont
  spellcheck: boolean
  sidebarSort: SidebarSort

  setView: (view: AppView) => void
  goHome: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleShortcutsOverlay: () => void
  setShortcutsOverlayOpen: (open: boolean) => void
  toggleFocusMode: () => void
  setFocusMode: (on: boolean) => void
  toggleFindBar: () => void
  setFindBarOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleSettings: () => void
  setSettingsOpen: (open: boolean) => void
  toggleVersionHistory: () => void
  setVersionHistoryOpen: (open: boolean) => void
  toggleTheme: () => void
  cycleTheme: () => void
  setTheme: (theme: Theme) => void
  getThemeLabel: () => string
  cycleEditorFont: () => void
  setEditorFont: (font: EditorFont) => void
  toggleSpellcheck: () => void
  setSidebarSort: (sort: SidebarSort) => void
}

function getInitialSpellcheck(): boolean {
  try {
    const stored = localStorage.getItem('skrybl-spellcheck')
    if (stored === 'false') return false
  } catch {}
  return true
}

function getInitialSidebarSort(): SidebarSort {
  try {
    const stored = localStorage.getItem('skrybl-sidebar-sort')
    if (stored === 'default' || stored === 'lastOpened') return stored
  } catch {}
  return 'default'
}

function getInitialEditorFont(): EditorFont {
  try {
    const stored = localStorage.getItem('skrybl-editor-font')
    if (stored === 'mono' || stored === 'sans' || stored === 'serif') return stored
  } catch {}
  return 'mono'
}

const fontCycle: EditorFont[] = ['mono', 'sans', 'serif']

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('skrybl-theme')
    if (stored && themes.includes(stored as Theme)) return stored as Theme
  } catch {}
  return 'dark'
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('skrybl-theme', theme)
  window.electron?.setTitleBarTheme?.(themeTitlebarColors[theme])
}

export { themes, themeLabels }
export type { Theme }

export const useUIStore = create<UIState>((set, get) => ({
  view: 'home' as AppView,
  sidebarOpen: true,
  shortcutsOverlayOpen: false,
  focusMode: false,
  findBarOpen: false,
  commandPaletteOpen: false,
  settingsOpen: false,
  versionHistoryOpen: false,
  theme: getInitialTheme(),
  editorFont: getInitialEditorFont(),
  spellcheck: getInitialSpellcheck(),
  sidebarSort: getInitialSidebarSort(),

  setView: (view) => set({ view }),
  goHome: () => set({ view: 'home' as AppView }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleShortcutsOverlay: () => set((s) => ({ shortcutsOverlayOpen: !s.shortcutsOverlayOpen })),
  setShortcutsOverlayOpen: (open) => set({ shortcutsOverlayOpen: open }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode, sidebarOpen: s.focusMode ? true : false })),
  setFocusMode: (on) => set({ focusMode: on }),
  toggleFindBar: () => set((s) => ({ findBarOpen: !s.findBarOpen })),
  setFindBarOpen: (open) => set({ findBarOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  toggleVersionHistory: () => set((s) => ({ versionHistoryOpen: !s.versionHistoryOpen })),
  setVersionHistoryOpen: (open) => set({ versionHistoryOpen: open }),

  // toggleTheme cycles through all themes (same as cycleTheme)
  toggleTheme: () =>
    set((s) => {
      const idx = themes.indexOf(s.theme)
      const next = themes[(idx + 1) % themes.length]
      applyTheme(next)
      return { theme: next }
    }),

  cycleTheme: () =>
    set((s) => {
      const idx = themes.indexOf(s.theme)
      const next = themes[(idx + 1) % themes.length]
      applyTheme(next)
      return { theme: next }
    }),

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },

  getThemeLabel: () => themeLabels[get().theme],

  cycleEditorFont: () =>
    set((s) => {
      const idx = fontCycle.indexOf(s.editorFont)
      const next = fontCycle[(idx + 1) % fontCycle.length]
      localStorage.setItem('skrybl-editor-font', next)
      return { editorFont: next }
    }),
  setEditorFont: (font) => {
    localStorage.setItem('skrybl-editor-font', font)
    set({ editorFont: font })
  },
  toggleSpellcheck: () =>
    set((s) => {
      const next = !s.spellcheck
      localStorage.setItem('skrybl-spellcheck', String(next))
      return { spellcheck: next }
    }),
  setSidebarSort: (sort) => {
    localStorage.setItem('skrybl-sidebar-sort', sort)
    set({ sidebarSort: sort })
  }
}))
