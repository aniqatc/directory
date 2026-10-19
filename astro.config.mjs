// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { sections } from './src/lib/md-sections.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://aniqa.dev',
  adapter: vercel(), // pages stay static; only routes with `prerender = false` run as functions
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [sections] }), // ## headings in project files become label-left sections
  },
});
