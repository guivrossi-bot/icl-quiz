// Shared, framework-free content used by BOTH the React SPA (via Vite) and the
// Vercel serverless/edge functions (api/og, api/r). No browser or React imports.

export const LANGS = ['en', 'pt', 'es']
export const BLOCK_MAX = [4, 4, 4, 3]
export const TOTAL_MAX = 15

// Localized block labels (match UI strings[lang].blocks).
export const BLOCKS = {
  en: ['Plasma', 'Laser', 'Waterjet', 'Decision'],
  pt: ['Plasma', 'Laser', 'Waterjet', 'Decisão'],
  es: ['Plasma', 'Láser', 'Waterjet', 'Decisión'],
}

// Profile bands by total score. First matching band wins (checked high → low).
export const BANDS = [
  {
    min: 13, max: 15,
    en: { name: 'Shop floor veteran', tag: 'Can your team beat this?' },
    pt: { name: 'Veterano de chão de fábrica', tag: 'Sua equipe consegue bater isso?' },
    es: { name: 'Veterano de planta', tag: '¿Tu equipo puede superar esto?' },
  },
  {
    min: 9, max: 12,
    en: { name: 'Solid operator', tag: 'A few blind spots worth a look' },
    pt: { name: 'Operador sólido', tag: 'Alguns pontos cegos valem uma olhada' },
    es: { name: 'Operador sólido', tag: 'Algunos puntos ciegos merecen una mirada' },
  },
  {
    min: 5, max: 8,
    en: { name: 'Process explorer', tag: 'Your machine is probably capable of more' },
    pt: { name: 'Explorador de processo', tag: 'Sua máquina provavelmente rende mais' },
    es: { name: 'Explorador de procesos', tag: 'Tu máquina probablemente rinde más' },
  },
  {
    min: 0, max: 4,
    en: { name: 'Worth a Discovery walk', tag: 'Start with the basics, they compound fast' },
    pt: { name: 'Hora de um Discovery', tag: 'Comece pelo básico, os ganhos se acumulam rápido' },
    es: { name: 'Hora de un Discovery', tag: 'Empieza por lo básico, los avances se acumulan rápido' },
  },
]

export function bandFor(total, lang) {
  const b = BANDS.find((x) => total >= x.min && total <= x.max) || BANDS[BANDS.length - 1]
  const L = LANGS.includes(lang) ? lang : 'en'
  return b[L]
}

// Share-card strings (section 6).
export const CARD = {
  en: { scored: 'I scored', cta: 'Take the shop floor audit', short: '15 questions · 6 min' },
  pt: { scored: 'Eu fiz', cta: 'Faça a auditoria de chão de fábrica', short: '15 perguntas · 6 min' },
  es: { scored: 'Saqué', cta: 'Haz la auditoría de planta', short: '15 preguntas · 6 min' },
}

// Suffix appended to og:description after the band tagline.
export const OG_AUDIT = {
  en: 'Take the 15-question shop floor audit.',
  pt: 'Faça a auditoria de chão de fábrica de 15 perguntas.',
  es: 'Haz la auditoría de planta de 15 preguntas.',
}

// Weakest-block routing (section 7). read.key / tool resolve against shared/links.js.
// read.badge marks the Laser "coming soon" dashed badge.
export const WEAKEST = [
  { block: 0, read: { key: 'plasma101', label: { en: 'Plasma 101', pt: 'Plasma 101', es: 'Plasma 101' } }, tool: 'ignite' },
  { block: 1, read: { key: 'fix', badge: true, label: { en: 'Laser 101', pt: 'Laser 101', es: 'Laser 101' } }, tool: 'cutbench' },
  { block: 2, read: { key: 'waterjet101', label: { en: 'Waterjet 101', pt: 'Waterjet 101', es: 'Waterjet 101' } }, tool: 'jetcalc' },
  { block: 3, read: { key: 'calc', label: { en: 'the cost-calculator read', pt: 'a leitura sobre custos', es: 'la lectura sobre costos' } }, tool: 'cutbench' },
]

export const DESIGN = {
  bg: '#111111',
  panel: '#1c1c1c',
  optBg: '#1a1a1a',
  optHover: '#262626',
  borderBtn: '#555555',
  borderDiv: '#333333',
  orange: '#F26A21',
  orangeHover: '#FF7D36',
  onOrange: '#111111',
  text: '#EEEEEE',
  text2: '#BBBBBB',
  muted: '#9A9A9A',
  correct: '#5DCAA5',
  wrong: '#F09595',
  track: '#333333',
  cardCircle: '#2a2a2a',
}
