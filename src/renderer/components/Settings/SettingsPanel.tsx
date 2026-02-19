import { useEffect, useState } from 'react'
import { useUIStore } from '../../stores/ui-store'
import { getMyScriptKeys, setMyScriptKeys, hasMyScriptKeys } from '../../lib/handwriting-engine'

export function SettingsPanel(): JSX.Element | null {
  const open = useUIStore((s) => s.settingsOpen)
  const close = useUIStore((s) => s.setSettingsOpen)

  const [appKey, setAppKey] = useState('')
  const [hmacKey, setHmacKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      const keys = getMyScriptKeys()
      setAppKey(keys.applicationKey)
      setHmacKey(keys.hmacKey)
      setSaved(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, close])

  if (!open) return null

  const handleSave = () => {
    setMyScriptKeys(appKey.trim(), hmacKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const configured = hasMyScriptKeys()

  return (
    <div className="shortcuts-overlay" onClick={() => close(false)}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-panel-header">Settings</div>

        <div style={{ padding: '16px 20px' }}>
          <div className="settings-section-title">Handwriting Recognition</div>
          <p className="settings-description">
            Draw math expressions and convert them to LaTeX using MyScript iink.
          </p>

          <div className="settings-field">
            <label className="settings-label">Application Key</label>
            <input
              className="settings-input"
              type="text"
              value={appKey}
              onChange={(e) => setAppKey(e.target.value)}
              placeholder="Enter MyScript application key"
              spellCheck={false}
            />
          </div>

          <div className="settings-field">
            <label className="settings-label">HMAC Key</label>
            <input
              className="settings-input"
              type="password"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Enter MyScript HMAC key"
              spellCheck={false}
            />
          </div>

          <div className="settings-actions">
            <button className="handwriting-btn handwriting-btn-accept" onClick={handleSave}>
              {saved ? 'Saved' : 'Save Keys'}
            </button>
            <span className="settings-status">
              {configured ? 'Connected' : 'Not configured'}
            </span>
          </div>

          <p className="settings-hint">
            Get free keys (2,000 recognitions/mo) at{' '}
            <span style={{ color: 'var(--text-secondary)' }}>developer.myscript.com</span>
          </p>
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
