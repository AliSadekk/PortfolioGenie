// github-import Edge Function (owner: C). Contract: CONVENTIONS.md section 8.
// Input:  { "username": "octocat" }  (a profile URL is also accepted)
// Output: { "repos": [{ name, description, language, stars, repoUrl, homepage, topics }] }
// Errors: { "error": { "code", "message" } } with BAD_REQUEST, USER_NOT_FOUND, RATE_LIMITED, TIMEOUT, GITHUB_FAILED.
// JWT verification stays on (Supabase default), so only logged-in users reach this code.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { fetchRepos, ImportError, parseUsername } from './github.ts';

const CACHE_MINUTES = 15;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(code: string, message: string, status: number) {
  return json({ error: { code, message } }, status);
}

// Service role client: only used for github_cache, which has RLS on and no policies.
function cacheClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// The cache is an optimisation: if it fails we log the reason (never a secret) and call GitHub.
async function readCache(db: ReturnType<typeof cacheClient>, username: string) {
  if (!db) return null;
  const { data, error } = await db
    .from('github_cache')
    .select('payload, fetched_at')
    .eq('username', username)
    .maybeSingle();
  if (error) {
    console.warn('github_cache read failed:', error.message);
    return null;
  }
  if (!data) return null;
  const ageMs = Date.now() - new Date(data.fetched_at).getTime();
  return ageMs < CACHE_MINUTES * 60 * 1000 ? data.payload : null;
}

async function writeCache(db: ReturnType<typeof cacheClient>, username: string, payload: unknown) {
  if (!db) return;
  const { error } = await db
    .from('github_cache')
    .upsert({ username, payload, fetched_at: new Date().toISOString() });
  if (error) console.warn('github_cache write failed:', error.message);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse('BAD_REQUEST', 'Use POST.', 405);
  }

  let body: { username?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse('BAD_REQUEST', 'Request body must be JSON: { "username": "..." }.', 400);
  }

  const username = parseUsername(body?.username);
  if (!username) {
    return errorResponse(
      'BAD_REQUEST',
      'Enter a valid GitHub username or profile link, for example "octocat" or "https://github.com/octocat".',
      400,
    );
  }

  // GitHub usernames are case-insensitive, so the cache key is lowercase.
  const cacheKey = username.toLowerCase();
  const db = cacheClient();

  const cached = await readCache(db, cacheKey);
  if (cached) return json(cached);

  try {
    const repos = await fetchRepos(username, Deno.env.get('GITHUB_TOKEN'));
    const payload = { repos };
    await writeCache(db, cacheKey, payload);
    return json(payload);
  } catch (err) {
    if (err instanceof ImportError) {
      return errorResponse(err.code, err.message, err.status);
    }
    console.error('github-import unexpected error:', err instanceof Error ? err.name : 'unknown');
    return errorResponse('GITHUB_FAILED', 'Something went wrong while importing. Try again.', 500);
  }
});
