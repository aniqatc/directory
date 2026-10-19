import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const month = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');
// Every entry is a folder: <slug>/index.md (frontmatter = facts, ## sections = notes) and preview.astro (its
// drawing). Experiments that run on the page also have sketch.ts or sketch.astro.
const folder = (base: string) =>
  glob({ pattern: '*/index.md', base, generateId: ({ entry }) => entry.replace(/\/index\.md$/, '') });

// Fields every entry has.
const base = z.object({
  title: z.string(),
  type: z.string(), // a label: Web app, Dashboard, Generative sketch…
  stack: z.string(),
  released: month,
  live: z.string().optional(), // host only, e.g. clock.aniqa.dev
  repo: z.string().optional(), // repo name under github.com/aniqatc
  summary: z.string(), // the lede on the detail page
  updated: month.optional(), // last revisited; the 3 newest get an "Updated" tag
  draft: z.boolean().default(false), // hidden from the portfolio and lab; /dev/drawings still lists it
});

// Portfolio: src/content/projects/<slug>/ → /work/<slug>
const projects = defineCollection({
  loader: folder('./src/content/projects'),
  schema: base.extend({
    order: z.number().int().positive(), // position in Selected work
    blurb: z.string(), // one line for the portfolio card
  }),
});

// Lab: src/content/experiments/<slug>/ → /lab/<slug>. Links out to its own site, or runs its sketch on the page.
const experiments = defineCollection({
  loader: folder('./src/content/experiments'),
  schema: base.extend({
    example: z.boolean().default(false), // placeholder entry that shows a layout
    hint: z.string().optional(), // with a sketch: shown under the stage, e.g. "Move to stir the field"
    time: z.string().optional(), // with a sketch: roughly how long it took
  }),
});

export const collections = { projects, experiments };
