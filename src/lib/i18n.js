// UI strings (brief section 9). One flat dictionary per language.
export const STRINGS = {
  en: {
    meta: '15 questions · 4 blocks · ~6 min',
    title: 'Could you pass a shop floor audit?',
    sub: 'Plasma, laser, waterjet and the decisions behind them. Real field scenarios, no vendor answers.',
    start: 'Start the quiz',
    blocks: ['Plasma', 'Laser', 'Waterjet', 'Decision'],
    check: 'Check answer',
    next: 'Next question',
    see: 'See my results',
    err: 'Pick an answer first',
    ok: 'Right.',
    no: 'Not quite.',
    read: 'Read more',
    soon: 'Laser 101 · coming soon',
    score: 'Your score',
    results: 'Results',
    weak: 'Weakest block',
    rd: 'Read',
    tool: 'Or run your own numbers in',
    prev: 'Your share card',
    share: 'Share on LinkedIn',
    copy: 'Copy suggested text',
    copied: 'Suggested text copied.',
    suggested: 'I scored {s}/15 on the shop floor audit quiz. Can your team beat it?',
    team: 'Send to your team',
    linkCopied: 'Link copied.',
    retake: 'Retake',
    more: 'One more thing',
    moreT: 'Get the next question every Friday in the Industrial Cutting Processes newsletter.',
    subB: 'Subscribe on LinkedIn',
    takeQuiz: 'Take the quiz',
    of: 'of',
  },
  pt: {
    meta: '15 perguntas · 4 blocos · ~6 min',
    title: 'Você passaria numa auditoria de chão de fábrica?',
    sub: 'Plasma, laser, waterjet e as decisões por trás deles. Cenários reais de campo, sem resposta de fabricante.',
    start: 'Começar o quiz',
    blocks: ['Plasma', 'Laser', 'Waterjet', 'Decisão'],
    check: 'Conferir resposta',
    next: 'Próxima pergunta',
    see: 'Ver meu resultado',
    err: 'Escolha uma resposta primeiro',
    ok: 'Isso mesmo.',
    no: 'Não exatamente.',
    read: 'Leia mais',
    soon: 'Laser 101 · em breve',
    score: 'Seu resultado',
    results: 'Resultado',
    weak: 'Bloco mais fraco',
    rd: 'Leia',
    tool: 'Ou faça suas contas no',
    prev: 'Seu card de compartilhamento',
    share: 'Compartilhar no LinkedIn',
    copy: 'Copiar texto sugerido',
    copied: 'Texto sugerido copiado.',
    suggested: 'Fiz {s}/15 no quiz de auditoria de chão de fábrica. Sua equipe consegue bater?',
    team: 'Enviar pra equipe',
    linkCopied: 'Link copiado.',
    retake: 'Refazer',
    more: 'Mais uma coisa',
    moreT: 'Receba a próxima pergunta toda sexta na newsletter Industrial Cutting Processes.',
    subB: 'Assinar no LinkedIn',
    takeQuiz: 'Fazer o quiz',
    of: 'de',
  },
  es: {
    meta: '15 preguntas · 4 bloques · ~6 min',
    title: '¿Pasarías una auditoría de planta?',
    sub: 'Plasma, láser, waterjet y las decisiones detrás de ellos. Escenarios reales de campo, sin respuestas de fabricante.',
    start: 'Empezar el quiz',
    blocks: ['Plasma', 'Láser', 'Waterjet', 'Decisión'],
    check: 'Revisar respuesta',
    next: 'Siguiente pregunta',
    see: 'Ver mi resultado',
    err: 'Elige una respuesta primero',
    ok: 'Correcto.',
    no: 'No exactamente.',
    read: 'Leer más',
    soon: 'Laser 101 · próximamente',
    score: 'Tu resultado',
    results: 'Resultado',
    weak: 'Bloque más débil',
    rd: 'Lee',
    tool: 'O calcula tus números en',
    prev: 'Tu tarjeta para compartir',
    share: 'Compartir en LinkedIn',
    copy: 'Copiar texto sugerido',
    copied: 'Texto sugerido copiado.',
    suggested: 'Saqué {s}/15 en el quiz de auditoría de planta. ¿Tu equipo puede superarlo?',
    team: 'Enviar a tu equipo',
    linkCopied: 'Enlace copiado.',
    retake: 'Repetir',
    more: 'Una cosa más',
    moreT: 'Recibe la próxima pregunta cada viernes en el newsletter Industrial Cutting Processes.',
    subB: 'Suscribirse en LinkedIn',
    takeQuiz: 'Hacer el quiz',
    of: 'de',
  },
}

export function detectLang() {
  // 1) ?lang= 2) Accept-Language (navigator) 3) en
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q && STRINGS[q]) return q
  } catch { /* no-op */ }
  try {
    const navs = navigator.languages || [navigator.language || 'en']
    for (const l of navs) {
      const low = (l || '').toLowerCase()
      if (low.startsWith('pt')) return 'pt'
      if (low.startsWith('es')) return 'es'
      if (low.startsWith('en')) return 'en'
    }
  } catch { /* no-op */ }
  return 'en'
}

export function tr(lang) {
  return STRINGS[STRINGS[lang] ? lang : 'en']
}
