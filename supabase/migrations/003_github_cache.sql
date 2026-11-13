-- Migration 003: github_cache
-- Owner: Member B (requested by Member C)

create table if not exists github_cache (
  username text primary key,
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table github_cache enable row level security;
-- No policies on purpose: only Edge Functions (service role) can read or write it.
