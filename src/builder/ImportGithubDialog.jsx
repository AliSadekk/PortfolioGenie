/**
 * GitHub import dialog, opened from the Projects step.
 * The user enters a username or profile link, picks repos, can edit name/description,
 * then "Add selected" hands them to applyImportedProjects. Nothing is added automatically.
 * Owner: Member C
 */
import { useEffect, useRef, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Label from '../components/Label';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { GitBranch, RotateCcw, Star, X } from 'lucide-react';
import { importGithubRepos, parseGithubUsername, repoToProject } from '../lib/github';

const MAX_PROJECTS = 20;

const ERROR_MESSAGES = {
  BAD_REQUEST: 'Enter a valid GitHub username or profile link, for example "octocat" or "https://github.com/octocat".',
  USER_NOT_FOUND: 'No GitHub user with that name. Check the spelling and try again.',
  RATE_LIMITED: 'GitHub is limiting requests right now. Wait a few minutes, then retry.',
  TIMEOUT: 'GitHub took too long to answer. Retry in a moment.',
  NETWORK: 'Could not connect. Check your internet connection, then retry.',
  UNAUTHORIZED: 'Your session has expired. Sign in again, then retry.',
};
const FALLBACK_ERROR = 'GitHub import failed. You can retry or add projects by hand.';

export default function ImportGithubDialog({ open, onClose, projects = [], applyImportedProjects }) {
  const dialogRef = useRef(null);
  const requestRef = useRef(0);

  const [query, setQuery] = useState('');
  const [inputError, setInputError] = useState('');
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'loaded' | 'error'
  const [errorCode, setErrorCode] = useState('');
  const [rows, setRows] = useState([]); // { repo, name, description, selected }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const existingUrls = new Set(projects.map((p) => p.repoUrl).filter(Boolean));
  const remaining = Math.max(0, MAX_PROJECTS - projects.length);
  const selectable = rows.filter((r) => !existingUrls.has(r.repo.repoUrl));
  const selectedRows = selectable.filter((r) => r.selected);
  const allSelected = selectable.length > 0 && selectedRows.length === selectable.length;
  const overLimit = selectedRows.length > remaining;

  const runImport = async () => {
    const username = parseGithubUsername(query);
    if (!username) {
      setInputError(ERROR_MESSAGES.BAD_REQUEST);
      return;
    }
    setInputError('');

    // Ignore a slow, older response if the user started a new import.
    const requestId = ++requestRef.current;
    setState('loading');
    setErrorCode('');
    try {
      const { repos } = await importGithubRepos(username);
      if (requestId !== requestRef.current) return;
      setRows(repos.map((repo) => ({
        repo,
        name: repo.name,
        description: repo.description,
        selected: false,
      })));
      setState('loaded');
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setErrorCode(err.code || '');
      setState('error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runImport();
  };

  const updateRow = (repoUrl, patch) => {
    setRows((prev) => prev.map((r) => (r.repo.repoUrl === repoUrl ? { ...r, ...patch } : r)));
  };

  const toggleAll = () => {
    const next = !allSelected;
    setRows((prev) => prev.map((r) => (existingUrls.has(r.repo.repoUrl) ? r : { ...r, selected: next })));
  };

  const handleClose = () => {
    requestRef.current++; // drop any in-flight response
    onClose?.();
  };

  const handleAdd = () => {
    if (selectedRows.length === 0 || overLimit) return;
    const imported = selectedRows.map((r) => repoToProject({
      ...r.repo,
      name: r.name.trim() || r.repo.name,
      description: r.description.trim(),
    }));
    applyImportedProjects(imported);
    setRows((prev) => prev.map((r) => ({ ...r, selected: false })));
    handleClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby="github-import-title"
      className="w-[calc(100%-2rem)] max-w-[720px] max-h-[calc(100vh-2rem)] p-0 bg-paper text-ink border border-line rounded-[2px] backdrop:bg-ink/40"
    >
      <div className="flex flex-col max-h-[calc(100vh-2rem)]">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-line">
          <div>
            <h2 id="github-import-title" className="text-xl font-serif font-semibold flex items-center gap-2">
              <GitBranch className="h-5 w-5" aria-hidden="true" />
              Import from GitHub
            </h2>
            <p className="text-sm text-muted mt-1">
              Public repository data does not prove your individual contribution. Review before adding.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-muted hover:text-ink rounded-[2px]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-b border-line" noValidate>
          <Label htmlFor="github-username">GitHub username or profile link</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                id="github-username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="octocat or https://github.com/octocat"
                autoComplete="off"
                spellCheck={false}
                maxLength={300}
                aria-invalid={inputError ? 'true' : 'false'}
                aria-describedby="github-username-error"
              />
            </div>
            <Button type="button" variant="primary" onClick={runImport} disabled={state === 'loading'}>
              Import from GitHub
            </Button>
          </div>
          <div id="github-username-error" aria-live="polite">
            {inputError && <p className="text-sm text-danger mt-1">{inputError}</p>}
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-6" aria-live="polite" aria-busy={state === 'loading'}>
          {state === 'idle' && (
            <p className="text-sm text-muted">
              Enter a username to list its public repositories. Forks are not shown.
            </p>
          )}

          {state === 'loading' && (
            <div className="flex items-center gap-3 text-sm font-mono text-muted">
              <Spinner size={18} />
              Loading repositories…
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-3">
              <ErrorMessage>{ERROR_MESSAGES[errorCode] || FALLBACK_ERROR}</ErrorMessage>
              <Button variant="secondary" onClick={runImport}>
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {state === 'loaded' && rows.length === 0 && (
            <p className="text-sm text-muted">
              This account has no public repositories to import (forks are not included).
            </p>
          )}

          {state === 'loaded' && rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={selectable.length === 0}
                    className="h-4 w-4 accent-brand"
                  />
                  Select all
                </label>
                <span className="text-xs font-mono text-muted">
                  {rows.length} {rows.length === 1 ? 'repository' : 'repositories'}
                </span>
              </div>

              <ul className="space-y-3">
                {rows.map((row) => {
                  const { repo } = row;
                  const already = existingUrls.has(repo.repoUrl);
                  const checkboxId = `repo-${repo.repoUrl}`;
                  return (
                    <li key={repo.repoUrl} className="border border-line rounded-[2px] p-4">
                      <div className="flex items-start gap-3">
                        <input
                          id={checkboxId}
                          type="checkbox"
                          checked={!already && row.selected}
                          disabled={already}
                          onChange={(e) => updateRow(repo.repoUrl, { selected: e.target.checked })}
                          className="h-4 w-4 mt-1 accent-brand shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <label htmlFor={checkboxId} className="font-medium break-words cursor-pointer">
                            {repo.name}
                          </label>
                          {repo.description && (
                            <p className="text-sm text-muted mt-1 break-words">{repo.description}</p>
                          )}
                          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono text-muted">
                            {repo.language && <span>{repo.language}</span>}
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" aria-hidden="true" />
                              <span className="sr-only">Stars:</span>
                              {repo.stars}
                            </span>
                            {already && <span className="text-brand">Already added</span>}
                          </p>

                          {row.selected && !already && (
                            <div className="mt-4 space-y-3">
                              <div>
                                <Label htmlFor={`${checkboxId}-name`}>Project name</Label>
                                <Input
                                  id={`${checkboxId}-name`}
                                  value={row.name}
                                  onChange={(e) => updateRow(repo.repoUrl, { name: e.target.value.slice(0, 80) })}
                                  maxLength={80}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${checkboxId}-desc`}>Description</Label>
                                <Textarea
                                  id={`${checkboxId}-desc`}
                                  value={row.description}
                                  onChange={(e) => updateRow(repo.repoUrl, { description: e.target.value.slice(0, 500) })}
                                  rows={3}
                                  maxLength={500}
                                />
                                <p className="text-xs text-muted mt-1 text-right font-mono">
                                  {row.description.length}/500
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-t border-line">
          <p className={`text-xs font-mono ${overLimit ? 'text-danger' : 'text-muted'}`} aria-live="polite">
            {overLimit
              ? `Only ${remaining} more ${remaining === 1 ? 'project fits' : 'projects fit'} (limit ${MAX_PROJECTS}). Unselect some.`
              : `${selectedRows.length} selected · ${remaining} of ${MAX_PROJECTS} slots left`}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={selectedRows.length === 0 || overLimit}
            >
              Add selected
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
