// Score code: `{total}-{plasma}-{laser}-{waterjet}-{decision}`
// e.g. "11-4-2-3-2". Framework-free; used by SPA and serverless.
import { BLOCK_MAX, TOTAL_MAX, WEAKEST } from './content.js'

export function encodeCode(blocks) {
  // blocks: [plasma, laser, waterjet, decision]
  const total = blocks.reduce((a, b) => a + b, 0)
  return [total, ...blocks].join('-')
}

// Returns { total, blocks:[p,l,w,d] } or null if invalid.
export function decodeCode(code) {
  if (typeof code !== 'string') return null
  const parts = code.split('-')
  if (parts.length !== 5) return null
  if (!parts.every((p) => /^\d+$/.test(p))) return null
  const nums = parts.map(Number)
  const [total, ...blocks] = nums
  if (blocks.some((v, i) => v < 0 || v > BLOCK_MAX[i])) return null
  if (total < 0 || total > TOTAL_MAX) return null
  if (total !== blocks.reduce((a, b) => a + b, 0)) return null
  return { total, blocks }
}

// Weakest block = lowest score/max ratio; ties → first block in order.
export function weakestBlock(blocks) {
  let best = 0
  let bestRatio = blocks[0] / BLOCK_MAX[0]
  for (let i = 1; i < blocks.length; i++) {
    const r = blocks[i] / BLOCK_MAX[i]
    if (r < bestRatio) {
      bestRatio = r
      best = i
    }
  }
  return best
}

export function weakestRouting(blocks) {
  return WEAKEST[weakestBlock(blocks)]
}

export function normalizeLang(lang) {
  return ['en', 'pt', 'es'].includes(lang) ? lang : 'en'
}
