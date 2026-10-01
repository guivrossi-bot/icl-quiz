// All outbound links in ONE place so TODOs are easy to swap (brief section 7).
// While a TODO is open, fall back to the newsletter page URL.

export const NEWSLETTER = 'https://www.linkedin.com/newsletters/industrial-cutting-processes-7419724116267520000/'
export const SUBSCRIBE = 'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7419724116267520000'

export const LINKS = {
  // Plasma 101 series.
  p1: 'https://www.linkedin.com/pulse/plasma-101-part-1-what-fast-five-got-surprisingly-right-gui-rossi-lnmhf', // Part 1
  p2: 'https://www.linkedin.com/pulse/plasma-101-part-2-gases-gui-rossi-bri6f', // Part 2: Gases
  p3: 'https://www.linkedin.com/pulse/plasma-101-part-3-consumables-gui-rossi-pc5yf', // Part 3: Consumables
  p4: 'https://www.linkedin.com/pulse/plasma-101-high-definition-gui-rossi-nvq1f', // Part 4: HD Plasma
  p5: 'https://www.linkedin.com/pulse/plasma-101-part-5-cut-charts-gui-rossi-ahfse', // Part 5: Cut Charts

  // Published articles.
  fix: 'https://www.linkedin.com/pulse/how-fix-your-cutting-operations-1-day-gui-rossi-cp5cf/',
  sand: 'https://www.linkedin.com/pulse/sand-gui-rossi-zzs8f',
  water: 'https://www.linkedin.com/pulse/how-does-water-cut-through-things-gui-rossi-wsutc',
  calc: 'https://www.linkedin.com/pulse/your-cost-calculator-lying-you-mine-too-gui-rossi-4gzef',
  buy: 'https://www.linkedin.com/pulse/buying-solution-future-problem-gui-rossi-wqyxf',

  // Weakest-block series landing pages (Part 1 of each series).
  plasma101: 'https://www.linkedin.com/pulse/plasma-101-part-1-what-fast-five-got-surprisingly-right-gui-rossi-lnmhf',
  waterjet101: 'https://www.linkedin.com/pulse/everyone-needs-waterjet-almost-nobody-should-own-one-gui-rossi-7ihrc',

  newsletter: NEWSLETTER,
  subscribe: SUBSCRIBE,
}

// ICL tool apps (secondary "run your own numbers" links). Do NOT route to Cutwise.
export const TOOLS = {
  ignite: { label: 'Ignite', url: 'https://ignite.industrialcuttinglabs.com' },
  cutbench: { label: 'Cutbench', url: 'https://cutbench.industrialcuttinglabs.com' },
  jetcalc: { label: 'JetCalc', url: 'https://jetcalc.industrialcuttinglabs.com' },
}

export function resolveLink(key) {
  return LINKS[key] || NEWSLETTER
}

// Article titles (English — the articles themselves are in English). Shown on
// "Read" links so the reader knows what they're clicking. Series landing pages
// (plasma101/waterjet101) use the series name.
export const TITLES = {
  p1: 'Plasma 101 — Part 1',
  p2: 'Plasma 101 — Part 2: Gases',
  p3: 'Plasma 101 — Part 3: Consumables',
  p4: 'Plasma 101 — Part 4: HD Plasma',
  p5: 'Plasma 101 — Part 5: Cut Charts',
  fix: 'How to fix your cutting operations in 1 day',
  sand: 'It Is Not Sand',
  water: 'How Does Water Cut Through Things?',
  calc: 'Your Cost Calculator Is Lying to You. Mine Too.',
  buy: 'Buying a Solution, or a Future Problem?',
  plasma101: 'Plasma 101',
  waterjet101: 'Waterjet 101',
  newsletter: 'Industrial Cutting Processes',
}

export function linkTitle(key) {
  return TITLES[key] || TITLES.newsletter
}
