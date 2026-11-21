// Pure logic for the github-import Edge Function (owner: C).
// No Deno or Supabase imports here, so this file can be unit-tested with Node.

export const MAX_REPOS = 100;
export const PER_PAGE = 100;
// Safety cap so an account with thousands of forks cannot keep us paging forever.
export const MAX_PAGES = 10;
export const TIMEOUT_MS = 8000;

const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export class ImportError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Accepts "octocat", "@octocat", "github.com/octocat" or "https://github.com/octocat/".
// Returns the username, or null if the input is not a valid GitHub username or profile URL.
export function parseUsername(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let value = input.trim();
  if (value.length === 0 || value.length > 300) return null;

  const urlMatch = value.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)\/?(?:[?#].*)?$/i);
  if (urlMatch) {
    value = urlMatch[1];
  } else if (value.startsWith('@')) {
    value = value.slice(1);
  }

  return USERNAME_RE.test(value) ? value : null;
}

// Turns one GitHub API repo object into the contract shape (CONVENTIONS section 8).
// Missing values become "" or [], never invented.
export function mapRepo(repo: Record<string, unknown>) {
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    name: str(repo.name),
    description: str(repo.description),
    language: str(repo.language),
    stars: typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0,
    repoUrl: str(repo.html_url),
    homepage: str(repo.homepage),
    topics: Array.isArray(repo.topics) ? repo.topics.filter((t) => typeof t === 'string') : [],
  };
}

function isRateLimited(res: Response) {
  if (res.status === 429) return true;
  if (res.status !== 403) return false;
  return res.headers.get('x-ratelimit-remaining') === '0' || res.headers.has('retry-after');
}

// Fetches up to MAX_REPOS public, non-fork repos for a user.
// fetchImpl is injectable so tests can pass a fake fetch.
export async function fetchRepos(
  username: string,
  token: string | undefined,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = TIMEOUT_MS,
) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'PortfolioGenie',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // One deadline for the whole import, across all pages.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const repos: ReturnType<typeof mapRepo>[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES && repos.length < MAX_REPOS; page++) {
      const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos` +
        `?type=owner&sort=updated&per_page=${PER_PAGE}&page=${page}`;

      let res: Response;
      try {
        res = await fetchImpl(url, { headers, signal: controller.signal });
      } catch (err) {
        if (controller.signal.aborted) {
          throw new ImportError('TIMEOUT', 'GitHub took too long to respond. Try again.', 504);
        }
        throw new ImportError('GITHUB_FAILED', 'Could not reach GitHub. Try again later.', 502);
      }

      if (res.status === 404) {
        throw new ImportError('USER_NOT_FOUND', `GitHub user "${username}" was not found.`, 404);
      }
      if (isRateLimited(res)) {
        throw new ImportError('RATE_LIMITED', 'GitHub rate limit reached. Try again in a few minutes.', 429);
      }
      if (!res.ok) {
        throw new ImportError('GITHUB_FAILED', `GitHub returned an unexpected error (${res.status}).`, 502);
      }

      let pageData: unknown;
      try {
        pageData = await res.json();
      } catch {
        if (controller.signal.aborted) {
          throw new ImportError('TIMEOUT', 'GitHub took too long to respond. Try again.', 504);
        }
        throw new ImportError('GITHUB_FAILED', 'GitHub returned an unreadable response.', 502);
      }
      if (!Array.isArray(pageData)) {
        throw new ImportError('GITHUB_FAILED', 'GitHub returned an unexpected response.', 502);
      }

      for (const repo of pageData) {
        // Forks are excluded by team decision; private repos never appear on this endpoint, but check anyway.
        if (repo.fork || repo.private) continue;
        repos.push(mapRepo(repo));
        if (repos.length >= MAX_REPOS) break;
      }

      if (pageData.length < PER_PAGE) break;
    }
  } finally {
    clearTimeout(timer);
  }

  return repos;
}
