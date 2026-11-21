# Test Cases — Member B (Data, CRUD, Builder Steps & Autosave)

| ID | Feature | Steps | Expected result | Actual result | Status | Tester | Date |
|---|---|---|---|---|---|---|---|
| B-01 | Create empty portfolio | 1. Click "New portfolio"<br>2. Check initial data shape | Row inserted with empty strings/arrays, title 'Untitled' | All fields match section 5 JSON contract | Pass | Member B | 2026-11-06 |
| B-02 | Autosave debounce | 1. Open builder<br>2. Edit bio field continuously | Status switches to Unsaved -> Saving -> Saved after 1000ms idle | Saved status accurately displayed | Pass | Member B | 2026-11-06 |
| B-03 | Add and remove skills | 1. In Skills step, type "React" and hit Enter<br>2. Type "react" again | First added, second rejected with duplicate warning | Duplicates blocked, tag renders with remove button | Pass | Member B | 2026-11-06 |
| B-04 | Contacts validation | 1. Enter invalid email or URL not starting with `https://` | Validation error message displayed | Inline error displayed under input | Pass | Member B | 2026-11-06 |
| B-05 | Add project | 1. Go to Projects step<br>2. Click "Add project"<br>3. Fill name and description | Project card expands, values saved to database | Successfully added to portfolio project list | Pass | Member B | 2026-11-06 |
| B-06 | Clone portfolio | 1. Click "Clone" on dashboard card | New portfolio created with title ending in ` (copy)` | Cloned copy created independently | Pass | Member B | 2026-11-06 |
| B-07 | Skills limit & length | 1. Attempt to add > 30 skills or skill > 40 chars | Error message displayed and addition prevented | Enforces 30 max skills and 40 char length | Pass | Member B | 2026-11-20 |
| B-08 | Projects URL validation | 1. In Projects step, enter repoUrl or liveUrl without `https://` | Inline error displayed under input | URL must start with `https://` error shown | Pass | Member B | 2026-11-20 |
| B-09 | Autosave retry & error | 1. Disconnect network or mock Supabase error<br>2. Edit field | Retries 2 times automatically then shows "Error" and Retry button | Failed save recovers via Retry button | Pass | Member B | 2026-11-20 |
| B-10 | BeforeUnload warning | 1. Edit field and immediately try to close/reload tab | Browser prompts user about unsaved changes | Warning dialog displayed before leaving | Pass | Member B | 2026-11-20 |
| B-11 | applyImportedProjects (for Member C) | 1. Call `applyImportedProjects` with array of repos from GitHub | Adds new projects without overwriting existing ones | Non-duplicate projects appended safely | Pass | Member B | 2026-11-20 |
| B-12 | applySuggestion (for Member D) | 1. Call `applySuggestion('profile.bio', 'New bio')` | Updates targeted field and triggers autosave | Field updated and saved automatically | Pass | Member B | 2026-11-20 |
