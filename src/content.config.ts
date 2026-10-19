import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const month = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');

// One Markdown file per project. Frontmatter holds the facts; the body holds the notes as ## sections.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    type: z.string(),
    stack: z.string(),
    released: month,
    live: z.string().optional(), // host only, e.g. clock.aniqa.dev
    repo: z.string().optional(), // repo name under github.com/aniqatc
    preview: z.string(), // drawing key, e.g. clock
    selected: z.number().int().positive().optional(), // position in Selected work; omit for lab-only entries
    blurb: z.string().optional(), // one line for the portfolio card
    summary: z.string(), // the lede on the detail page
    updated: month.optional(),
    example: z.boolean().default(false), // placeholder entry that shows a layout
    // experiments only
    hint: z.string().optional(), // shown under the canvas, e.g. "Move to stir the field"
    time: z.string().optional(), // roughly how long it took
  }),
});

export const collections = { projects };
