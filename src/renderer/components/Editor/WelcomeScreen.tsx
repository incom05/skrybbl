import { SkryblLogo } from '../SkryblLogo'

export function WelcomeScreen(): JSX.Element {
  return (
    <div className="welcome">
      {/* Logo */}
      <SkryblLogo size={48} color="var(--text-faint)" style={{ marginBottom: 4 }} />

      <h1 className="welcome-title">Skrybbl</h1>

      <p className="welcome-subtitle">
        A notebook for math, physics & engineering. Start typing or use a shortcut below.
      </p>

      <div className="welcome-shortcuts">
        <Shortcut keys={['/']} desc="Slash commands" />
        <Shortcut keys={['Ctrl', 'Shift', 'E']} desc="Inline math" />
        <Shortcut keys={['$', '$']} desc="Block equation" />
        <Shortcut keys={['Ctrl', 'K']} desc="Command palette" />
        <Shortcut keys={['Ctrl', 'S']} desc="Save notebook" />
        <Shortcut keys={['Ctrl', '/']} desc="All shortcuts" />
      </div>
    </div>
  )
}

function Shortcut({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <div className="welcome-shortcut">
      <span className="welcome-shortcut-keys">
        {keys.map((k, i) => (
          <kbd key={i}>{k}</kbd>
        ))}
      </span>
      <span className="welcome-shortcut-desc">{desc}</span>
    </div>
  )
}
