import { useEffect, useRef, useState, useCallback } from 'react'
import { loadIink, getMyScriptKeys, hasMyScriptKeys } from '../../lib/handwriting-engine'

interface HandwritingOverlayProps {
  onRecognized: (latex: string) => void
  onCancel: () => void
}

export function HandwritingOverlay({ onRecognized, onCancel }: HandwritingOverlayProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)
  const iinkEditorRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const keysConfigured = hasMyScriptKeys()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  useEffect(() => {
    if (!keysConfigured || !editorRef.current) return

    let disposed = false

    loadIink()
      .then((iink) => {
        if (disposed || !editorRef.current) return

        const { applicationKey, hmacKey } = getMyScriptKeys()

        const editor = new iink.Editor(editorRef.current, {
          configuration: {
            server: {
              applicationKey,
              hmacKey,
              protocol: 'WEBSOCKET',
              scheme: 'https',
              host: 'cloud.myscript.com'
            },
            recognition: {
              type: 'MATH',
              math: {
                mimeTypes: ['application/x-latex']
              }
            }
          }
        })

        iinkEditorRef.current = editor
        setLoading(false)
      })
      .catch((err) => {
        if (!disposed) {
          setError(err?.message || 'Failed to load handwriting engine')
          setLoading(false)
        }
      })

    return () => {
      disposed = true
      if (iinkEditorRef.current) {
        try {
          iinkEditorRef.current.close()
        } catch {}
        iinkEditorRef.current = null
      }
    }
  }, [keysConfigured])

  const handleClear = useCallback(() => {
    iinkEditorRef.current?.clear()
  }, [])

  const handleAccept = useCallback(async () => {
    const editor = iinkEditorRef.current
    if (!editor) return

    try {
      const result = await editor.export(['application/x-latex'])
      const latex =
        result?.['application/x-latex'] ??
        result?.exports?.['application/x-latex'] ??
        ''
      if (typeof latex === 'string' && latex.trim()) {
        onRecognized(latex.trim())
      }
    } catch (err: any) {
      setError(err?.message || 'Recognition failed')
    }
  }, [onRecognized])

  if (!keysConfigured) {
    return (
      <div className="handwriting-overlay" onClick={onCancel}>
        <div className="handwriting-panel" onClick={(e) => e.stopPropagation()}>
          <div className="handwriting-no-keys">
            <p>MyScript API keys not configured.</p>
            <p>Open Settings to enter your Application Key and HMAC Key.</p>
            <p style={{ fontSize: 11, marginTop: 8, color: 'var(--text-faint)' }}>
              Get free keys at developer.myscript.com
            </p>
            <button className="handwriting-btn" onClick={onCancel} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="handwriting-overlay" onClick={onCancel}>
      <div className="handwriting-panel" onClick={(e) => e.stopPropagation()}>
        <div className="handwriting-toolbar">
          <span className="handwriting-title">Draw Math</span>
          <div className="handwriting-toolbar-actions">
            <button className="handwriting-btn" onClick={handleClear}>Clear</button>
            <button className="handwriting-btn" onClick={onCancel}>Cancel</button>
            <button className="handwriting-btn handwriting-btn-accept" onClick={handleAccept}>Accept</button>
          </div>
        </div>

        <div className="handwriting-canvas-wrap">
          {loading && <div className="handwriting-loading">Loading handwriting engine...</div>}
          {error && <div className="handwriting-error">{error}</div>}
          <div
            ref={editorRef}
            className="handwriting-canvas"
            style={{ visibility: loading ? 'hidden' : 'visible' }}
          />
        </div>
      </div>
    </div>
  )
}
