// GitHub star counts, fetched when the site builds. A daily scheduled rebuild (.github/workflows/refresh-stars.yml)
// keeps them current, so visitors never call GitHub themselves. Set GITHUB_TOKEN (read-only is enough) to avoid the
// 60-requests-an-hour limit for unauthenticated calls.
import { CONTACT } from './contact';

const OWNER = CONTACT.github.split('/').pop();
const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

// one request per repo per build (and per dev-server run), however many pages show it
const cache = new Map<string, Promise<number | null>>();

/** Stars for a repo under github.com/aniqatc, or null if GitHub couldn't be reached (the stars are then hidden). */
export function getStars(repo: string): Promise<number | null> {
  if (!cache.has(repo)) cache.set(repo, fetchStars(repo));
  return cache.get(repo)!;
}

async function fetchStars(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'aniqa.dev',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { stargazers_count } = (await res.json()) as { stargazers_count: number };
    return stargazers_count;
  } catch (err) {
    console.warn(`[github] no star count for ${OWNER}/${repo}: ${(err as Error).message}`);
    return null;
  }
}
