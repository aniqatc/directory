// Upstash Redis for likes. Reads the REST URL and token from .env locally and from Vercel's environment in
// production; the Vercel Marketplace integration may name them KV_REST_API_URL / KV_REST_API_TOKEN instead.
import { Redis } from '@upstash/redis';

const env = (name: string): string | undefined => import.meta.env[name] ?? process.env[name];

const url = env('UPSTASH_REDIS_REST_URL') ?? env('KV_REST_API_URL') ?? '';
const token = env('UPSTASH_REDIS_REST_TOKEN') ?? env('KV_REST_API_TOKEN') ?? '';

/** False without credentials (CI, or a fresh clone without .env): the likes API then answers 503. */
export const likesConfigured = Boolean(url && token);

export const redis = new Redis({ url: url || 'https://not-configured.invalid', token: token || 'none' });

/** Likes allowed per visitor per entry. */
export const LIKE_MAX = 5;

/** likes:<slug> is the entry's total; likes:<slug>:by:<visitor> is one visitor's count, 0–5. */
export const likeKeys = (slug: string, visitor: string) => ({
  total: `likes:${slug}`,
  mine: `likes:${slug}:by:${visitor}`,
});
