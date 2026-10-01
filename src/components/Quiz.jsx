import { useMemo, useState } from 'react'
import { TopBar } from './LangSwitcher.jsx'
import { STRINGS } from '../lib/i18n.js'
import { resolveLink, linkTitle } from '../../shared/links.js'
import { trackAnswer } from '../lib/tracker.js'
import questions from '../../content/questions.json'

const KEYS = ['A', 'B', 'C', 'D']

function shuffled(ids) {
  const a = [...ids]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Quiz({ lang, onLang, sessionId, onDone }) {
  const t = STRINGS[lang]

  // Shuffle option order once per attempt, tracked by option id (not position).
  const order = useMemo(
    () => questions.map((q) => shuffled(Object.keys(q[lang] ? q[lang].o : q.en.o))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState(() => questions.map(() => null))
  const [locked, setLocked] = useState(() => questions.map(() => false))
  const [err, setErr] = useState(false)

  const q = questions[idx]
  const qc = q[lang] || q.en
  const isLocked = locked[idx]
  const chosen = sel[idx]
  const isLast = idx === questions.length - 1
  const currentBlock = q.block

  function choose(id) {
    if (isLocked) return
    setErr(false)
    setSel((s) => s.map((v, i) => (i === idx ? id : v)))
  }

  function check() {
    if (chosen == null) {
      setErr(true)
      return
    }
    setLocked((l) => l.map((v, i) => (i === idx ? true : v)))
    trackAnswer({
      sessionId,
      lang,
      questionId: q.id,
      selectedOption: chosen,
      isCorrect: chosen === q.answer,
    })
  }

  function next() {
    if (isLast) {
      // Compute block scores from recorded selections.
      const blocks = [0, 0, 0, 0]
      questions.forEach((qq, i) => {
        if (sel[i] === qq.answer) blocks[qq.block] += 1
      })
      onDone(blocks)
      return
    }
    setErr(false)
    setIdx((i) => i + 1)
  }

  const verdictOk = chosen === q.answer

  return (
    <div className="wrap">
      <TopBar lang={lang} onChange={onLang} />

      <div className="quiz-head">
        <div className="pills">
          {t.blocks.map((b, i) => (
            <span
              key={i}
              className={'pill' + (i === currentBlock ? ' on' : i < currentBlock ? ' done' : '')}
            >
              {b}
            </span>
          ))}
        </div>
        <div className="progress">{idx + 1} / {questions.length}</div>
      </div>

      <div className="card">
        {q.image && (
          <div className="qimg-wrap">
            <img
              className="qimg"
              src={q.image}
              alt={(q.alt && q.alt[lang]) || (q.alt && q.alt.en) || ''}
              loading="eager"
            />
          </div>
        )}

        <p className="qtext">{qc.q}</p>

        <div className="opts">
          {order[idx].map((id, pos) => {
            let cls = 'opt'
            if (isLocked) {
              cls += ' locked'
              if (id === q.answer) cls += ' correct'
              else if (id === chosen) cls += ' wrong'
              else cls += ' dim'
            } else if (chosen === id) {
              cls += ' sel'
            }
            return (
              <button
                key={id}
                className={cls}
                onClick={() => choose(id)}
                disabled={isLocked}
                aria-pressed={chosen === id}
              >
                <span className="key">{KEYS[pos]}</span>
                <span>{qc.o[id]}</span>
              </button>
            )
          })}
        </div>

        {err && !isLocked && <p className="err">{t.err}</p>}

        {isLocked && (
          <div className={'explain ' + (verdictOk ? 'ok' : 'no')}>
            <p>
              <span className={'verdict ' + (verdictOk ? 'ok' : 'no')}>
                {verdictOk ? t.ok : t.no}
              </span>
              {qc.why}
            </p>
            <div className="read-row">
              <a className="read-link" href={resolveLink(q.link)} target="_blank" rel="noopener noreferrer">
                {t.rd}: {linkTitle(q.link)} →
              </a>
              {currentBlock === 1 && <span className="badge">{t.soon}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="actions">
        {!isLocked ? (
          <button className="btn btn-primary" onClick={check}>{t.check}</button>
        ) : (
          <button className="btn btn-primary" onClick={next}>
            {isLast ? t.see : t.next}
          </button>
        )}
      </div>
    </div>
  )
}
