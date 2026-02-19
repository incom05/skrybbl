import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useEffect, useRef, useCallback } from 'react'
import { useNotebookStore } from '../../stores/notebook-store'
import { useUIStore } from '../../stores/ui-store'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useEditorStats } from '../../hooks/useEditorStats'
import { InlineMath } from '../../extensions/inline-math'
import { BlockMath } from '../../extensions/block-math'
import { SlashCommand } from '../../extensions/slash-command'
import { MathInputRules } from '../../extensions/math-input-rules'
import { ComputeField } from '../../extensions/compute-field'
import { GraphPlot } from '../../extensions/graph-plot'
import { ImageNode } from '../../extensions/image-node'
import { CodeBlockHighlight } from '../../extensions/code-block-highlight'
import { Toolbar } from './Toolbar'
import { FindBar, createHighlightPlugin } from './FindBar'
import { LinkBubble } from './LinkBubble'
import { EditorContextMenu } from './EditorContextMenu'
import { Extension } from '@tiptap/core'

// Wrap the ProseMirror plugin in a TipTap extension
const FindHighlight = Extension.create({
  name: 'findHighlight',
  addProseMirrorPlugins() {
    return [createHighlightPlugin()]
  }
})

export function EditorArea(): JSX.Element {
  const activePage = useNotebookStore((s) => s.activePage)
  const updatePageContent = useNotebookStore((s) => s.updatePageContent)
  const toggleShortcuts = useUIStore((s) => s.toggleShortcutsOverlay)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const toggleFindBar = useUIStore((s) => s.toggleFindBar)
  const focusMode = useUIStore((s) => s.focusMode)
  const editorFont = useUIStore((s) => s.editorFont)
  const spellcheck = useUIStore((s) => s.spellcheck)
  const setStats = useEditorStats((s) => s.setStats)
  const activeTabId = useNotebookStore((s) => s.activeTabId)
  const tabs = useNotebookStore((s) => s.tabs)
  const switchTab = useNotebookStore((s) => s.switchTab)
  const closeTab = useNotebookStore((s) => s.closeTab)
  const pageIdRef = useRef(activePage.id)
  const tabIdRef = useRef(activeTabId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false
      }),
      CodeBlockHighlight,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            const level = node.attrs.level
            return level === 1 ? 'Heading' : level === 2 ? 'Subheading' : 'Section'
          }
          return "Type '/' for commands..."
        }
      }),
      Subscript,
      Superscript,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' }
      }),
      InlineMath,
      BlockMath,
      SlashCommand,
      MathInputRules,
      ComputeField,
      GraphPlot,
      ImageNode,
      FindHighlight
    ],
    content: activePage.content,
    onUpdate: ({ editor }) => {
      updatePageContent(pageIdRef.current, editor.getJSON())

      // Update word/char stats
      const text = editor.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const chars = text.length
      setStats(words, chars)
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
        spellcheck: spellcheck ? 'true' : 'false'
      },
      handleKeyDown: (_view, event) => {
        // Ctrl+\ → toggle sidebar
        if (event.ctrlKey && event.key === '\\') {
          event.preventDefault()
          toggleSidebar()
          return true
        }
        // Ctrl+/ → shortcuts overlay
        if (event.ctrlKey && event.key === '/') {
          event.preventDefault()
          toggleShortcuts()
          return true
        }
        // Ctrl+Shift+F → focus mode
        if (event.ctrlKey && event.shiftKey && event.key === 'F') {
          event.preventDefault()
          toggleFocusMode()
          return true
        }
        // Ctrl+F → find bar
        if (event.ctrlKey && !event.shiftKey && event.key === 'f') {
          event.preventDefault()
          toggleFindBar()
          return true
        }
        // Ctrl+L → insert/edit link
        if (event.ctrlKey && !event.shiftKey && event.key === 'l') {
          event.preventDefault()
          window.dispatchEvent(new CustomEvent('skrybl:toggle-link-bubble'))
          return true
        }
        return false
      }
    }
  })

  useAutoSave()

  // Sync content when active page or active tab changes
  useEffect(() => {
    if (!editor) return
    const pageChanged = activePage.id !== pageIdRef.current
    const tabChanged = activeTabId !== tabIdRef.current

    if (pageChanged || tabChanged) {
      pageIdRef.current = activePage.id
      tabIdRef.current = activeTabId
      editor.commands.setContent(activePage.content)

      // Update stats for new page
      const text = editor.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setStats(words, text.length)
    }
  }, [editor, activePage.id, activePage.content, activeTabId, setStats])

  // Initial stats
  useEffect(() => {
    if (editor) {
      const text = editor.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setStats(words, text.length)
    }
  }, [editor, setStats])

  // Sync spellcheck attribute when toggled
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: 'tiptap',
            spellcheck: spellcheck ? 'true' : 'false'
          }
        }
      })
    }
  }, [editor, spellcheck])

  // Listen for "Number All Equations" command
  useEffect(() => {
    const handler = () => {
      if (!editor) return
      const { tr } = editor.state
      let changed = false
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'blockMath' && !node.attrs.numbered) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, numbered: true })
          changed = true
        }
      })
      if (changed) {
        editor.view.dispatch(tr)
      }
    }
    window.addEventListener('skrybl:number-equations', handler)
    return () => window.removeEventListener('skrybl:number-equations', handler)
  }, [editor])

  // Global keyboard shortcuts that work even outside editor focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Escape exits focus mode from anywhere
      if (e.key === 'Escape' && focusMode) {
        e.preventDefault()
        toggleFocusMode()
        return
      }
      // Ctrl+Shift+F toggles focus mode from anywhere
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
        return
      }
      // Ctrl+\ toggles sidebar from anywhere
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault()
        toggleSidebar()
        return
      }
      // Ctrl+W close tab
      if (e.ctrlKey && !e.shiftKey && e.key === 'w') {
        e.preventDefault()
        const state = useNotebookStore.getState()
        if (state.tabs.length > 1) {
          closeTab(state.activeTabId)
        }
        return
      }
      // Ctrl+Tab / Ctrl+Shift+Tab cycle tabs
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault()
        const state = useNotebookStore.getState()
        if (state.tabs.length <= 1) return
        const idx = state.tabs.findIndex((t) => t.id === state.activeTabId)
        const next = e.shiftKey
          ? (idx - 1 + state.tabs.length) % state.tabs.length
          : (idx + 1) % state.tabs.length
        switchTab(state.tabs[next].id)
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusMode, toggleFocusMode, toggleSidebar, closeTab, switchTab])

  // Click below content → append paragraph and focus
  const handleClickBelow = useCallback(() => {
    if (!editor) return
    const { doc } = editor.state
    const lastNode = doc.lastChild
    // If last node is already an empty paragraph, just focus it
    if (lastNode && lastNode.type.name === 'paragraph' && lastNode.textContent === '') {
      editor.commands.focus('end')
      return
    }
    // Otherwise insert a new paragraph at the end and focus
    editor
      .chain()
      .focus('end')
      .command(({ tr, dispatch }) => {
        if (dispatch) {
          const para = editor.state.schema.nodes.paragraph.create()
          tr.insert(tr.doc.content.size, para)
        }
        return true
      })
      .focus('end')
      .run()
  }, [editor])

  return (
    <div className={`flex flex-col h-full editor-font-${editorFont}`}>
      {!focusMode && <Toolbar editor={editor} />}
      <FindBar editor={editor} />

      <div
        className="flex-1 overflow-y-auto editor-scroll"
        style={{ padding: focusMode ? '60px 3rem 120px' : '2rem 3rem 4rem' }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <EditorContent editor={editor} />
          <div className="editor-click-below" onClick={handleClickBelow} />
        </div>
      </div>

      <LinkBubble editor={editor} />
      <EditorContextMenu editor={editor} />

      {/* Focus mode exit hint */}
      {focusMode && (
        <button
          className="focus-exit-hint"
          onClick={toggleFocusMode}
          title="Exit focus mode (Esc or Ctrl+Shift+F)"
        >
          Exit Focus
        </button>
      )}
    </div>
  )
}
