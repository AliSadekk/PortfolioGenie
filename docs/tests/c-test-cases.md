# Test cases: member C (GitHub import)

"Script" rows were run with `node --test supabase/functions/github-import/github.test.mjs` (function logic, fake
`fetch` plus two real calls to the public GitHub API without a token) and a Node test of `src/lib/github.js` with a fake
Supabase client. Rows marked "Not run" need the deployed function, B's `github_cache` table, or a browser.

| ID | Feature | Steps | Expected result | Actual result | Status | Tester | Date |
|---|---|---|---|---|---|---|---|
| C-01 | Username check | `parseUsername` with `octocat`, `@octocat`, `https://github.com/octocat`, `https://www.github.com/Octo-Cat/`, `github.com/octocat?tab=repositories`, 39 letters | Username extracted | Username extracted for all | Pass | C (script) | 2026-11-21 |
| C-02 | Username check | `parseUsername` with `""`, spaces, `-abc`, `abc-`, `a_b`, 40 letters, repo URL, gitlab URL, `a b`, `null`, number, object | `null` (→ `BAD_REQUEST`) | `null` for all | Pass | C (script) | 2026-11-21 |
| C-03 | Mapping | Map a repo with `description`, `language`, `homepage` = `null` | `""` for each, nothing invented | `""` for each | Pass | C (script) | 2026-11-21 |
| C-04 | Forks + pagination | Fake page 1 = 100 repos (50 forks), page 2 = 2 repos (1 fork) | 2 requests, 51 repos | 2 requests, 51 repos | Pass | C (script) | 2026-11-21 |
| C-05 | 100 cap | Fake GitHub always returns full pages | Stops at 100 repos | 100 repos after 1 request | Pass | C (script) | 2026-11-21 |
| C-06 | Page cap | Fake GitHub returns only forks forever | Stops after 10 pages, 0 repos | 10 requests, 0 repos | Pass | C (script) | 2026-11-21 |
| C-07 | Token | Call with token / without token | `Authorization` header only when the token is set | As expected | Pass | C (script) | 2026-11-21 |
| C-08 | Errors | Fake GitHub 404 | `USER_NOT_FOUND`, HTTP 404 | `USER_NOT_FOUND`, 404 | Pass | C (script) | 2026-11-21 |
| C-09 | Errors | Fake 403 with `x-ratelimit-remaining: 0`; fake 429 | `RATE_LIMITED`, HTTP 429 | `RATE_LIMITED`, 429 | Pass | C (script) | 2026-11-21 |
| C-10 | Errors | Fake 403 with remaining 50; fake 500; fetch throws | `GITHUB_FAILED`, HTTP 502 | `GITHUB_FAILED`, 502 | Pass | C (script) | 2026-11-21 |
| C-11 | Timeout | Fake fetch that never answers, 50 ms limit | `TIMEOUT`, HTTP 504 | `TIMEOUT`, 504 | Pass | C (script) | 2026-11-21 |
| C-12 | No secret leak | Error messages after a failure with token `tok` | Message does not contain the token | Not contained | Pass | C (script) | 2026-11-21 |
| C-13 | Real GitHub | `fetchRepos('octocat')` without a token | Non-empty list, all strings filled | 6 repos, e.g. Hello-World, `language` `""` | Pass | C (script) | 2026-11-21 |
| C-14 | Real GitHub | `fetchRepos('this-user-should-not-exist-pg-123456')` | `USER_NOT_FOUND` | `USER_NOT_FOUND` | Pass | C (script) | 2026-11-21 |
| C-15 | Frontend helper | `importGithubRepos('bad name')` | `BAD_REQUEST`, function not called | As expected | Pass | C (script) | 2026-11-21 |
| C-16 | Frontend helper | `importGithubRepos(' https://github.com/octocat ')` | Invokes `github-import` with `{ username: 'octocat' }` | As expected | Pass | C (script) | 2026-11-21 |
| C-17 | Frontend helper | Function answers 404 with our error body; gateway 401; network failure | Errors with code `USER_NOT_FOUND` / `UNAUTHORIZED` / `NETWORK` | As expected | Pass | C (script) | 2026-11-21 |
| C-18 | Frontend helper | `repoToProject` with language `JavaScript` + topics `javascript`, `react`, 20 more; long name and description | techStack deduplicated (case-insensitive), max 12; name ≤ 80, description ≤ 500 | As expected | Pass | C (script) | 2026-11-21 |
| C-19 | Deployed function | curl happy path `{"username":"octocat"}` with a JWT | 200, `{ repos: [...] }` |  | Not run |  |  |
| C-20 | Deployed function | curl with profile link | Same result as C-19 |  | Not run |  |  |
| C-21 | Deployed function | curl `{"username":"-bad-"}`; body not JSON | 400 `BAD_REQUEST` |  | Not run |  |  |
| C-22 | Deployed function | curl without `Authorization` | 401 from the gateway |  | Not run |  |  |
| C-23 | CORS | `OPTIONS` preflight from `http://localhost:5173` | 200 with `Access-Control-Allow-*` headers |  | Not run |  |  |
| C-24 | Cache | Same username twice within 15 min | Second call answered from `github_cache`; `fetched_at` unchanged |  | Not run |  |  |
| C-25 | Rate limit | Without token, 61+ different usernames in an hour | `RATE_LIMITED` |  | Not run |  |  |
| C-26 | Import UI | Projects step → Import from GitHub → `octocat` | Loading text, then list with checkbox, name, description, language, stars; nothing selected |  | Not run |  |  |
| C-27 | Import UI | Select two repos, edit the name of one, Add selected | Both appear in Projects with the edited name; autosave shows "Saved" |  | Not run |  |  |
| C-28 | Import UI | Open the dialog again for the same user | The two repos show "Already added", their checkboxes are disabled |  | Not run |  |  |
| C-29 | Import UI | Portfolio has 19 projects; select 2 | Add selected disabled, "Only 1 more project fits" |  | Not run |  |  |
| C-30 | Import UI | Enter `-bad-` | Error under the field, no network request |  | Not run |  |  |
| C-31 | Import UI | Unknown username; Retry | USER_NOT_FOUND message and Retry button |  | Not run |  |  |
| C-32 | Import UI | Turn the network off (DevTools → Offline), import | "Could not connect…" + Retry; manual editing still works |  | Not run |  |  |
| C-33 | Import UI | Keyboard only: Tab through the dialog, Enter in the field, Escape | Focus stays in the dialog, Enter imports, Escape closes |  | Not run |  |  |
| C-34 | Browsers | Repeat C-26 and C-27 in Firefox | Same behaviour |  | Not run |  |  |
