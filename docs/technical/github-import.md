# github-import: deploy and test (member C)

Files:

- `supabase/functions/github-import/index.ts`: HTTP handler (CORS, input, cache, errors).
- `supabase/functions/github-import/github.ts`: pure logic (username parsing, GitHub paging, mapping).
- `supabase/functions/github-import/github.test.mjs`: unit tests for `github.ts`.
- `src/lib/github.js`: frontend helper (`importGithubRepos`, `parseGithubUsername`, `repoToProject`).
- `src/builder/ImportGithubDialog.jsx`: the import screen, opened from the Projects step.

Needs the `github_cache` table (migration owned by B).

## One-time setup

```bash
npm install -g supabase        # or: npx supabase ...
supabase login
supabase link --project-ref <project-ref>     # ask A for the ref
supabase secrets set GITHUB_TOKEN=<fine-grained token, public repos read-only>
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function automatically. Do not set them.

## Deploy

```bash
supabase functions deploy github-import
```

Do **not** pass `--no-verify-jwt`: the function must reject anonymous callers.

## Run locally

```bash
supabase start
supabase functions serve github-import --env-file supabase/.env.local   # file holds GITHUB_TOKEN=..., never committed
```

## Unit tests (no Supabase needed)

```bash
node --test supabase/functions/github-import/github.test.mjs
```

## curl tests

`<JWT>` is the access token of a logged-in user (in the browser console: `(await supabase.auth.getSession()).data.session.access_token`).

```bash
URL=https://<project-ref>.supabase.co/functions/v1/github-import

# happy path
curl -s -X POST $URL -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"username":"octocat"}'
# profile link
curl -s -X POST $URL -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"username":"https://github.com/octocat"}'
# BAD_REQUEST
curl -s -X POST $URL -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"username":"-bad-"}'
# USER_NOT_FOUND
curl -s -X POST $URL -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"username":"this-user-should-not-exist-pg-123456"}'
# no login -> 401 from the Supabase gateway
curl -s -X POST $URL -H "Content-Type: application/json" -d '{"username":"octocat"}'
# CORS preflight -> 200 with Access-Control-Allow-* headers
curl -si -X OPTIONS $URL -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"
```

Simulating failures:

- **RATE_LIMITED**: unset the token (`supabase secrets unset GITHUB_TOKEN`), then call with 61+ *different* usernames
  within an hour (the cache hides repeated names). Set the token back afterwards.
- **TIMEOUT**: locally, temporarily lower `TIMEOUT_MS` in `github.ts` to `1` and serve again. Do not commit that change.
- **Cache**: call the same username twice; the second answer is faster, and `github_cache.fetched_at` does not change.
