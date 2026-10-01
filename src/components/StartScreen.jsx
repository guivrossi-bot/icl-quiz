import { TopBar } from './LangSwitcher.jsx'
import { STRINGS } from '../lib/i18n.js'

export default function StartScreen({ lang, onLang, onStart }) {
  const t = STRINGS[lang]
  return (
    <div className="wrap">
      <TopBar lang={lang} onChange={onLang} />
      <p className="hero-meta">{t.meta}</p>
      <h1 className="hero-title">{t.title}</h1>
      <p className="hero-sub">{t.sub}</p>
      <div className="start-pills">
        {t.blocks.map((b, i) => (
          <span className="pill" key={i}>{b}</span>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onStart}>{t.start}</button>
    </div>
  )
}
