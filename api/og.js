import { ImageResponse } from '@vercel/og'
import { createElement as h } from 'react'
import { BLOCKS, BLOCK_MAX, CARD, DESIGN, bandFor } from '../shared/content.js'
import { decodeCode, normalizeLang } from '../shared/scoring.js'

export const config = { runtime: 'edge' }

const W = 1200
const H = 627
const BAND_H = 72
const PAD = 56

function box(style, children) {
  return h('div', { style }, children)
}

// Load the same brand fonts the site uses (Barlow + Barlow Condensed) so the
// card matches. Cached across warm invocations; falls back silently to the
// built-in font if the fetch fails (card still renders).
let fontsPromise
function loadFonts() {
  if (!fontsPromise) {
    const b = 'https://cdn.jsdelivr.net/npm'
    const defs = [
      ['Barlow Condensed', 800, `${b}/@fontsource/barlow-condensed@5.2.6/files/barlow-condensed-latin-800-normal.woff`],
      ['Barlow Condensed', 700, `${b}/@fontsource/barlow-condensed@5.2.6/files/barlow-condensed-latin-700-normal.woff`],
      ['Barlow', 400, `${b}/@fontsource/barlow@5.2.6/files/barlow-latin-400-normal.woff`],
      ['Barlow', 600, `${b}/@fontsource/barlow@5.2.6/files/barlow-latin-600-normal.woff`],
    ]
    fontsPromise = Promise.all(
      defs.map(async ([name, weight, url]) => {
        try {
          const res = await fetch(url)
          if (!res.ok) return null
          return { name, weight, style: 'normal', data: await res.arrayBuffer() }
        } catch {
          return null
        }
      }),
    ).then((list) => list.filter(Boolean))
  }
  return fontsPromise
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const lang = normalizeLang(searchParams.get('lang'))
  const decoded = decodeCode(searchParams.get('code') || '')

  if (!decoded) {
    return new Response('Invalid code', { status: 400 })
  }

  const { total, blocks } = decoded
  const band = bandFor(total, lang)
  const card = CARD[lang]
  const labels = BLOCKS[lang]

  const tree = box(
    {
      position: 'relative',
      width: `${W}px`,
      height: `${H}px`,
      display: 'flex',
      backgroundColor: DESIGN.bg,
      overflow: 'hidden',
      fontFamily: 'Barlow, sans-serif',
    },
    [
      // decorative circles (top-right, partly off-canvas)
      box({
        position: 'absolute', top: '-30px', right: '-30px', width: '340px', height: '340px',
        borderRadius: '9999px', border: `10px solid ${DESIGN.cardCircle}`,
      }),
      box({
        position: 'absolute', top: '-90px', right: '-110px', width: '320px', height: '320px',
        borderRadius: '9999px', border: `10px solid ${DESIGN.orange}`, opacity: 0.35,
      }),
      // orange accent bar
      box({ position: 'absolute', top: 0, left: 0, width: '15px', height: `${H}px`, backgroundColor: DESIGN.orange }),

      // top row
      box(
        {
          position: 'absolute', top: `${PAD - 16}px`, left: `${PAD}px`, right: `${PAD}px`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        },
        [
          box({ display: 'flex', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '28px', fontWeight: 800, letterSpacing: '2px', color: DESIGN.text },
            [
              box({ display: 'flex' }, 'INDUSTRIAL CUTTING '),
              box({ display: 'flex', color: DESIGN.orange }, 'LABS'),
            ]),
          box({ display: 'flex', fontSize: '22px', color: DESIGN.muted }, card.short),
        ],
      ),

      // main content
      box(
        {
          position: 'absolute', top: '100px', left: `${PAD}px`, right: `${PAD}px`,
          bottom: `${BAND_H + 18}px`, display: 'flex', flexDirection: 'row', alignItems: 'center',
        },
        [
          // left column
          box(
            { display: 'flex', flexDirection: 'column', width: '640px' },
            [
              box({ display: 'flex', fontSize: '28px', color: DESIGN.muted, marginBottom: '2px' }, card.scored),
              box({ display: 'flex', alignItems: 'flex-end' }, [
                box({ display: 'flex', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '210px', fontWeight: 800, lineHeight: '1', color: DESIGN.orange }, String(total)),
                box({ display: 'flex', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '96px', fontWeight: 700, lineHeight: '1', color: DESIGN.text2, paddingBottom: '22px', paddingLeft: '6px' }, '/15'),
              ]),
              box({ display: 'flex', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '42px', fontWeight: 700, color: DESIGN.text, marginTop: '10px' }, band.name),
              box({ display: 'flex', fontSize: '26px', color: DESIGN.text2, marginTop: '6px', maxWidth: '560px' }, band.tag),
            ],
          ),
          // right column (bars)
          box(
            { display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'center', gap: '20px', paddingLeft: '28px' },
            labels.map((lbl, i) => {
              const frac = BLOCK_MAX[i] ? blocks[i] / BLOCK_MAX[i] : 0
              return box({ display: 'flex', flexDirection: 'column', width: '100%' }, [
                box({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, [
                  box({ display: 'flex', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 700, letterSpacing: '1px', color: DESIGN.text2 }, lbl.toUpperCase()),
                  box({ display: 'flex', fontSize: '22px', color: DESIGN.muted }, `${blocks[i]}/${BLOCK_MAX[i]}`),
                ]),
                box({ display: 'flex', width: '100%', height: '14px', backgroundColor: '#2e2e2e', borderRadius: '7px' }, [
                  box({ display: 'flex', width: `${Math.max(3, Math.round(frac * 100))}%`, height: '14px', backgroundColor: DESIGN.orange, borderRadius: '7px' }),
                ]),
              ])
            }),
          ),
        ],
      ),

      // bottom orange band
      box(
        {
          position: 'absolute', bottom: 0, left: 0, width: `${W}px`, height: `${BAND_H}px`,
          backgroundColor: DESIGN.orange, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', paddingLeft: `${PAD}px`, paddingRight: `${PAD}px`,
        },
        [
          box({ display: 'flex', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '30px', fontWeight: 800, color: DESIGN.onOrange }, `${card.cta} →`),
          box({ display: 'flex', fontSize: '22px', fontWeight: 600, color: DESIGN.onOrange }, 'quiz.industrialcuttinglabs.com'),
        ],
      ),
    ],
  )

  const fonts = await loadFonts()

  return new ImageResponse(tree, {
    width: W,
    height: H,
    ...(fonts.length ? { fonts } : {}),
    headers: {
      'Cache-Control': 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000',
    },
  })
}
