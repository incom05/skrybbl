import { useUIStore } from '../../stores/ui-store'
import { useEffect } from 'react'

const sections = [
  {
    title: 'File',
    items: [
      { keys: ['Ctrl', 'O'], desc: 'Open notebook' },
      { keys: ['Ctrl', 'S'], desc: 'Save' },
      { keys: ['Ctrl', 'Shift', 'S'], desc: 'Save as' }
    ]
  },
  {
    title: 'Format',
    items: [
      { keys: ['Ctrl', 'B'], desc: 'Bold' },
      { keys: ['Ctrl', 'I'], desc: 'Italic' },
      { keys: ['Ctrl', 'Z'], desc: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' }
    ]
  },
  {
    title: 'Math',
    items: [
      { keys: ['Ctrl', 'Shift', 'E'], desc: 'Inline math' },
      { keys: ['Ctrl', 'Shift', 'M'], desc: 'Block math' },
      { keys: ['$', '...', '$'], desc: 'Inline math rule' },
      { keys: ['$', '$'], desc: 'Block math rule' },
      { keys: ['/'], desc: 'Slash commands' }
    ]
  },
  {
    title: 'View',
    items: [
      { keys: ['Ctrl', 'K'], desc: 'Command palette' },
      { keys: ['Ctrl', '\\'], desc: 'Toggle sidebar' },
      { keys: ['Ctrl', 'Shift', 'F'], desc: 'Focus mode' },
      { keys: ['Ctrl', 'F'], desc: 'Find & replace' },
      { keys: ['Ctrl', '/'], desc: 'Keyboard shortcuts' }
    ]
  }
]

export function ShortcutsOverlay(): JSX.Element | null {
  const open = useUIStore((s) => s.shortcutsOverlayOpen)
  const close = useUIStore((s) => s.setShortcutsOverlayOpen)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, close])

  if (!open) return null

  return (
    <div className="shortcuts-overlay" onClick={() => close(false)}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-panel-header">
          Keyboard Shortcuts
        </div>

        <div style={{ padding: '14px 18px' }} className="space-y-5 max-h-[60vh] overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="shortcuts-section-title">{section.title}</div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div key={item.desc} className="shortcut-row">
                    <span className="shortcut-desc">{item.desc}</span>
                    <span className="shortcut-keys">
                      {item.keys.map((k, i) => (
                        <kbd key={i}>{k}</kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-panel-footer">
          Press <kbd style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 18,
            padding: '0 4px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: 9
          }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}
