# GitHub REST API notes (member C)

Notes for the `github-import` Edge Function. Source: GitHub REST API docs, "List repositories for a user"
(https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user) and
"Rate limits for the REST API" (https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
Re-check the numbers on those pages before the demo; they can change.

## Endpoint

`GET https://api.github.com/users/{username}/repos`

| Query param | What we send | Why |
|---|---|---|
| `type` | `owner` | Only repos the user owns (not ones they are a member of). |
| `sort` | `updated` | Most recently updated first, so the 100 cap keeps the freshest work. |
| `per_page` | `100` | The maximum GitHub allows per page. |
| `page` | `1, 2, …` | We keep requesting until a page has fewer than `per_page` items. |

Headers: `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`,
`User-Agent: PortfolioGenie` (GitHub rejects requests without a User-Agent), and
`Authorization: Bearer <GITHUB_TOKEN>` when the secret is set.

This endpoint returns **public repositories only** when called for another user.

## Fields we use

| GitHub field | Our field | Notes |
|---|---|---|
| `name` | `name` | Always present. |
| `description` | `description` | Can be `null` → we return `""`. |
| `language` | `language` | Can be `null` → `""`. |
| `stargazers_count` | `stars` | Number. |
| `html_url` | `repoUrl` | `https://github.com/{owner}/{repo}`. |
| `homepage` | `homepage` | Can be `null` or `""` → `""`. Not always a valid URL; the templates pass it through `safeUrl`. |
| `topics` | `topics` | Array of strings, can be empty. |
| `fork` | — | Used to exclude forks. |

## Rate limits

| Caller | Limit (per hour) |
|---|---|
| No token | 60 requests, counted per IP address |
| With a personal access token | 5,000 requests, counted per token owner |

When the limit is reached GitHub answers **403** or **429** with `x-ratelimit-remaining: 0`
(and sometimes `retry-after`). We map this to `RATE_LIMITED`. A 403 *without* those headers is a
different problem (for example a bad token) and becomes `GITHUB_FAILED`.

Because Edge Functions share outgoing IPs, running without a token would hit the 60/hour limit fast.
That is why `GITHUB_TOKEN` is required in production, and why results are cached for 15 minutes.

## Token

- Fine-grained personal access token, **Public repositories (read-only)**, no extra permissions, with an expiry date.
- Stored only as a Supabase secret: `supabase secrets set GITHUB_TOKEN=...`. Never in the repo, `.env`, or logs.

## Other responses

| GitHub status | Meaning | Our code |
|---|---|---|
| 200 | List of repos (can be `[]`) | success |
| 404 | User does not exist | `USER_NOT_FOUND` |
| 403 / 429 + rate-limit headers | Rate limited | `RATE_LIMITED` |
| other 4xx / 5xx, unreachable | GitHub problem | `GITHUB_FAILED` |
| no answer in 8 s | Too slow | `TIMEOUT` |
