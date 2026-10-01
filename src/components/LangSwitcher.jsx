const OPTS = [
  { key: 'en', label: 'EN' },
  { key: 'pt', label: 'PT' },
  { key: 'es', label: 'ES' },
]

export default function LangSwitcher({ lang, onChange }) {
  return (
    <div className="lang" role="group" aria-label="Language">
      {OPTS.map((o) => (
        <button
          key={o.key}
          className={lang === o.key ? 'on' : ''}
          aria-pressed={lang === o.key}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function TopBar({ lang, onChange }) {
  return (
    <div className="topbar">
      <span className="brand">
        Industrial Cutting <span className="labs">Labs</span>
      </span>
      <LangSwitcher lang={lang} onChange={onChange} />
    </div>
  )
}
