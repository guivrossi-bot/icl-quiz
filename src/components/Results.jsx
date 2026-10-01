import { useEffect, useRef, useState } from 'react'
import { TopBar } from './LangSwitcher.jsx'
import { ShareCardSVG } from './ShareCard.jsx'
import { STRINGS } from '../lib/i18n.js'
import { BLOCKS, BLOCK_MAX, bandFor } from '../../shared/content.js'
import { encodeCode, weakestRouting } from '../../shared/scoring.js'
import { resolveLink, TOOLS } from '../../shared/links.js'
import { trackCompletion, trackShared } from '../lib/tracker.js'

function siteOrigin() {
  const env = import.meta.env.VITE_SITE_URL
  if (env) return env.replace(/\/$/, '')
  try {
    return window.location.origin
  } catch {
    return 'https://quiz.industrialcuttinglabs.com'
  }
}

export default function Results({ lang, onLang, blocks, sessionId, onRetake }) {
  const t = STRINGS[lang]
  const total = blocks.reduce((a, b) => a + b, 0)
  const band = bandFor(total, lang)
  const labels = BLOCKS[lang]
  const weak = weakestRouting(blocks)
  const weakLabel = BLOCKS[lang][weak.block]

  const code = encodeCode(blocks)
  const resultUrl = `${siteOrigin()}/r/${code}?lang=${lang}`

  const [toast, setToast] = useState('')
  const [shared, setShared] = useState(false)
  const toastTimer = useRef(null)
  const completed = useRef(false)

  useEffect(() => {
    if (completed.current) return
    completed.current = true
    trackCompletion({ sessionId, lang, total, blocks })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function flash(msg) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  function onShare() {
    // LinkedIn can't prefill the post text, so copy the suggested text to the
    // clipboard first — then the composer opens and the user just pastes it.
    const suggested = t.suggested.replace('{s}', String(total))
    try {
      navigator.clipboard?.writeText(suggested)
    } catch {
      /* clipboard may be unavailable; sharing still works */
    }
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    flash(t.sharedHint)
    if (!shared) {
      setShared(true)
      trackShared({ sessionId })
    }
  }

  async function onCopyText() {
    const text = t.suggested.replace('{s}', String(total)) + ' ' + resultUrl
    try {
      await navigator.clipboard.writeText(text)
      flash(t.copied)
    } catch {
      flash(t.copied)
    }
  }

  async function onTeam() {
    if (navigator.share) {
      try {
        await navigator.share({ title: t.title, url: resultUrl })
        return
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(resultUrl)
    } catch {
      /* ignore */
    }
    flash(t.linkCopied)
  }

  return (
    <div className="wrap">
      <TopBar lang={lang} onChange={onLang} />

      <div className="score-box">
        <div className="score-label">{t.score}</div>
        <div className="score-big">
          {total}<span className="den"> / 15</span>
        </div>
        <div className="score-name">{band.name}</div>
        <div className="score-tag">{band.tag}</div>
      </div>

      <div className="bars">
        {labels.map((lbl, i) => {
          const frac = BLOCK_MAX[i] ? blocks[i] / BLOCK_MAX[i] : 0
          return (
            <div className="bar-row" key={i}>
              <span className="bar-label">{lbl}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${Math.round(frac * 100)}%` }} />
              </span>
              <span className="bar-num">{blocks[i]}/{BLOCK_MAX[i]}</span>
            </div>
          )
        })}
      </div>

      <div className="weak">
        <h3>{t.weak}: <span className="weak-block">{weakLabel}</span></h3>
        <div className="primary-read">
          <a className="read-link" href={resolveLink(weak.read.key)} target="_blank" rel="noopener noreferrer">
            {t.rd} {weak.read.label[lang]} →
          </a>
          {weak.read.badge && <span className="badge">{t.soon}</span>}
        </div>
        <p className="secondary">
          {t.tool}{' '}
          <a href={TOOLS[weak.tool].url} target="_blank" rel="noopener noreferrer">
            {TOOLS[weak.tool].label}
          </a>
        </p>
      </div>

      <div className="section-label">{t.prev}</div>
      <div className="card-preview">
        <ShareCardSVG total={total} blocks={blocks} lang={lang} />
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onShare}>{t.share}</button>
        <div className="row2">
          <button className="btn" onClick={onCopyText}>{t.copy}</button>
          <button className="btn" onClick={onTeam}>{t.team}</button>
        </div>
        <button className="btn btn-ghost" onClick={onRetake}>{t.retake}</button>
        <div className="toast">{toast}</div>
      </div>

      {shared && (
        <div className="step2">
          <h3>{t.more}</h3>
          <p>{t.moreT}</p>
          <a
            className="btn btn-primary"
            href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7419724116267520000"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.subB}
          </a>
        </div>
      )}

      <p className="footer-note">industrialcuttinglabs.com · Industrial Cutting Processes</p>
    </div>
  )
}
