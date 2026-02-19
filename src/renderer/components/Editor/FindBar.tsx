import { useState, useRef, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { useUIStore } from '../../stores/ui-store'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const highlightPluginKey = new PluginKey('findHighlight')

interface FindBarProps {
  editor: Editor | null
}

function createHighlightPlugin() {
  return new Plugin({
    key: highlightPluginKey,
    state: {
      init() {
        return { decorations: DecorationSet.empty, query: '', matches: [] as { from: number; to: number }[] }
      },
      apply(tr, prev) {
        const meta = tr.getMeta(highlightPluginKey)
        if (meta) return meta
        // Map decorations through document changes
        if (tr.docChanged) {
          return {
            ...prev,
            decorations: prev.decorations.map(tr.mapping, tr.doc)
          }
        }
        return prev
      }
    },
    props: {
      decorations(state) {
        return highlightPluginKey.getState(state)?.decorations ?? DecorationSet.empty
      }
    }
  })
}

function findAllMatches(editor: Editor, query: string): { from: number; to: number }[] {
  if (!query) return []
  const matches: { from: number; to: number }[] = []
  const { doc } = editor.state
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedQuery, 'gi')

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    let match: RegExpExecArray | null
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(node.text)) !== null) {
      matches.push({
        from: pos + match.index,
        to: pos + match.index + match[0].length
      })
    }
  })
  return matches
}

function setHighlights(editor: Editor, matches: { from: number; to: number }[], activeIndex: number) {
  const { tr } = editor.state
  const decorations = matches.map((m, i) =>
    Decoration.inline(m.from, m.to, {
      class: i === activeIndex ? 'find-highlight-active' : 'find-highlight'
    })
  )
  tr.setMeta(highlightPluginKey, {
    decorations: DecorationSet.create(editor.state.doc, decorations),
    matches
  })
  editor.view.dispatch(tr)
}

function clearHighlights(editor: Editor) {
  const { tr } = editor.state
  tr.setMeta(highlightPluginKey, {
    decorations: DecorationSet.empty,
    matches: []
  })
  editor.view.dispatch(tr)
}

// Export the plugin for registration in EditorArea
export { createHighlightPlugin }

export function FindBar({ editor }: FindBarProps): JSX.Element | null {
  const open = useUIStore((s) => s.findBarOpen)
  const close = useUIStore((s) => s.setFindBarOpen)
  const [query, setQuery] = useState('')
  const [replace, setReplace] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(-1)
  const matchesRef = useRef<{ from: number; to: number }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
    if (!open && editor) {
      clearHighlights(editor)
    }
  }, [open, editor])

  // Search and highlight matches
  const doSearch = useCallback((q: string) => {
    if (!editor || !q) {
      setMatchCount(0)
      setCurrentMatch(-1)
      matchesRef.current = []
      if (editor) clearHighlights(editor)
      return
    }

    const matches = findAllMatches(editor, q)
    matchesRef.current = matches
    setMatchCount(matches.length)

    if (matches.length > 0) {
      setCurrentMatch(0)
      setHighlights(editor, matches, 0)
      // Scroll first match into view
      editor.chain().setTextSelection(matches[0]).scrollIntoView().run()
    } else {
      setCurrentMatch(-1)
      clearHighlights(editor)
    }
  }, [editor])

  useEffect(() => { doSearch(query) }, [query, doSearch])

  const findNext = useCallback(() => {
    if (!editor || matchesRef.current.length === 0) return
    const next = (currentMatch + 1) % matchesRef.current.length
    setCurrentMatch(next)
    setHighlights(editor, matchesRef.current, next)
    editor.chain().setTextSelection(matchesRef.current[next]).scrollIntoView().run()
  }, [editor, currentMatch])

  const findPrev = useCallback(() => {
    if (!editor || matchesRef.current.length === 0) return
    const prev = (currentMatch - 1 + matchesRef.current.length) % matchesRef.current.length
    setCurrentMatch(prev)
    setHighlights(editor, matchesRef.current, prev)
    editor.chain().setTextSelection(matchesRef.current[prev]).scrollIntoView().run()
  }, [editor, currentMatch])

  const doReplace = useCallback(() => {
    if (!editor || currentMatch < 0 || !matchesRef.current[currentMatch]) return
    const m = matchesRef.current[currentMatch]
    editor.chain().deleteRange({ from: m.from, to: m.to }).insertContentAt(m.from, replace).run()
    // Re-search after replace
    doSearch(query)
  }, [editor, query, replace, currentMatch, doSearch])

  const replaceAll = useCallback(() => {
    if (!editor || !query || matchesRef.current.length === 0) return
    const matches = [...matchesRef.current]
    const { tr } = editor.state
    // Apply in reverse to preserve positions
    for (let i = matches.length - 1; i >= 0; i--) {
      tr.replaceWith(matches[i].from, matches[i].to, editor.state.schema.text(replace))
    }
    editor.view.dispatch(tr)
    doSearch(query)
  }, [editor, query, replace, doSearch])

  const handleClose = useCallback(() => {
    if (editor) clearHighlights(editor)
    close(false)
  }, [editor, close])

  if (!open) return null

  return (
    <div className="find-bar">
      {/* Toggle replace */}
      <button
        className="find-bar-close"
        onClick={() => setShowReplace(!showReplace)}
        title="Toggle replace"
        style={{ transform: showReplace ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Find input */}
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.shiftKey) findPrev()
          else if (e.key === 'Enter') findNext()
          if (e.key === 'Escape') handleClose()
        }}
        placeholder="Find..."
      />

      {/* Match count */}
      <span className="find-bar-count">
        {query ? `${matchCount > 0 ? currentMatch + 1 : 0}/${matchCount}` : ''}
      </span>

      {/* Nav buttons */}
      <button className="find-bar-btn" onClick={findPrev} title="Previous (Shift+Enter)">
        Prev
      </button>
      <button className="find-bar-btn" onClick={findNext} title="Next (Enter)">
        Next
      </button>

      {/* Replace */}
      {showReplace && (
        <>
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doReplace()
              if (e.key === 'Escape') handleClose()
            }}
            placeholder="Replace..."
            style={{ width: 160 }}
          />
          <button className="find-bar-btn" onClick={doReplace}>
            Replace
          </button>
          <button className="find-bar-btn" onClick={replaceAll}>
            All
          </button>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Close */}
      <button className="find-bar-close" onClick={handleClose} title="Close (Esc)">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
