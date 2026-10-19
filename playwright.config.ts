import { defineConfig } from '@playwright/test';

// Smoke tests run against the dev server: `astro preview` doesn't support the Vercel adapter, and the likes
// API needs a server anyway. An already running `npm run dev` is reused. In CI (.github/workflows/ci.yml)
// failures are annotated on the commit and an HTML report is saved.
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  webServer: { command: 'npm run dev', port: 4321, reuseExistingServer: true, timeout: 120_000 },
  use: { baseURL: 'http://localhost:4321' },
});
