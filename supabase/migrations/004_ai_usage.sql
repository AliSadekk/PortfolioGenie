-- Migration 004: ai_usage
-- Owner: Member B (requested by Member D)

create table if not exists ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);

alter table ai_usage enable row level security;
-- No policies on purpose: only Edge Functions (service role) can read or write it.
