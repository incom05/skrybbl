import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { JSONContent } from '@tiptap/core'
import type { Notebook, NotebookTab, Page, Snapshot } from '../types'

function createPage(title = 'Untitled'): Page {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    title,
    content: {
      type: 'doc',
      content: [{ type: 'paragraph' }]
    },
    createdAt: now,
    updatedAt: now
  }
}

function createNotebook(): Notebook {
  const page = createPage('Page 1')
  const now = new Date().toISOString()
  return {
    version: 1,
    title: 'Untitled Notebook',
    pages: [page],
    activePageId: page.id,
    createdAt: now,
    updatedAt: now
  }
}

function createTab(notebook?: Notebook, filePath?: string | null): NotebookTab {
  const nb = notebook ?? createNotebook()
  return {
    id: nanoid(),
    notebook: nb,
    filePath: filePath ?? null,
    isDirty: false
  }
}

interface NotebookState {
  tabs: NotebookTab[]
  activeTabId: string

  // Derived convenience (kept for backward compat with consumers)
  notebook: Notebook
  filePath: string | null
  isDirty: boolean
  activePage: Page

  // Tab actions
  openInNewTab: (notebook: Notebook, filePath?: string) => void
  switchTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void

  // Existing actions (scoped to active tab)
  setNotebook: (notebook: Notebook, filePath?: string) => void
  setFilePath: (path: string) => void
  setDirty: (dirty: boolean) => void
  updatePageContent: (pageId: string, content: JSONContent) => void
  setActivePage: (pageId: string) => void
  addPage: () => string
  deletePage: (pageId: string) => void
  renamePage: (pageId: string, title: string) => void
  renameNotebook: (title: string) => void
  reorderPages: (fromIndex: number, toIndex: number) => void
  getNotebookData: () => Notebook
  newNotebook: () => void

  // Snapshot actions
  createSnapshot: (title?: string) => void
  restoreSnapshot: (id: string) => void
}

function deriveFromTabs(tabs: NotebookTab[], activeTabId: string) {
  const tab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const nb = tab.notebook
  const activePage = nb.pages.find((p) => p.id === nb.activePageId) || nb.pages[0]
  return {
    notebook: nb,
    filePath: tab.filePath,
    isDirty: tab.isDirty,
    activePage
  }
}

function updateActiveTab(
  tabs: NotebookTab[],
  activeTabId: string,
  updater: (tab: NotebookTab) => NotebookTab
): NotebookTab[] {
  return tabs.map((t) => (t.id === activeTabId ? updater(t) : t))
}

export const useNotebookStore = create<NotebookState>((set, get) => {
  const initialTab = createTab()
  const initialDerived = deriveFromTabs([initialTab], initialTab.id)

  return {
    tabs: [initialTab],
    activeTabId: initialTab.id,
    ...initialDerived,

    // --- Tab actions ---

    openInNewTab: (notebook, filePath) => {
      const { tabs } = get()
      // If a tab with same filePath already exists, switch to it
      if (filePath) {
        const existing = tabs.find((t) => t.filePath === filePath)
        if (existing) {
          set({ activeTabId: existing.id, ...deriveFromTabs(tabs, existing.id) })
          return
        }
      }
      const tab = createTab(notebook, filePath)
      const newTabs = [...tabs, tab]
      set({ tabs: newTabs, activeTabId: tab.id, ...deriveFromTabs(newTabs, tab.id) })
    },

    switchTab: (tabId) => {
      const { tabs } = get()
      if (tabs.find((t) => t.id === tabId)) {
        set({ activeTabId: tabId, ...deriveFromTabs(tabs, tabId) })
      }
    },

    closeTab: (tabId) => {
      const { tabs, activeTabId } = get()
      if (tabs.length <= 1) {
        // Last tab — replace with fresh notebook
        const fresh = createTab()
        set({ tabs: [fresh], activeTabId: fresh.id, ...deriveFromTabs([fresh], fresh.id) })
        return
      }
      const newTabs = tabs.filter((t) => t.id !== tabId)
      let newActiveId = activeTabId
      if (activeTabId === tabId) {
        // Switch to adjacent tab
        const closedIdx = tabs.findIndex((t) => t.id === tabId)
        const nextIdx = Math.min(closedIdx, newTabs.length - 1)
        newActiveId = newTabs[nextIdx].id
      }
      set({ tabs: newTabs, activeTabId: newActiveId, ...deriveFromTabs(newTabs, newActiveId) })
    },

    reorderTabs: (fromIndex, toIndex) => {
      const { tabs, activeTabId } = get()
      const newTabs = [...tabs]
      const [moved] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, moved)
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    // --- Existing actions (scoped to active tab) ---

    setNotebook: (notebook, filePath) => {
      const { tabs, activeTabId } = get()
      // Check if already open in another tab
      if (filePath) {
        const existing = tabs.find((t) => t.filePath === filePath)
        if (existing) {
          set({ activeTabId: existing.id, ...deriveFromTabs(tabs, existing.id) })
          return
        }
      }
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook,
        filePath: filePath ?? t.filePath,
        isDirty: false
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    setFilePath: (path) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({ ...t, filePath: path }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    setDirty: (dirty) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({ ...t, isDirty: dirty }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    updatePageContent: (pageId, content) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => {
        const pages = t.notebook.pages.map((p) =>
          p.id === pageId ? { ...p, content, updatedAt: new Date().toISOString() } : p
        )
        return {
          ...t,
          notebook: { ...t.notebook, pages, updatedAt: new Date().toISOString() },
          isDirty: true
        }
      })
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    setActivePage: (pageId) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: { ...t.notebook, activePageId: pageId }
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    addPage: () => {
      const { tabs, activeTabId } = get()
      const tab = tabs.find((t) => t.id === activeTabId)!
      const page = createPage(`Page ${tab.notebook.pages.length + 1}`)
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: {
          ...t.notebook,
          pages: [...t.notebook.pages, page],
          activePageId: page.id,
          updatedAt: new Date().toISOString()
        },
        isDirty: true
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
      return page.id
    },

    deletePage: (pageId) => {
      const { tabs, activeTabId } = get()
      const tab = tabs.find((t) => t.id === activeTabId)!
      if (tab.notebook.pages.length <= 1) return

      const pages = tab.notebook.pages.filter((p) => p.id !== pageId)
      const activePageId =
        tab.notebook.activePageId === pageId ? pages[0].id : tab.notebook.activePageId
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: { ...t.notebook, pages, activePageId, updatedAt: new Date().toISOString() },
        isDirty: true
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    renamePage: (pageId, title) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => {
        const pages = t.notebook.pages.map((p) =>
          p.id === pageId ? { ...p, title, updatedAt: new Date().toISOString() } : p
        )
        return {
          ...t,
          notebook: { ...t.notebook, pages, updatedAt: new Date().toISOString() },
          isDirty: true
        }
      })
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    renameNotebook: (title) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: { ...t.notebook, title, updatedAt: new Date().toISOString() },
        isDirty: true
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    reorderPages: (fromIndex, toIndex) => {
      const { tabs, activeTabId } = get()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => {
        const pages = [...t.notebook.pages]
        const [moved] = pages.splice(fromIndex, 1)
        pages.splice(toIndex, 0, moved)
        return {
          ...t,
          notebook: { ...t.notebook, pages, updatedAt: new Date().toISOString() },
          isDirty: true
        }
      })
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    getNotebookData: () => {
      const { tabs, activeTabId } = get()
      const tab = tabs.find((t) => t.id === activeTabId) || tabs[0]
      return tab.notebook
    },

    newNotebook: () => {
      const { tabs, activeTabId } = get()
      const fresh = createNotebook()
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: fresh,
        filePath: null,
        isDirty: false
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    createSnapshot: (title) => {
      const { tabs, activeTabId } = get()
      const tab = tabs.find((t) => t.id === activeTabId)!
      const nb = tab.notebook
      const snapshots = nb.snapshots ? [...nb.snapshots] : []

      // Skip if identical to last snapshot (compare pages JSON)
      if (snapshots.length > 0) {
        const lastPages = JSON.stringify(snapshots[snapshots.length - 1].pages)
        const currentPages = JSON.stringify(nb.pages)
        if (lastPages === currentPages) return
      }

      const snapshot: Snapshot = {
        id: nanoid(),
        timestamp: new Date().toISOString(),
        title: title || `Snapshot ${snapshots.length + 1}`,
        pages: JSON.parse(JSON.stringify(nb.pages)) // deep clone
      }
      snapshots.push(snapshot)

      // Cap at 50 snapshots
      while (snapshots.length > 50) snapshots.shift()

      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: { ...t.notebook, snapshots }
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    },

    restoreSnapshot: (id) => {
      const { tabs, activeTabId } = get()
      const tab = tabs.find((t) => t.id === activeTabId)!
      const snapshot = tab.notebook.snapshots?.find((s) => s.id === id)
      if (!snapshot) return

      const pages = JSON.parse(JSON.stringify(snapshot.pages)) as Page[]
      const activePageId = pages[0]?.id || ''
      const newTabs = updateActiveTab(tabs, activeTabId, (t) => ({
        ...t,
        notebook: {
          ...t.notebook,
          pages,
          activePageId,
          updatedAt: new Date().toISOString()
        },
        isDirty: true
      }))
      set({ tabs: newTabs, ...deriveFromTabs(newTabs, activeTabId) })
    }
  }
})
