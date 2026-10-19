import { defineConfig } from '@playwright/test';

// Smoke tests run against the dev server: `astro preview` doesn't support the Vercel adapter, and the likes
// API needs a server anyway. An already running `npm run dev` is reused.
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  webServer: { command: 'npm run dev', port: 4321, reuseExistingServer: true, timeout: 60_000 },
  use: { baseURL: 'http://localhost:4321' },
});
