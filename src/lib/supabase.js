import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Null when env is missing (e.g. local dev without .env.local). The tracker
// degrades to no-ops so the quiz UI never breaks.
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

if (!supabase && import.meta.env.DEV) {
  console.warn('[quiz] Supabase env missing — analytics disabled (quiz still works).')
}
