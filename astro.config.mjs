// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { sections } from './src/lib/md-sections.mjs';

// Sketch libraries load lazily, so the dev server would only find them on first use and reload mid-visit.
// Pre-bundle the ones that are installed (npm i p5 / three for an experiment) so the first visit just works.
const { dependencies = {} } = JSON.parse(readFileSync('./package.json', 'utf8'));
const sketchLibs = ['p5', 'three'].filter((name) => name in dependencies);

// https://astro.build/config
export default defineConfig({
  site: 'https://aniqa.dev',
  adapter: vercel(), // pages stay static; only routes with `prerender = false` run as functions
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    processor: satteri({ hastPlugins: [sections] }), // ## headings in project files become label-left sections
  },
  vite: {
    optimizeDeps: { include: sketchLibs },
  },
});
