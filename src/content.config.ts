// Content configuration for Astro: defines collections, fields, and validation rules.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Month in the format YYYY-MM
const month = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');

// Month or full date in the format YYYY-MM or YYYY-MM-DD
const monthOrDay = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Use YYYY-MM or YYYY-MM-DD'),
);
// Every entry is a folder: <slug>/index.md (frontmatter = facts, ## sections = notes) and screenshot.png (from
// `npm run screenshots`). Experiments that run on the page also have sketch.ts or sketch.astro.
const folder = (base: string) =>
  glob({ pattern: '*/index.md', base, generateId: ({ entry }) => entry.replace(/\/index\.md$/, '') });

// Fields every entry has.
const base = z.object({
  title: z.string(), // the title of the project or experiment
  type: z.string(), // a label: Web app, Dashboard, Generative sketch…
  stack: z.string(), // the tech stack used in the project or experiment
  released: month, // the release date in YYYY-MM format
  live: z.string().optional(), // the live URL of the project, if hosted
  repo: z.string().optional(), // the GitHub repository name under github.com/aniqatc
  summary: z.string(), // a brief summary or lede for the detail page
  updated: monthOrDay.optional(), // the last revisited date; the 3 newest get an "Updated" tag (shown as the month)
  draft: z.boolean().default(false), // hidden from the portfolio and lab
  screenshotAlt: z.string().optional(), // what's on screen in screenshot.png
});

// Portfolio: src/content/projects/<slug>/ → /work/<slug>
const projects = defineCollection({
  loader: folder('./src/content/projects'), // locate all index.md files within the projects folder and generate slugs from folder names
  schema: base.extend({
    order: z.number().int().positive(), // position in Selected work
    blurb: z.string(), // one line for the portfolio card
  }),
});

// Lab: src/content/experiments/<slug>/ → /lab/<slug>. Links out to its own site, or runs its sketch on the page.
const experiments = defineCollection({
  loader: folder('./src/content/experiments'), // locate all index.md files within the experiments folder and generate slugs from folder names
  schema: base.extend({
    example: z.boolean().default(false), // placeholder entry that shows a layout
    hint: z.string().optional(), // with a sketch: shown under the stage, e.g. "Move to stir the field"
    // with a sketch: "frame" is a fixed 16:9 stage (square on phones) with Fullscreen, for canvas, p5, three
    // and CSS art; "fit" grows to its content and has no Fullscreen, for studies with controls
    stage: z.enum(['frame', 'fit']).default('frame'),
    themes: z.boolean().default(false), // with a sketch: a Day / Night switch under the stage
    // a "Before you start" box above the figure, for something the reader needs to know first
    // ("Made for a mouse", "The live site is down"). Use it rarely.
    headsUp: z.string().optional(),
    v1: z.url().optional(), // the first version's full URL (a CodePen), shown as "v1 ↗" in Links
  }),
});

// A full date in the format YYYY-MM-DD (YAML reads an unquoted date as a Date, so turn it back into text)
const day = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
);
// A score from 1 to 5; 4–5 shows as "Polished", 3 "Getting there", 1–2 "Needs love" (src/lib/reviews.ts)
const score = z.number().int().min(1).max(5);

// App reviews: src/content/reviews/<slug>/ → /reviews/<slug>. The frontmatter holds the facts and scores; the
// ## sections (First look, What I liked, Small ideas, Who it's for) are the review. Optional files in the folder:
// logo.png (the app's icon on the archive) and screenshot.png (the framed screenshot under the facts).
const reviews = defineCollection({
  loader: folder('./src/content/reviews'),
  schema: z.object({
    app: z.string(), // the app's name
    maker: z.string().regex(/^[A-Za-z0-9_]+$/, 'The X handle without the @'), // the maker's X handle
    date: day, // the day the review went up
    type: z.string(), // a label: Web app, iOS app, Chrome extension…
    triedOn: z.string(), // where you tried it: "MacBook, Chrome", "iPhone 15"
    live: z.string(), // the app's address without https://, e.g. tallyho.app
    post: z.url().optional(), // the review's post on X
    summary: z.string(), // one line on what the app does: the lede, and the card's description
    verdict: z.string(), // the one-word overall, e.g. Promising, Delightful, Solid
    brand: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #8b7cf6'), // the app's brand colour
    scores: z.object({
      firstImpression: score,
      onboarding: score,
      bestFeature: score,
      easeOfUse: score,
      value: score, // pricing / value
    }),
    screenshotAlt: z.string().optional(), // what's on screen in screenshot.png
    draft: z.boolean().default(false), // only shown on the dev server
  }),
});

// Export all defined collections so they can be used by the content system.
export const collections = { projects, experiments, reviews };
