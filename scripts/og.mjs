#!/usr/bin/env node
// Generate Open Graph images and the Apple touch icon using the site's fonts and colours.
//
//   public/og/<collection>/<slug>.png  One card per published entry, rendered from /dev/og/<collection>/<slug>
//   public/og-portfolio.png            Fallback card for the home page and entries without a custom card
//   public/og-lab.png                  Fallback card for the lab page and entries without a custom card
//   public/apple-touch-icon.png        180 × 180 home-screen icon
//
// Run `npm run og` after adding an entry or changing its screenshot.
// Uses Playwright's Chromium and reuses the dev server on port 4321 when available.
// Otherwise, starts a temporary server on port 4399.
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

// ---------- fonts and themes ----------
const font = (pkg, file) =>
  pathToFileURL(resolve('node_modules/@fontsource-variable', pkg, 'files', file)).href;
const FONTS = `
  @font-face { font-family: Bricolage; src: url(${font('bricolage-grotesque', 'bricolage-grotesque-latin-opsz-normal.woff2')}); font-weight: 200 800; }
  @font-face { font-family: Geist; src: url(${font('geist', 'geist-latin-wght-normal.woff2')}); font-weight: 100 900; }
  @font-face { font-family: GeistMono; src: url(${font('geist-mono', 'geist-mono-latin-wght-normal.woff2')}); font-weight: 100 900; }
`;

// the same tokens as src/styles/tokens.css
const THEMES = {
  portfolio: { bg: '#16151b', fg: '#ebe7f0', muted: '#9690a3', line: '#2e2b37', accent: '#79d3e6' },
  lab: { bg: '#f1efea', fg: '#1b1a20', muted: '#6a6571', line: '#d6d2c8', accent: '#177282' },
};

// ---------- HTML templates for cards and icons ----------
const card = (t, title, lede, label) => `<!doctype html><html><head><meta charset="utf-8"><style>
  ${FONTS}
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: ${t.bg}; color: ${t.fg}; font-family: Geist; padding: 72px 88px;
         display: flex; flex-direction: column; justify-content: space-between; }
  .top { display: flex; justify-content: space-between; align-items: center; font: 500 22px GeistMono; color: ${t.muted};
         letter-spacing: .04em; padding-bottom: 28px; border-bottom: 2px solid ${t.line}; }
  .brand { display: flex; align-items: center; gap: 16px; font: 600 28px Bricolage; color: ${t.fg}; letter-spacing: -.01em; }
  .brand i { width: 16px; height: 16px; border-radius: 50%; background: #79d3e6; }
  h1 { font: 800 200px/.9 Bricolage; letter-spacing: -.04em; }
  h1 span { color: ${t.accent}; }
  p { font: 400 38px/1.35 Bricolage; color: ${t.muted}; max-width: 26ch; }
</style></head><body>
  <div class="top"><span class="brand"><i></i>aniqa.dev</span><span>${label}</span></div>
  <div><h1>${title}<span>.</span></h1></div>
  <p>${lede}</p>
</body></html>`;

const icon = () => `<!doctype html><html><head><style>
  * { margin: 0; } body { width: 180px; height: 180px; background: #16151b; display: grid; place-items: center; }
  img { width: 128px; height: 128px; }
</style></head><body><img src="data:image/svg+xml;base64,${readFileSync('public/favicon.svg').toString('base64')}"></body></html>`;

// ---------- pages to render ----------
const pages = [
  {
    out: 'public/og-portfolio.png',
    size: [1200, 630],
    html: card(
      THEMES.portfolio,
      'Aniqa',
      'I started building to see how things work. Now I build to solve real problems.',
      'PORTFOLIO',
    ),
  },
  {
    out: 'public/og-lab.png',
    size: [1200, 630],
    html: card(THEMES.lab, 'Lab', 'A digital sketchbook. Everything I’ve made while learning.', 'LAB'),
  },
  { out: 'public/apple-touch-icon.png', size: [180, 180], html: icon() },
];

// ---------- temporary directory and browser setup ----------
const dir = mkdtempSync(join(tmpdir(), 'og-'));
const browser = await chromium.launch();
for (const { out, size, html } of pages) {
  const file = join(dir, 'page.html');
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: size[0], height: size[1] } });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  await page.close();
  console.log(`✓ ${out} (${size.join(' × ')})`);
}
// This section generates individual Open Graph images for each published entry.
const entries = ['projects', 'experiments'].flatMap((collection) =>
  readdirSync(`src/content/${collection}`)
    .filter((slug) => existsSync(`src/content/${collection}/${slug}/index.md`))
    // drafts get no card: public/ files are reachable even when the page is hidden
    .filter(
      (slug) => !/^draft:\s*true/m.test(readFileSync(`src/content/${collection}/${slug}/index.md`, 'utf8')),
    )
    .map((slug) => ({ collection, slug })),
);

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

// ---------- clean up old cards and generate new ones ----------
rmSync('public/og', { recursive: true, force: true }); // start clean, so deleted entries lose their cards
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const { collection, slug } of entries) {
  const out = `public/og/${collection}/${slug}.png`;
  mkdirSync(`public/og/${collection}`, { recursive: true });
  const res = await page.goto(`${base}/dev/og/${collection}/${slug}`, { waitUntil: 'networkidle' });
  if (!res?.ok()) {
    console.error(`✗ ${out}: card page returned ${res?.status()}`);
    process.exitCode = 1;
    continue;
  }
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  console.log(`✓ ${out}`);
}

await browser.close();
if (server) process.kill(-server.pid); // stop the dev server this run started
