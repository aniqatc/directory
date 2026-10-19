// Upstash Redis for likes. Reads the REST URL and token from .env locally and from Vercel's environment in
// production; the Vercel Marketplace integration may name them KV_REST_API_URL / KV_REST_API_TOKEN instead.
import { Redis } from '@upstash/redis';

const env = (name: string): string | undefined => import.meta.env[name] ?? process.env[name];

export const redis = new Redis({
  url: env('UPSTASH_REDIS_REST_URL') ?? env('KV_REST_API_URL') ?? '',
  token: env('UPSTASH_REDIS_REST_TOKEN') ?? env('KV_REST_API_TOKEN') ?? '',
});

/** Likes allowed per visitor per entry. */
export const LIKE_MAX = 5;

/** likes:<slug> is the entry's total; likes:<slug>:by:<visitor> is one visitor's count, 0–5. */
export const likeKeys = (slug: string, visitor: string) => ({
  total: `likes:${slug}`,
  mine: `likes:${slug}:by:${visitor}`,
});
