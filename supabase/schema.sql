-- ICL Quiz — anonymous analytics (brief section 11).
-- Run in the SAME Supabase project the other ICL apps use.
-- Anonymous only, no auth, no PII. Anon role may INSERT only; never SELECT.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists quiz_answers (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  session_id uuid not null,
  lang text not null check (lang in ('en','pt','es')),
  question_id text not null,
  selected_option text not null,
  is_correct boolean not null
);

create table if not exists quiz_completions (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  session_id uuid not null,
  lang text not null check (lang in ('en','pt','es')),
  total int not null,
  plasma int not null, laser int not null, waterjet int not null, decision int not null,
  shared boolean default false,
  referrer text
);

create index if not exists quiz_answers_session_idx on quiz_answers (session_id);
create index if not exists quiz_answers_question_idx on quiz_answers (question_id, lang);
create index if not exists quiz_completions_session_idx on quiz_completions (session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: anon can INSERT only (no SELECT), plus the one UPDATE
-- the client needs to flag a completion as shared.
-- ---------------------------------------------------------------------------
alter table quiz_answers enable row level security;
alter table quiz_completions enable row level security;

drop policy if exists "anon insert answers" on quiz_answers;
create policy "anon insert answers" on quiz_answers
  for insert to anon with check (true);

drop policy if exists "anon insert completions" on quiz_completions;
create policy "anon insert completions" on quiz_completions
  for insert to anon with check (true);

-- Allow flipping shared = true from the client. No SELECT is granted, so the
-- update is blind (fire-and-forget), which is all the UI needs.
drop policy if exists "anon mark shared" on quiz_completions;
create policy "anon mark shared" on quiz_completions
  for update to anon using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Analytics view: % correct per question per language.
-- This is the "68% missed this one" content source. Owner/service role only
-- (anon has no SELECT on the base tables, so cannot read this view either).
-- ---------------------------------------------------------------------------
create or replace view quiz_question_stats as
select
  question_id,
  lang,
  count(*)                                             as responses,
  sum(case when is_correct then 1 else 0 end)          as correct,
  round(100.0 * sum(case when is_correct then 1 else 0 end) / nullif(count(*), 0), 1) as pct_correct
from quiz_answers
group by question_id, lang
order by question_id, lang;

-- Completion funnel helper (optional).
create or replace view quiz_completion_stats as
select
  lang,
  count(*)                                             as completions,
  round(avg(total), 2)                                 as avg_total,
  sum(case when shared then 1 else 0 end)              as shared_count,
  round(100.0 * sum(case when shared then 1 else 0 end) / nullif(count(*), 0), 1) as pct_shared
from quiz_completions
group by lang
order by lang;
