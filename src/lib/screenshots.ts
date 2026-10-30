// Entry screenshots: src/content/<collection>/<slug>/screenshot.png, made by `npm run screenshots`.
// Used by the case study and lab note frames, the hover previews and the link-preview cards.
import type { ImageMetadata } from 'astro';

const screenshots = import.meta.glob<{ default: ImageMetadata }>('../content/*/*/screenshot.png', {
  eager: true,
});

/** The entry's screenshot, or undefined if it hasn't been taken yet. */
export const screenshotFor = (entry: { collection: string; id: string }) =>
  screenshots[`../content/${entry.collection}/${entry.id}/screenshot.png`]?.default;
