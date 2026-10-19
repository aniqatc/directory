// Likes for lab entries. The only part of the site that runs on the server (a Vercel function); every page
// stays static.
//
//   GET  /api/likes?visitor=<uuid>&slugs=valorant,world-clock  → { "valorant": { total, mine }, … }
//   POST /api/likes  { slug, visitor }                       → { total, mine, ok }   (ok: false past 5)
import type { APIRoute } from 'astro';
import { Ratelimit } from '@upstash/ratelimit';
import { getLab } from '../../lib/projects';
import { LIKE_MAX, likeKeys, redis } from '../../lib/redis';

export const prerender = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// slowing down anyone hammering the route: 20 likes per 10 seconds per IP
const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '10 s'), prefix: 'rl:likes' });

// Check the visitor's count and add to both in one step, so quick double-clicks can't get past the limit.
const LIKE = `
local mine = tonumber(redis.call('GET', KEYS[2]) or '0')
if mine >= tonumber(ARGV[1]) then
  return {tonumber(redis.call('GET', KEYS[1]) or '0'), mine, 0}
end
return {redis.call('INCR', KEYS[1]), redis.call('INCR', KEYS[2]), 1}
`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// only published lab entries can be liked
const labSlugs = async () => new Set((await getLab()).map((e) => e.id));

export const GET: APIRoute = async ({ url }) => {
  const visitor = url.searchParams.get('visitor') ?? '';
  if (!UUID.test(visitor)) return json({ error: 'visitor must be a UUID' }, 400);
  const known = await labSlugs();
  const slugs = (url.searchParams.get('slugs') ?? '').split(',').filter((s) => known.has(s));
  if (!slugs.length) return json({});

  const keys = slugs.flatMap((s) => Object.values(likeKeys(s, visitor)));
  const values = await redis.mget<(number | null)[]>(...keys);
  return json(
    Object.fromEntries(
      slugs.map((s, i) => [s, { total: Number(values[i * 2] ?? 0), mine: Number(values[i * 2 + 1] ?? 0) }]),
    ),
  );
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const { success } = await ratelimit.limit(clientAddress ?? 'unknown');
  if (!success) return json({ error: 'Too many likes, slow down' }, 429);

  const body = (await request.json().catch(() => ({}))) as { slug?: string; visitor?: string };
  const { slug = '', visitor = '' } = body;
  if (!UUID.test(visitor)) return json({ error: 'visitor must be a UUID' }, 400);
  if (!(await labSlugs()).has(slug)) return json({ error: 'unknown entry' }, 404);

  const { total, mine } = likeKeys(slug, visitor);
  const [t, m, ok] = await redis.eval<[string], [number, number, number]>(
    LIKE,
    [total, mine],
    [String(LIKE_MAX)],
  );
  return json({ total: Number(t), mine: Number(m), ok: ok === 1 });
};
