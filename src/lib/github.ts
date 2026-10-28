// This file is used to fetch the number of stars for a GitHub repo, which is then displayed on the site.
// It uses the GitHub API and caches the results to avoid making too many requests.
// Daily scheduled rebuild (.github/workflows/refresh-stars.yml) keeps them current
import { CONTACT } from './contact';

// Variables for GitHub API access
const OWNER = CONTACT.github.split('/').pop();
const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

// Variable to cache the star counts for each repo
// Allows one request per repo per build (and per dev-server run), however many pages show it
const cache = new Map<string, Promise<number | null>>();

/**
 * Stars for a repo under github.com/aniqatc, or null if GitHub couldn't be reached (the stars are then hidden).
 * @param repo The name of the repository under the GitHub account specified in CONTACT.github.
 * @returns A promise that resolves to the number of stars, or null if the GitHub API couldn't be reached.
 */
export function getStars(repo: string): Promise<number | null> {
  // Check if the star count for this repo is already cached; if not, fetch and cache it.
  if (!cache.has(repo)) cache.set(repo, fetchStars(repo));
  return cache.get(repo)!;
}

/**
 * Fetches the star count for a given GitHub repository.
 * @param repo The name of the repository under the GitHub account specified in CONTACT.github.
 * @returns A promise that resolves to the number of stars, or null if the GitHub API couldn't be reached.
 */
async function fetchStars(repo: string): Promise<number | null> {
  try {
    // Attempt to fetch the star count from the GitHub API.
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'aniqa.dev',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });

    // If the response is not OK, throw an error to be caught below.
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    // Parse the JSON response to extract the star count.
    const { stargazers_count } = (await res.json()) as { stargazers_count: number };
    return stargazers_count;
  } catch (err) {
    // If an error occurs (e.g., network issue or API rate limit), log a warning and return null.
    console.warn(`[github] no star count for ${OWNER}/${repo}: ${(err as Error).message}`);
    return null;
  }
}
