// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://aniqa.dev',
  adapter: vercel(), // pages stay static; only routes with `prerender = false` run as functions
  integrations: [sitemap()],
});
