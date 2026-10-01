import { BLOCKS, BLOCK_MAX, CARD, bandFor } from '../../shared/content.js'
import { normalizeLang } from '../../shared/scoring.js'

// In-page SVG preview of the OG share card. Mirrors api/og.jsx visually.
// viewBox is the real 1200×627 card; it scales to the container width.

function wrap(text, max) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const next = line ? line + ' ' + w : w
    if (next.length > max && line) {
      lines.push(line)
      line = w
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

export function ShareCardSVG({ total, blocks, lang }) {
  const L = normalizeLang(lang)
  const band = bandFor(total, L)
  const card = CARD[L]
  const labels = BLOCKS[L]

  const W = 1200
  const H = 627
  const pad = 56
  const accent = 15
  const bandH = 72

  const nameLines = wrap(band.name, 22)
  const tagLines = wrap(band.tag, 30)

  // Right column bars
  const colX = 700
  const colW = W - colX - pad
  const rowGap = 92
  const rowsTop = 150
  const barW = colW
  const barH = 14

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label={`${total} out of 15 — ${band.name}`}>
      <rect x="0" y="0" width={W} height={H} fill="#111111" />
      {/* decorative circles top-right */}
      <circle cx={W - 40} cy={40} r={160} fill="none" stroke="#2a2a2a" strokeWidth="10" />
      <circle cx={W + 30} cy={-10} r={150} fill="none" stroke="#F26A21" strokeWidth="10" opacity="0.35" />
      {/* orange accent bar */}
      <rect x="0" y="0" width={accent} height={H} fill="#F26A21" />

      {/* top row */}
      <text x={pad} y={64} fontFamily="'Barlow Condensed', sans-serif" fontWeight="800"
        fontSize="26" letterSpacing="2" fill="#EEEEEE">
        INDUSTRIAL CUTTING <tspan fill="#F26A21">LABS</tspan>
      </text>
      <text x={W - pad} y={64} textAnchor="end" fontFamily="'Barlow', sans-serif"
        fontSize="22" fill="#9A9A9A">{card.short}</text>

      {/* left column */}
      <text x={pad} y={158} fontFamily="'Barlow', sans-serif" fontSize="28" fill="#9A9A9A">
        {card.scored}
      </text>
      <text x={pad} y={330} fontFamily="'Barlow Condensed', sans-serif" fontWeight="800"
        fontSize="210" fill="#F26A21">
        {total}<tspan fontSize="96" fill="#BBBBBB">/15</tspan>
      </text>
      {nameLines.map((ln, i) => (
        <text key={`n${i}`} x={pad} y={400 + i * 46} fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="700" fontSize="42" fill="#EEEEEE">{ln}</text>
      ))}
      {tagLines.map((ln, i) => (
        <text key={`t${i}`} x={pad} y={400 + nameLines.length * 46 + 14 + i * 32}
          fontFamily="'Barlow', sans-serif" fontSize="26" fill="#BBBBBB">{ln}</text>
      ))}

      {/* right column bars */}
      {labels.map((lbl, i) => {
        const y = rowsTop + i * rowGap
        const frac = BLOCK_MAX[i] ? blocks[i] / BLOCK_MAX[i] : 0
        return (
          <g key={`b${i}`}>
            <text x={colX} y={y} fontFamily="'Barlow Condensed', sans-serif" fontWeight="700"
              fontSize="24" letterSpacing="1" fill="#BBBBBB">{lbl.toUpperCase()}</text>
            <text x={W - pad} y={y} textAnchor="end" fontFamily="'Barlow', sans-serif"
              fontSize="22" fill="#9A9A9A">{blocks[i]}/{BLOCK_MAX[i]}</text>
            <rect x={colX} y={y + 14} width={barW} height={barH} rx={barH / 2} fill="#2e2e2e" />
            <rect x={colX} y={y + 14} width={Math.max(barH, barW * frac)} height={barH}
              rx={barH / 2} fill="#F26A21" />
          </g>
        )
      })}

      {/* bottom orange band */}
      <rect x="0" y={H - bandH} width={W} height={bandH} fill="#F26A21" />
      <text x={pad} y={H - bandH / 2 + 8} fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="800" fontSize="28" fill="#111111">{card.cta} →</text>
      <text x={W - pad} y={H - bandH / 2 + 7} textAnchor="end" fontFamily="'Barlow', sans-serif"
        fontWeight="600" fontSize="22" fill="#111111">quiz.industrialcuttinglabs.com</text>
    </svg>
  )
}
