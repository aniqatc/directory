#!/usr/bin/env node
// Take the screenshots for every entry, cropped to 16:10, saved next to each entry.
//
//   src/content/<collection>/<slug>/screenshot.png
//
// Each entry with a `live` site is shot at 1440 × 900 with Playwright's Chromium: projects in dark mode, lab
// entries in light. An experiment without a live site is shot on its own page here (its stage), using the dev
// server on port 4321 or a temporary one on 4399. If a site won't load, a project falls back to its repo's own
// screenshot. Rflect CLI has no site, so it uses the help screen from its repo.
//
// App reviews (src/content/reviews) of web apps are shot in light mode, drafts included since a review is shot
// before it goes up, and get logo.png from the site's icon if the folder has none. Phone and iPad apps are
// skipped: their screenshots come from the device.
//
// Run `npm run screenshots` to redo them all, or `npm run screenshots -- weather word-cycle` for some.
// A slug used twice (the Weather project and a Weather review) can be named in full: reviews/weather.
// The pages render them with <Image>, which makes the WebP; these PNGs never go in public/.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';

const SIZE = { width: 1440, height: 900 };
// the repo's own image, from its default branch
const repoImage = (path) => `https://raw.githubusercontent.com/aniqatc/${path}`;

// ---------- anything a site needs beyond "load it and wait" ----------
// switchTheme: for sites with their own theme toggle, which ignore the system setting
// whenReady: anything else to wait for before the shot
// fallback: the repo's own screenshot, if the live site won't load
// image: use this image instead of shooting a site
const OVERRIDES = {
  'projects/weather': {
    switchTheme: (page) => page.click('#flexSwitchCheckChecked'), // labelled "units", but it switches the theme
    fallback: repoImage('weather/HEAD/assets/screenshot-dark.png'),
  },
  'projects/playground': {
    switchTheme: (page) => page.click('#theme-btn'),
    fallback: repoImage('playground/HEAD/docs/screenshots/v2/playground-dark.png'),
  },
  'projects/keyboard': {
    // dark already; wait for the "Press esc for info" hint to go
    whenReady: (page) =>
      page.waitForFunction(() => !document.querySelector('.toasts')?.textContent?.trim(), null, {
        timeout: 15000,
      }),
    fallback: repoImage('keyboard/HEAD/assets/keyboard.png'),
  },
  'projects/moji-canvas': {
    fallback: repoImage('moji-canvas/HEAD/public/og-img.png'), // no dark mode, so its normal look
  },
  'projects/rflect-cli': {
    image: repoImage('rflect-cli/HEAD/assets/rflect-help-v2.png'),
  },
  'experiments/valorant': {
    switchTheme: (page) => page.click('button.theme'), // dark by default; the sun button makes it light
  },
};

// ---------- every entry, from its frontmatter ----------
const field = (text, name) => text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();
const entries = ['projects', 'experiments'].flatMap((collection) =>
  readdirSync(`src/content/${collection}`)
    .filter((slug) => existsSync(`src/content/${collection}/${slug}/index.md`))
    .map((slug) => ({ slug, text: readFileSync(`src/content/${collection}/${slug}/index.md`, 'utf8') }))
    // drafts get no screenshot until they're ready
    .filter(({ text }) => field(text, 'draft') !== 'true')
    .map(({ slug, text }) => {
      const live = field(text, 'live');
      const hasSketch = ['sketch.ts', 'sketch.astro'].some((f) =>
        existsSync(`src/content/${collection}/${slug}/${f}`),
      );
      return {
        collection,
        slug,
        colorScheme: collection === 'projects' ? 'dark' : 'light',
        // an experiment that runs here is shot on its own page; anything else needs a live site
        url: live ? `https://${live}` : undefined,
        stagePath: !live && hasSketch ? `/lab/${slug}` : undefined,
        ...OVERRIDES[`${collection}/${slug}`],
      };
    })
    .filter((entry) => entry.url || entry.stagePath || entry.image),
);

// app reviews: a web app's site, with its icon as logo.png; a phone or iPad app is left for its own screenshots
const plain = (value) => value?.replace(/\s+#.*$/, '').replace(/^['"]|['"]$/g, '');
const reviews = existsSync('src/content/reviews')
  ? readdirSync('src/content/reviews')
      .filter((slug) => existsSync(`src/content/reviews/${slug}/index.md`))
      .map((slug) => {
        const text = readFileSync(`src/content/reviews/${slug}/index.md`, 'utf8');
        const live = plain(field(text, 'live'));
        const device = plain(field(text, 'device')) ?? 'browser';
        if (device !== 'browser') return { collection: 'reviews', slug, onDevice: device };
        return {
          collection: 'reviews',
          slug,
          colorScheme: 'light',
          url: live && (/^https?:\/\//.test(live) ? live : `https://${live}`),
          withLogo: !existsSync(`src/content/reviews/${slug}/logo.png`),
        };
      })
      .filter((entry) => entry.url || entry.onDevice)
  : [];
entries.push(...reviews);

// ---------- helpers ----------
const download = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

// wait for fonts, images and data, then let animations settle
// only images on screen: lazy ones further down never load in a screenshot
const settle = async (page) => {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    const onScreen = [...document.images].filter(
      (img) => !img.complete && img.getBoundingClientRect().top < innerHeight,
    );
    const loaded = Promise.all(onScreen.map((img) => new Promise((r) => (img.onload = img.onerror = r))));
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 10000))]);
  });
  await page.waitForTimeout(1500);
};

// the site's icon: its apple-touch-icon, else its largest icon, else /favicon.ico
const findIcon = (page) =>
  page.evaluate(() => {
    const links = [...document.querySelectorAll('link[rel~="icon"], link[rel^="apple-touch-icon"]')];
    const size = (link) => Number.parseInt(link.getAttribute('sizes') ?? '', 10) || 0;
    const best =
      links.find((link) => link.rel.startsWith('apple-touch-icon')) ?? links.sort((a, b) => size(b) - size(a))[0];
    return new URL(best?.getAttribute('href') ?? '/favicon.ico', location.href).href;
  });

const shootSite = async (browser, { url, colorScheme, switchTheme, whenReady, withLogo }) => {
  const context = await browser.newContext({ viewport: SIZE, colorScheme });
  const page = await context.newPage();
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    if (!res?.ok()) throw new Error(`${url} returned ${res?.status()}`);
    await settle(page);
    if (switchTheme) {
      await switchTheme(page);
      await settle(page);
    }
    if (whenReady) await whenReady(page);
    const shot = await page.screenshot();
    const iconUrl = withLogo ? await findIcon(page).catch(() => undefined) : undefined;
    return { shot, iconUrl };
  } finally {
    await context.close();
  }
};

// an experiment's stage on this site, sharp at 2× so the crop still fills a large card
const shootStage = async (browser, base, { stagePath, colorScheme }) => {
  const context = await browser.newContext({ viewport: SIZE, colorScheme, deviceScaleFactor: 2 });
  const page = await context.newPage();
  try {
    await page.goto(`${base}${stagePath}`, { waitUntil: 'networkidle', timeout: 45000 });
    await settle(page);
    // keep the dev toolbar, the sticky header and the pet out of the shot, and the stage's frame: the crop would
    // cut it off at the sides of a 16:9 stage
    await page.addStyleTag({
      content:
        'astro-dev-toolbar, .hdr, .pet { display: none !important; } .stage { border: 0 !important; border-radius: 0 !important; }',
    });
    return await page.locator('.stage').screenshot();
  } finally {
    await context.close();
  }
};

// the dev server, for stages: reuse one on 4321, or start one on 4399 (stopped at the end)
let server = null;
const up = (url) =>
  fetch(url, { signal: AbortSignal.timeout(3000) })
    .then((r) => r.ok)
    .catch(() => false);
const devServer = async () => {
  if (await up('http://localhost:4321/lab')) return 'http://localhost:4321';
  if (!server) {
    server = spawn('npx', ['astro', 'dev', '--port', '4399', '--ignore-lock'], {
      stdio: 'ignore',
      detached: true,
    });
    for (let i = 0; i < 60 && !(await up('http://localhost:4399/lab')); i++)
      await new Promise((r) => setTimeout(r, 1000));
  }
  return 'http://localhost:4399';
};

// ---------- take, crop and save ----------
const only = process.argv.slice(2);
const chosen = entries.filter(
  ({ collection, slug }) => !only.length || only.includes(slug) || only.includes(`${collection}/${slug}`),
);
const browser = await chromium.launch();
try {
  for (const entry of chosen) {
    const folder = `src/content/${entry.collection}/${entry.slug}`;
    const out = `${folder}/screenshot.png`;
    if (entry.onDevice) {
      console.log(`– ${entry.collection}/${entry.slug} is a ${entry.onDevice} app: its screenshots come from the device`);
      continue;
    }
    let image;
    let source;
    let iconUrl;
    try {
      if (entry.image) {
        image = await download(entry.image);
        source = entry.image;
      } else if (entry.stagePath) {
        image = await shootStage(browser, await devServer(), entry);
        source = `its stage at ${entry.stagePath}`;
      } else {
        ({ shot: image, iconUrl } = await shootSite(browser, entry));
        source = entry.url;
      }
    } catch (err) {
      if (!entry.fallback) {
        console.error(`✗ ${out}: ${err.message.split('\n')[0]}`);
        process.exitCode = 1;
        continue;
      }
      console.warn(`! ${entry.slug}: ${err.message.split('\n')[0]}; using the repo's screenshot`);
      image = await download(entry.fallback);
      source = entry.fallback;
    }
    // 16:10; live shots are 16:10 already. A tall stage keeps its top, where its controls and title are.
    const { width, height } = await sharp(image).metadata();
    const cropWidth = Math.min(width, Math.round((height * 16) / 10));
    const cropHeight = Math.round((cropWidth * 10) / 16);
    const left = Math.floor((width - cropWidth) / 2);
    const top = entry.stagePath ? 0 : Math.floor((height - cropHeight) / 2);
    const cropped = sharp(image)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      // stages are shot at 2×; keep them no wider than a live shot
      .resize({ width: Math.min(cropWidth, SIZE.width) });
    writeFileSync(out, await cropped.png().toBuffer());
    console.log(`✓ ${out} from ${source}`);
    // a review's logo.png: the site's icon, square at 300 × 300 (an .ico can't be read, so save that one by hand)
    if (iconUrl) {
      try {
        const icon = await sharp(await download(iconUrl))
          .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        writeFileSync(`${folder}/logo.png`, icon);
        console.log(`✓ ${folder}/logo.png from ${iconUrl}`);
      } catch (err) {
        console.warn(`! ${folder}/logo.png: couldn't use ${iconUrl} (${err.message.split('\n')[0]}); add it by hand`);
      }
    }
  }
} finally {
  await browser.close();
  if (server) process.kill(-server.pid); // stop the dev server this run started
}
