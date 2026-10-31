// Apps I gave feedback on privately, straight to the maker, instead of posting a review.
// They show on /reviews under "Feedback given privately", newest first, with no page of their own.
// A logo is optional: save it as src/assets/private-feedback/<slug>.png, where <slug> is the app's name in
// lower case with dashes ("Tally Ho" → tally-ho.png). Without one, the app's first letter shows on its brand colour.
import type { ImageMetadata } from 'astro';

/** One app: its name, the month the feedback went to the maker (YYYY-MM), and its brand colour. */
export type PrivateFeedback = { app: string; month: string; brand: string };

export const PRIVATE_FEEDBACK: PrivateFeedback[] = [
  // { app: 'Tally Ho', month: '2026-11', brand: '#8b7cf6' },
];

const logos = import.meta.glob<{ default: ImageMetadata }>('../assets/private-feedback/*.png', { eager: true });

/** "Tally Ho" → "tally-ho", the name of its logo file */
const slugFor = (app: string) =>
  app
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** The app's logo, or undefined if there's no file for it. */
export const privateLogoFor = (item: PrivateFeedback) =>
  logos[`../assets/private-feedback/${slugFor(item.app)}.png`]?.default;

/** Every app, newest first. Months are checked here, since this list isn't a content collection. */
export function getPrivateFeedback(): PrivateFeedback[] {
  for (const item of PRIVATE_FEEDBACK) {
    if (!/^\d{4}-\d{2}$/.test(item.month)) throw new Error(`private feedback for ${item.app}: use YYYY-MM for month`);
  }
  return [...PRIVATE_FEEDBACK].sort((a, b) => b.month.localeCompare(a.month));
}
