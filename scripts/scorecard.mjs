#!/usr/bin/env node
// Make the scorecard for an app review: the picture to post with it on X.
//
//   src/content/reviews/<slug>/scorecard.png  1200 × 675 (16:9, shown full size in a post), saved at 2× so it stays
//                                             sharp, rendered from /dev/scorecard/<theme>/<slug>
//
// Run `npm run scorecard -- tally-ho` for one review, or `npm run scorecard` for all of them, drafts included,
// since the card is made before the review goes up. Each card uses the review's `cardTheme` (night by default);
// `--day` or `--night` makes that one instead. The review page's link preview is the same card at 1200 × 630,
// made with the others by `npm run og`.
// Uses Playwright's Chromium and reuses the dev server on port 4321 when available.
// Otherwise, starts a temporary server on port 4399.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { argv } from 'node:process';
import { chromium } from 'playwright';

// ---------- which reviews, and in which theme ----------
const args = argv.slice(2);
const forced = args.includes('--day') ? 'day' : args.includes('--night') ? 'night' : undefined;
const only = args.filter((arg) => !arg.startsWith('--'));
const reviews = readdirSync('src/content/reviews')
  .filter((slug) => existsSync(`src/content/reviews/${slug}/index.md`))
  .filter((slug) => !only.length || only.includes(slug))
  .map((slug) => {
    const text = readFileSync(`src/content/reviews/${slug}/index.md`, 'utf8');
    const theme = forced ?? text.match(/^cardTheme:\s*['"]?(night|day)/m)?.[1] ?? 'night';
    return { slug, theme };
  });
for (const slug of only) {
  if (!reviews.some((review) => review.slug === slug))
    console.error(`✗ no review at src/content/reviews/${slug}`);
}

// ---------- the dev server: reuse one on 4321, or start one on 4399 (stopped at the end) ----------
let server = null;
let base = 'http://localhost:4321';
const up = (url) =>
  fetch(url)
    .then((r) => r.ok)
    .catch(() => false);
if (!(await up(`${base}/lab`))) {
  base = 'http://localhost:4399';
  server = spawn('npx', ['astro', 'dev', '--port', '4399', '--ignore-lock'], {
    stdio: 'ignore',
    detached: true,
  });
  for (let i = 0; i < 60 && !(await up(`${base}/lab`)); i++) await new Promise((r) => setTimeout(r, 1000));
}

// ---------- shoot each card ----------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 2 });
for (const { slug, theme } of reviews) {
  const out = `src/content/reviews/${slug}/scorecard.png`;
  const res = await page.goto(`${base}/dev/scorecard/${theme}/${slug}`, { waitUntil: 'networkidle' });
  if (!res?.ok()) {
    console.error(`✗ ${out}: scorecard page returned ${res?.status()}`);
    process.exitCode = 1;
    continue;
  }
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  console.log(`✓ ${out} (${theme})`);
}

await browser.close();
if (server) process.kill(-server.pid); // stop the dev server this run started
