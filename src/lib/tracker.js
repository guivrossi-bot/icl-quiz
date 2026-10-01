import { supabase } from './supabase.js'

// Anonymous analytics. All calls are fire-and-forget: a failure or missing
// client must NEVER block or break the quiz UI.

export function newSessionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* fall through */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function referrerDomain() {
  try {
    if (!document.referrer) return null
    return new URL(document.referrer).hostname || null
  } catch {
    return null
  }
}

export function trackAnswer({ sessionId, lang, questionId, selectedOption, isCorrect }) {
  if (!supabase) return
  try {
    supabase
      .from('quiz_answers')
      .insert({
        session_id: sessionId,
        lang,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
      })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) console.warn('[tracker] answer', error.message)
      })
  } catch { /* swallow */ }
}

export function trackCompletion({ sessionId, lang, total, blocks }) {
  if (!supabase) return
  try {
    supabase
      .from('quiz_completions')
      .insert({
        session_id: sessionId,
        lang,
        total,
        plasma: blocks[0],
        laser: blocks[1],
        waterjet: blocks[2],
        decision: blocks[3],
        shared: false,
        referrer: referrerDomain(),
      })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) console.warn('[tracker] completion', error.message)
      })
  } catch { /* swallow */ }
}

export function trackShared({ sessionId }) {
  if (!supabase) return
  try {
    supabase
      .from('quiz_completions')
      .update({ shared: true })
      .eq('session_id', sessionId)
      .then(({ error }) => {
        if (error && import.meta.env.DEV) console.warn('[tracker] shared', error.message)
      })
  } catch { /* swallow */ }
}
