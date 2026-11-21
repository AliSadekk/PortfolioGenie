# PortfolioGenie: test plan and test report

Owner: member C. Every member keeps `docs/tests/<letter>-test-cases.md`; this file collects them.
**Only real, observed results go here.** Counts are filled in from the members' files, not estimated.

## 1. Test plan

### What is tested

| Area | Owner | Cases file |
|---|---|---|
| Auth, dashboard, RLS, ZIP export | A | `docs/tests/a-test-cases.md` |
| Builder, autosave, portfolios API | B | `docs/tests/b-test-cases.md` |
| GitHub import | C | `docs/tests/c-test-cases.md` |
| AI functions and review dialog | D | `docs/tests/d-test-cases.md` |
| Templates, preview, escaping | E | `docs/tests/e-test-cases.md` |

### How

- Manual tests by following each member's steps, recorded in the shared table (section 2).
- Unit scripts where they exist (for example `node --test supabase/functions/github-import/github.test.mjs`).
- One full end-to-end run (section 3) and the failure simulations (section 4).
- Each bug becomes a GitHub Issue (section 5).

### Where

| Browser | Version | Device / OS | Screen widths |
|---|---|---|---|
| Chrome | latest | Windows desktop | 1440, 1024, 375 (DevTools) |
| Firefox | latest | Windows desktop | 1440, 1024, 375 (DevTools) |

## 2. Shared test-case template

Every member uses exactly this table (CONVENTIONS section 16). ID = letter + number, e.g. `A-01`.
Status is `Pass`, `Fail` or `Not run`.

| ID | Feature | Steps | Expected result | Actual result | Status | Tester | Date |
|---|---|---|---|---|---|---|---|

## 3. End-to-end journey

Run once in Chrome and once in Firefox. Record the result of each step.

| # | Step | Chrome | Firefox | Notes |
|---|---|---|---|---|
| 1 | Create account, sign in | | | |
| 2 | New portfolio, fill Profile, Contacts, Skills | | | |
| 3 | Projects → Import from GitHub, add 2 repos | | | |
| 4 | Improve with AI on one project, Accept | | | |
| 5 | Generate About Me, Edit then accept | | | |
| 6 | Choose a template, check Desktop and Mobile preview | | | |
| 7 | Download ZIP | | | |
| 8 | Unzip, open `index.html` with the network off | | | |

## 4. Failure simulations

| # | Simulation | How | Expected | Result |
|---|---|---|---|---|
| F-1 | GitHub username does not exist | Import `this-user-should-not-exist-pg-123456` | "No GitHub user with that name…" + Retry | |
| F-2 | Invalid link | Import `https://gitlab.com/x` | Error under the field, no request | |
| F-3 | GitHub rate limit | Unset `GITHUB_TOKEN`, import 61+ different usernames within an hour | "GitHub is limiting requests…" | |
| F-4 | Network off during import | DevTools → Network → Offline, then import | "Could not connect…" + Retry; editing still works | |
| F-5 | AI failure | Agreed with D: | Original text kept, error shown | |
| F-6 | Another account's data | Sign in as user 2, open `/builder/<user 1 portfolio id>`; also query `portfolios` with user 2's JWT | Not found / empty, no data shown | |

## 5. Bugs

GitHub Issues with label `bug`, a severity label (`high`, `medium`, `low`), steps to reproduce, and an owner.
Each fixed bug is retested before it is closed.

| Issue | Title | Severity | Owner | Status | Retested |
|---|---|---|---|---|---|

## 6. Results (fill in from real data)

| Member | Cases | Pass | Fail | Not run |
|---|---|---|---|---|
| A | | | | |
| B | | | | |
| C | | | | |
| D | | | | |
| E | | | | |
| **Total** | | | | |

| Bugs | High | Medium | Low |
|---|---|---|---|
| Opened | | | |
| Closed | | | |
| Still open | | | |

### Not tested (and why)

-
