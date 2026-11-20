// Calls the github-import Edge Function (owner: C). Contract: CONVENTIONS.md section 8.
import { supabase } from './supabase';

const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

// Limits from CONVENTIONS.md section 5.
const MAX_NAME = 80;
const MAX_DESCRIPTION = 500;
const MAX_URL = 300;
const MAX_TECH_ITEMS = 12;
const MAX_TECH_LENGTH = 30;

function codedError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

// Accepts "octocat", "@octocat" or a profile link like "https://github.com/octocat".
// Returns the username, or null if the input is not valid.
export function parseGithubUsername(input) {
  if (typeof input !== 'string') return null;
  let value = input.trim();
  if (!value || value.length > MAX_URL) return null;

  const urlMatch = value.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)\/?(?:[?#].*)?$/i);
  if (urlMatch) {
    value = urlMatch[1];
  } else if (value.startsWith('@')) {
    value = value.slice(1);
  }

  return USERNAME_RE.test(value) ? value : null;
}

// Returns { repos: [...] } or throws an Error with a .code
// (BAD_REQUEST, USER_NOT_FOUND, RATE_LIMITED, TIMEOUT, GITHUB_FAILED, UNAUTHORIZED, NETWORK).
export async function importGithubRepos(input) {
  const username = parseGithubUsername(input);
  if (!username) {
    throw codedError('BAD_REQUEST', 'Enter a valid GitHub username or profile link.');
  }

  const { data, error } = await supabase.functions.invoke('github-import', {
    body: { username },
  });

  if (error) {
    // FunctionsHttpError: the function answered with a non-2xx status; the body has our error format.
    const response = error.context;
    if (response && typeof response.json === 'function') {
      let body = null;
      try {
        body = await response.json();
      } catch {
        // Body was not JSON; fall through to the generic errors below.
      }
      if (body?.error?.code) {
        throw codedError(body.error.code, body.error.message || 'GitHub import failed.');
      }
      if (response.status === 401) {
        throw codedError('UNAUTHORIZED', 'Your session has expired. Sign in again.');
      }
      throw codedError('GITHUB_FAILED', 'GitHub import failed. Try again.');
    }
    // FunctionsFetchError / FunctionsRelayError: the request never reached the function.
    throw codedError('NETWORK', 'Could not connect. Check your internet connection and try again.');
  }

  if (data?.error?.code) {
    throw codedError(data.error.code, data.error.message || 'GitHub import failed.');
  }
  return { repos: Array.isArray(data?.repos) ? data.repos : [] };
}

// Turns a repo from github-import into a portfolio project (CONVENTIONS.md section 5).
// techStack = language + topics, without duplicates, within the agreed limits.
export function repoToProject(repo) {
  const techStack = [];
  const seen = new Set();
  for (const item of [repo.language, ...(repo.topics || [])]) {
    const value = typeof item === 'string' ? item.trim().slice(0, MAX_TECH_LENGTH) : '';
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    techStack.push(value);
    if (techStack.length >= MAX_TECH_ITEMS) break;
  }

  return {
    name: (repo.name || '').slice(0, MAX_NAME),
    description: (repo.description || '').slice(0, MAX_DESCRIPTION),
    techStack,
    repoUrl: (repo.repoUrl || '').slice(0, MAX_URL),
    liveUrl: (repo.homepage || '').slice(0, MAX_URL),
  };
}
