// This module handles the Upstash Redis configuration and provides utility functions for managing likes.
// Upstash Redis for likes. Reads the REST URL and token from .env locally and from Vercel's environment in production.
import { Redis } from '@upstash/redis';

// Helper function to read environment variables, falling back to Vercel's environment if not found locally.
const env = (name: string): string | undefined => import.meta.env[name] ?? process.env[name];

// Read the Upstash Redis REST URL and token from the environment, with fallbacks for Vercel's naming convention.
const url = env('UPSTASH_REDIS_REST_URL') ?? env('KV_REST_API_URL') ?? '';
const token = env('UPSTASH_REDIS_REST_TOKEN') ?? env('KV_REST_API_TOKEN') ?? '';

// Indicates whether the likes feature is configured with valid Upstash Redis credentials.
export const likesConfigured = Boolean(url && token);

// Initialize the Upstash Redis client with the configured URL and token, or with dummy values if not configured.
export const redis = new Redis({ url: url || 'https://not-configured.invalid', token: token || 'none' });

// Maximum number of likes allowed per visitor per entry.
export const LIKE_MAX = 5;

// Generates the Redis keys for an entry's total likes and a specific visitor's likes.
// likes:<slug> is the entry's total; likes:<slug>:by:<visitor> is one visitor's count, 0–5.
export const likeKeys = (slug: string, visitor: string) => ({
  total: `likes:${slug}`,
  mine: `likes:${slug}:by:${visitor}`,
});
