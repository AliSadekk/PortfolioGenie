create table if not exists github_cache (
  username text primary key,
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table github_cache enable row level security;
