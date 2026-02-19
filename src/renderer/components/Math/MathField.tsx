import { useRef, useState, useEffect, useCallback } from 'react'

interface MathFieldProps {
  latex: string
  onChange: (latex: string) => void
  isBlock: boolean
}

// MathLive loading state
let mathLiveReady: Promise<typeof import('mathlive')> | null = null

function loadMathLive(): Promise<typeof import('mathlive')> {
  if (!mathLiveReady) {
    mathLiveReady = import('mathlive')
  }
  return mathLiveReady
}

export function MathField({ latex, onChange, isBlock }: MathFieldProps): JSX.Element {
  const [editing, setEditing] = useState(!latex)
  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const latexRef = useRef(latex)
  latexRef.current = latex

  const startEditing = useCallback(() => setEditing(true), [])

  // Mount math-field when entering edit mode
  useEffect(() => {
    if (!editing) return

    const container = containerRef.current
    if (!container) return

    let mf: any = null
    let disposed = false

    loadMathLive().then(() => {
      if (disposed || !container) return

      mf = document.createElement('math-field')

      // Style it — monochrome, no accent
      mf.style.cssText = `
        display: inline-block;
        font-size: ${isBlock ? '1.2em' : '1em'};
        min-width: ${isBlock ? '120px' : '40px'};
        outline: none;
        border: none;
        background: transparent;
        color: var(--text-primary);
        --caret-color: var(--text-primary);
        --selection-background-color: rgba(255, 255, 255, 0.15);
        --contains-highlight-background-color: transparent;
        --smart-fence-color: #888888;
        --text-font-family: var(--font-mono);
        --placeholder-color: #555555;
        --highlight-inactive: rgba(255, 255, 255, 0.06);
      `

      // Disable the default sounds and smart mode quirks
      mf.smartMode = false
      mf.smartFence = true
      mf.smartSuperscript = true
      mf.mathModeSpace = '\\,'
      mf.removeExtraneousParentheses = true

      // Set initial value
      mf.value = latexRef.current

      // Listen for changes
      const handleInput = () => {
        if (!disposed) {
          onChangeRef.current(mf.value)
        }
      }

      const handleFocusOut = (e: FocusEvent) => {
        // Only exit editing if focus truly leaves (not going to a child)
        if (!disposed && !container.contains(e.relatedTarget as Node)) {
          setEditing(false)
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          setEditing(false)
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          e.stopPropagation()
          setEditing(false)
        }
      }

      mf.addEventListener('input', handleInput)
      mf.addEventListener('focusout', handleFocusOut)
      mf.addEventListener('keydown', handleKeyDown)

      container.innerHTML = ''
      container.appendChild(mf)

      // Focus after DOM settles — double rAF for TipTap NodeView commit
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!disposed && mf && document.contains(mf)) {
            mf.focus()
          }
        })
      })
    })

    return () => {
      disposed = true
      if (container) container.innerHTML = ''
    }
  }, [editing, isBlock])

  if (editing) {
    return (
      <div
        ref={containerRef}
        className={`math-editor-container ${isBlock ? 'math-editor-block' : 'math-editor-inline'}`}
      />
    )
  }

  // Display mode
  if (!latex) {
    return (
      <span
        className={`math-placeholder ${isBlock ? 'math-placeholder-block' : ''}`}
        onClick={startEditing}
      >
        {isBlock ? 'Click to add equation...' : 'f(x)'}
      </span>
    )
  }

  return <MathRender latex={latex} onClick={startEditing} isBlock={isBlock} />
}

function MathRender({
  latex,
  onClick,
  isBlock
}: {
  latex: string
  onClick: () => void
  isBlock: boolean
}): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let cancelled = false
    loadMathLive().then(({ convertLatexToMarkup }) => {
      if (cancelled || !ref.current) return
      ref.current.innerHTML = convertLatexToMarkup(latex, {
        defaultMode: 'math'
      })
    })
    return () => {
      cancelled = true
    }
  }, [latex])

  return (
    <span
      ref={ref}
      className={`math-render ${isBlock ? 'math-render-block' : 'math-render-inline'}`}
      onClick={onClick}
    />
  )
}
