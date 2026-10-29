// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { sections } from './src/lib/md-sections.mjs';

// Sketch libraries load lazily, so the dev server would only find them on first use and reload mid-visit.
// Pre-bundle the ones that are installed (npm i p5 / three for an experiment) so the first visit just works.

// Read the project's dependencies from package.json to determine which sketch libraries are installed.
const { dependencies = {} } = JSON.parse(readFileSync('./package.json', 'utf8'));

// Filter the list of potential sketch libraries to include only those that are actually installed.
const sketchLibs = ['p5', 'three'].filter((name) => name in dependencies);

// https://astro.build/config
export default defineConfig({
  site: 'https://aniqa.dev', // The base URL of the site.
  adapter: vercel(), // Vercel adapter for deploying the site; pages stay static, only routes with `prerender = false` run as functions.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })], // Generate a sitemap, excluding the 404 page.
  markdown: {
    processor: satteri({ hastPlugins: [sections] }), // Use the Satteri processor with custom section handling for markdown files.
  },
  vite: {
    optimizeDeps: { include: sketchLibs }, // Pre-bundle sketch libraries to improve first-visit performance.
  },
});
