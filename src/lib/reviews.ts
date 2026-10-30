// App reviews: src/content/reviews/<slug>/ → /reviews/<slug>
import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { pad } from './projects';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A review with its number in the series (No. 01 is the first). */
export type Review = CollectionEntry<'reviews'> & { number: number };

/** "2026-10-30" → "Oct 30, 2026" */
export const fmtDay = (date: string) =>
  `${MONTHS[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8, 10))}, ${date.slice(0, 4)}`;

// Drafts show on the dev server, so a review can be checked before it goes live, and never on the built site.
const visible = (review: CollectionEntry<'reviews'>) => import.meta.env.DEV || !review.data.draft;

/** Every review, oldest first, numbered from 01. */
export async function getReviews(): Promise<Review[]> {
  const reviews = await getCollection('reviews', visible);
  return reviews
    .sort((a, b) => a.data.date.localeCompare(b.data.date) || a.data.app.localeCompare(b.data.app))
    .map((review, index) => ({ ...review, number: index + 1 }));
}

/** The newest review, or undefined before the first one. */
export async function getLatestReview(): Promise<Review | undefined> {
  return (await getReviews()).at(-1);
}

/** "No. 06" */
export const reviewNumber = (review: Review) => `No. ${pad(review.number)}`;

// The five scores, in the order they're shown, with the label for each.
const SCORE_LABELS = {
  firstImpression: 'First impression',
  onboarding: 'Onboarding',
  bestFeature: 'Best feature',
  easeOfUse: 'Ease of use',
  value: 'Pricing / value',
} as const;

export type ScoreStatus = 'polished' | 'getting-there' | 'needs-love';
const STATUS_LABELS: Record<ScoreStatus, string> = {
  polished: 'Polished',
  'getting-there': 'Getting there',
  'needs-love': 'Needs love',
};

/** A score's status word: 4–5 "Polished", 3 "Getting there", 1–2 "Needs love". */
export const statusFor = (value: number): ScoreStatus =>
  value >= 4 ? 'polished' : value === 3 ? 'getting-there' : 'needs-love';

/** The review's scores, ready to show: label, value, status and its word. */
export function scoresFor(review: Review) {
  return (Object.keys(SCORE_LABELS) as (keyof typeof SCORE_LABELS)[]).map((key) => {
    const value = review.data.scores[key];
    const status = statusFor(value);
    return { label: SCORE_LABELS[key], value, status, statusLabel: STATUS_LABELS[status] };
  });
}

// The app's icon: src/content/reviews/<slug>/logo.png. Without one, the archive shows the app's first letter
// on its brand colour.
const logos = import.meta.glob<{ default: ImageMetadata }>('../content/reviews/*/logo.png', { eager: true });

/** The review's logo, or undefined if the folder has none. */
export const logoFor = (review: Review) => logos[`../content/reviews/${review.id}/logo.png`]?.default;

/** The maker's profile on X. */
export const makerUrl = (review: Review) => `https://x.com/${review.data.maker}`;
