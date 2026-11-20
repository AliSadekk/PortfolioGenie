// Unit tests for github.ts. Run from the repo root: node --test supabase/functions/github-import/github.test.mjs
// (Node 22.6+ runs .ts files directly.) The two REAL tests call the public GitHub API without a token.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseUsername, mapRepo, fetchRepos } from './github.ts';

const resp = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers });
const repo = (i, extra = {}) => ({ name: 'r' + i, description: null, language: null, stargazers_count: i, html_url: 'https://github.com/u/r' + i, homepage: null, topics: ['a'], fork: false, private: false, ...extra });

test('parseUsername valid', () => {
  assert.equal(parseUsername('octocat'), 'octocat');
  assert.equal(parseUsername('  @octocat '), 'octocat');
  assert.equal(parseUsername('https://github.com/octocat'), 'octocat');
  assert.equal(parseUsername('https://www.github.com/Octo-Cat/'), 'Octo-Cat');
  assert.equal(parseUsername('github.com/octocat?tab=repositories'), 'octocat');
  assert.equal(parseUsername('a'.repeat(39)), 'a'.repeat(39));
});
test('parseUsername invalid', () => {
  for (const v of ['', '   ', '-abc', 'abc-', 'a_b', 'a'.repeat(40), 'https://github.com/octocat/repo', 'https://gitlab.com/x', 'a b', null, 5, {}])
    assert.equal(parseUsername(v), null, String(v));
});
test('mapRepo nulls -> empty', () => {
  assert.deepEqual(mapRepo(repo(1)), { name: 'r1', description: '', language: '', stars: 1, repoUrl: 'https://github.com/u/r1', homepage: '', topics: ['a'] });
});
test('forks excluded, pagination stops on short page', async () => {
  let calls = 0;
  const f = async (url) => { calls++; return calls === 1
    ? resp(200, Array.from({ length: 100 }, (_, i) => repo(i, { fork: i % 2 === 0 })))
    : resp(200, [repo(200), repo(201, { fork: true })]); };
  const r = await fetchRepos('u', 'tok', f);
  assert.equal(calls, 2); assert.equal(r.length, 51);
});
test('caps at 100 repos', async () => {
  let calls = 0;
  const f = async () => { calls++; return resp(200, Array.from({ length: 100 }, (_, i) => repo(calls * 1000 + i))); };
  const r = await fetchRepos('u', 'tok', f);
  assert.equal(r.length, 100); assert.equal(calls, 1);
});
test('page cap with all forks', async () => {
  let calls = 0;
  const f = async () => { calls++; return resp(200, Array.from({ length: 100 }, (_, i) => repo(i, { fork: true }))); };
  assert.equal((await fetchRepos('u', 'tok', f)).length, 0); assert.equal(calls, 10);
});
test('sends token header only when set', async () => {
  let h; const f = async (_u, o) => { h = o.headers; return resp(200, []); };
  await fetchRepos('u', 'secret', f); assert.equal(h.Authorization, 'Bearer secret');
  await fetchRepos('u', undefined, f); assert.equal(h.Authorization, undefined);
});
const code = async (f, ms) => { try { await fetchRepos('u', 'tok', f, ms); return 'none'; } catch (e) { return e.code + ':' + e.status + ':' + e.message; } };
test('404 -> USER_NOT_FOUND', async () => assert.match(await code(async () => resp(404, {})), /^USER_NOT_FOUND:404/));
test('403 remaining 0 -> RATE_LIMITED', async () => assert.match(await code(async () => resp(403, {}, { 'x-ratelimit-remaining': '0' })), /^RATE_LIMITED:429/));
test('429 -> RATE_LIMITED', async () => assert.match(await code(async () => resp(429, {})), /^RATE_LIMITED/));
test('403 other -> GITHUB_FAILED', async () => assert.match(await code(async () => resp(403, {}, { 'x-ratelimit-remaining': '50' })), /^GITHUB_FAILED:502/));
test('500 -> GITHUB_FAILED', async () => assert.match(await code(async () => resp(500, {})), /^GITHUB_FAILED/));
test('network error -> GITHUB_FAILED', async () => assert.match(await code(async () => { throw new TypeError('fetch failed'); }), /^GITHUB_FAILED/));
test('timeout -> TIMEOUT', async () => {
  const hang = (_u, o) => new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))));
  assert.match(await code(hang, 50), /^TIMEOUT:504/);
});
test('error messages never contain token', async () => assert.doesNotMatch(await code(async () => resp(500, {})), /tok/));
test('REAL: octocat', async () => {
  const r = await fetchRepos('octocat', undefined);
  console.log('octocat repos:', r.length, r[0]);
  assert.ok(r.length > 0); assert.ok(r.every(x => typeof x.description === 'string' && typeof x.homepage === 'string'));
});
test('REAL: unknown user', async () => {
  assert.match(await (async () => { try { await fetchRepos('this-user-should-not-exist-pg-123456', undefined); } catch (e) { return e.code; } })(), /USER_NOT_FOUND|RATE_LIMITED/);
});
