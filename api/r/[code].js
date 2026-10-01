import { BLOCKS, OG_AUDIT, bandFor } from '../../shared/content.js'
import { decodeCode, normalizeLang } from '../../shared/scoring.js'

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function originOf(req) {
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL.replace(/\/$/, '')
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0]
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export default function handler(req, res) {
  const code = (req.query && req.query.code) || ''
  const lang = normalizeLang(req.query && req.query.lang)
  const decoded = decodeCode(code)

  if (!decoded) {
    res.statusCode = 302
    res.setHeader('Location', `/?lang=${lang}`)
    res.end()
    return
  }

  const { total } = decoded
  const band = bandFor(total, lang)
  const origin = originOf(req)
  const resultUrl = `${origin}/r/${code}?lang=${lang}`
  const ogUrl = `${origin}/api/og?code=${encodeURIComponent(code)}&lang=${lang}`

  const title = `${total}/15 — ${band.name}`
  const description = `${band.tag} ${OG_AUDIT[lang]}`
  const cta = { en: 'Take the quiz', pt: 'Fazer o quiz', es: 'Hacer el quiz' }[lang]
  const sub = {
    en: 'Plasma, laser, waterjet and the decisions behind them. 15 questions · ~6 min.',
    pt: 'Plasma, laser, waterjet e as decisões por trás deles. 15 perguntas · ~6 min.',
    es: 'Plasma, láser, waterjet y las decisiones detrás de ellos. 15 preguntas · ~6 min.',
  }[lang]

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#111111" />
<title>${esc(title)} — Industrial Cutting Labs</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Industrial Cutting Labs" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(resultUrl)}" />
<meta property="og:image" content="${esc(ogUrl)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="627" />
<meta property="og:locale" content="${lang === 'pt' ? 'pt_BR' : lang === 'es' ? 'es_LA' : 'en_US'}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(ogUrl)}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Barlow',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#111;color:#eee;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .box{width:100%;max-width:640px;text-align:center}
  .brand{font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:14px;color:#eee;margin-bottom:20px}
  .brand .labs{color:#F26A21}
  .cardimg{width:100%;height:auto;border-radius:12px;border:1px solid #333;display:block}
  h1{font-size:24px;font-weight:700;margin:22px 0 8px;color:#eee}
  p.sub{color:#bbb;font-size:16px;margin-bottom:22px}
  a.cta{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:14px 28px;border-radius:8px;background:#F26A21;color:#111;font-weight:700;font-size:17px;text-decoration:none}
  a.cta:hover{background:#FF7D36}
  .foot{margin-top:28px;color:#9a9a9a;font-size:12px}
  .foot a{color:#bbb}
</style>
</head>
<body>
  <div class="box">
    <div class="brand">Industrial Cutting <span class="labs">Labs</span></div>
    <img class="cardimg" src="${esc(ogUrl)}" width="1200" height="627"
      alt="${esc(title)}" />
    <h1>${esc(band.name)} — ${total}/15</h1>
    <p class="sub">${esc(sub)}</p>
    <a class="cta" href="/?lang=${lang}">${esc(cta)} →</a>
    <div class="foot"><a href="https://industrialcuttinglabs.com">industrialcuttinglabs.com</a> · Industrial Cutting Processes</div>
  </div>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')
  res.statusCode = 200
  res.end(html)
}
