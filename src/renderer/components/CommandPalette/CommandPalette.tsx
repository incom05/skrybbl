import { useState, useEffect, useRef, useMemo } from 'react'
import { useUIStore } from '../../stores/ui-store'
import { useCommandStore } from '../../stores/command-store'

export function CommandPalette(): JSX.Element | null {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const close = useUIStore((s) => s.setCommandPaletteOpen)
  const commands = useCommandStore((s) => s.commands)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q))
    )
  }, [commands, query])

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Clamp selection
  useEffect(() => {
    if (selected >= filtered.length) setSelected(Math.max(0, filtered.length - 1))
  }, [filtered.length, selected])

  // Global Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        useUIStore.getState().toggleCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (s + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => (s - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selected]) {
        close(false)
        filtered[selected].action()
      }
    }
  }

  return (
    <div className="command-palette-overlay" onClick={() => close(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="command-palette-input"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(0)
          }}
          onKeyDown={handleKeyDown}
        />

        <div className="command-palette-list">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">No commands found</div>
          ) : (
            filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                className={`command-palette-item ${i === selected ? 'selected' : ''}`}
                onClick={() => {
                  close(false)
                  cmd.action()
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <div>
                  <div className="command-palette-item-title">{cmd.title}</div>
                  {cmd.subtitle && (
                    <div className="command-palette-item-subtitle">{cmd.subtitle}</div>
                  )}
                </div>
                <div className="command-palette-item-category">{cmd.category}</div>
              </div>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> execute</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
