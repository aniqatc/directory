// Smoke tests: every page loads cleanly, the two moods are right, and the interactive parts work.
// Run with `npm test` (starts or reuses the dev server).
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { BENCH } from '../src/lib/now';

/** Fails the test if the page logs an error or throws. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

/** Every case study and lab page, read from the two index pages. */
async function allPages(page: Page) {
  await page.goto('/');
  const work = await page.$$eval('.project h3 a', (a) => a.map((x) => x.getAttribute('href')!));
  await page.goto('/lab');
  const lab = await page.$$eval('.row .t a', (a) => a.map((x) => x.getAttribute('href')!));
  return [...work, ...lab];
}

test.describe('pages', () => {
  test('portfolio is dark, with five projects and the intro', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'portfolio');
    await expect(page.locator('.project')).toHaveCount(5);
    await expect(page.locator('.progress-now')).toContainText('01 / 05');
    await expect(page.locator('.building li').first()).toBeVisible();
    await expect(page.locator('.colophon')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('lab is light, with the archive, stats and bench (when listed)', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/lab');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    await expect(page.locator('.row').first()).toBeVisible();
    await expect(page.locator('.lab-top .facts dd').first()).not.toBeEmpty();
    // the bench card only shows when src/lib/now.ts has something on it
    await expect(page.locator('.bench')).toHaveCount(BENCH.length > 0 ? 1 : 0);
    expect(errors).toEqual([]);
  });

  test('every case study and lab page loads without errors', async ({ page }) => {
    const errors = watchErrors(page);
    for (const href of await allPages(page)) {
      const res = await page.goto(href);
      expect(res?.status(), href).toBe(200);
      await expect(page.locator('.d-title'), href).toBeVisible();
      await expect(page.locator('html'), href).toHaveAttribute(
        'data-mode',
        href.startsWith('/work') ? 'portfolio' : 'lab',
      );
    }
    expect(errors).toEqual([]);
  });

  test('every entry has its own link-preview card (run npm run og if this fails)', async ({
    page,
    request,
  }) => {
    for (const href of await allPages(page)) {
      await page.goto(href);
      const image = await page.getAttribute('meta[property="og:image"]', 'content');
      const slug = href.split('/').pop();
      expect(image, `${href}: own card`).toContain(`/og/`);
      expect(image, `${href}: own card`).toContain(`/${slug}.png`);
      const res = await request.get(new URL(image!).pathname);
      expect(res.status(), `${href}: ${image}`).toBe(200);
    }
  });

  test('a missing page gets the 404 with the sleeping dot', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await page.click('.nf-pet');
    await expect(page.locator('.nf-pet')).toHaveClass(/awake/);
  });

  test('drafts never show', async ({ page }) => {
    expect((await page.goto('/work/for-zayn'))?.status()).toBe(404);
    await page.goto('/');
    await expect(page.locator('.project[data-title="For Zayn"]')).toHaveCount(0);
  });
});

test.describe('interactions', () => {
  test('the Portfolio / Lab switch flips the mood', async ({ page }) => {
    await page.goto('/');
    await page.click('.switch a[href="/lab"]');
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    await expect(page.locator('.switch a[href="/lab"]')).toHaveAttribute('aria-current', 'page');
  });

  test('hovering an archive row shows its drawing', async ({ page }) => {
    await page.goto('/lab');
    const row = page.locator('.row').first();
    await row.hover();
    await page.mouse.move(400, (await row.boundingBox())!.y + 20);
    await expect(page.locator('.tip')).toHaveClass(/show/);
    await expect(page.locator('.tip .pvbox:not([hidden])')).toHaveCount(1);
  });

  test('random entry opens a lab page', async ({ page }) => {
    await page.goto('/lab');
    await page.click('.dice');
    await expect(page).toHaveURL(/\/lab\/.+/, { timeout: 5000 });
  });

  test('the pet comes out, follows you to the next page, and goes home', async ({ page }) => {
    await page.goto('/');
    await page.click('.brand i');
    await expect(page.locator('.pet')).toHaveCount(1);
    await page.focus('.switch a[href="/lab"]');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.locator('.pet')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pet')).toHaveCount(0, { timeout: 3000 });
  });
});

test.describe('page changes (view transitions)', () => {
  test('links swap pages without a reload, and every script still works afterwards', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1)); // gone if the page reloads
    const sameDocument = () => page.evaluate(() => (window as unknown as { marker?: number }).marker === 1);

    // portfolio → lab: the mood flips, the archive's scripts start
    await page.click('.switch a[href="/lab"]');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    expect(await sameDocument()).toBe(true);
    await expect(page.locator('.row .like .lc').first()).toHaveText(/\d+/); // likes filled in
    const row = page.locator('.row').first();
    await row.hover();
    await page.mouse.move(400, (await row.boundingBox())!.y + 20);
    await expect(page.locator('.tip')).toHaveClass(/show/); // hover preview

    // lab → a lab note: the big heart and the drawing's scaling start
    await page.click('.row .t a >> nth=0');
    await expect(page.locator('.d-title')).toBeVisible();
    expect(await sameDocument()).toBe(true);
    await expect(page.locator('.like-lg .lc')).toHaveText(/\d+/);
    await expect(page.locator('.pvbig')).toHaveAttribute('style', /--s:/);

    // back to the portfolio: the scroll counter and card drawings work again
    await page.click('.switch a[href="/"]');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'portfolio');
    expect(await sameDocument()).toBe(true);
    await page.locator('.project').nth(2).scrollIntoViewIfNeeded();
    await expect(page.locator('.progress-now b')).not.toHaveText('01 / 05');
    await expect(page.locator('.project .pvbig').first()).toHaveAttribute('style', /--s:/);
    expect(errors).toEqual([]);
  });

  test('the pet stays out across page changes', async ({ page }) => {
    await page.goto('/');
    await page.click('.brand i');
    const pet = await page.locator('.pet').elementHandle();
    await page.click('.switch a[href="/lab"]');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    // the very same element, still out, and the new header's dot stays hidden
    expect(await pet!.evaluate((el) => el.isConnected)).toBe(true);
    await expect(page.locator('.brand i')).toHaveClass(/out/);
  });
});

test.describe('likes', () => {
  test('the heart fills to five, then a sixth like is refused', async ({ page }) => {
    // an in-memory stand-in for /api/likes with the same rules, so the test never touches the real counts
    const counts = new Map<string, number>();
    await page.route('**/api/likes**', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        const slugs = new URL(req.url()).searchParams.get('slugs')!.split(',');
        return route.fulfill({
          json: Object.fromEntries(
            slugs.map((s) => [s, { total: counts.get(s) ?? 0, mine: counts.get(s) ?? 0 }]),
          ),
        });
      }
      const { slug } = req.postDataJSON();
      const mine = counts.get(slug) ?? 0;
      if (mine < 5) counts.set(slug, mine + 1);
      const n = counts.get(slug)!;
      return route.fulfill({ json: { total: n, mine: n, ok: mine < 5 } });
    });

    await page.goto('/lab');
    const heart = page.locator('.row .like').first();
    await expect(heart.locator('.lc')).toHaveText('0');
    for (let i = 1; i <= 5; i++) {
      await heart.click();
      await expect(heart.locator('.lc')).toHaveText(String(i));
    }
    await expect(heart).toHaveClass(/full/);
    await heart.click();
    await expect(heart).toHaveClass(/nope/);
    await expect(heart.locator('.lc')).toHaveText('5');
  });

  test('the API refuses a sixth like from the same visitor', async ({ request }) => {
    const env = readEnv();
    test.skip(!env.UPSTASH_REDIS_REST_URL, 'needs Upstash credentials in .env');
    const visitor = crypto.randomUUID();
    const slug = 'world-clock';
    try {
      const results = [];
      for (let i = 0; i < 6; i++) {
        results.push(await (await request.post('/api/likes', { data: { slug, visitor } })).json());
      }
      expect(results.slice(0, 5).every((r) => r.ok)).toBe(true);
      expect(results[4].mine).toBe(5);
      expect(results[5]).toMatchObject({ ok: false, mine: 5 });
    } finally {
      // take this test visitor's likes back out of the real counts
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
      const mine = Number((await redis.get(`likes:${slug}:by:${visitor}`)) ?? 0);
      if (mine) await redis.decrby(`likes:${slug}`, mine);
      await redis.del(`likes:${slug}:by:${visitor}`);
      if (Number((await redis.get(`likes:${slug}`)) ?? 0) <= 0) await redis.del(`likes:${slug}`);
    }
  });
});

test.describe('accessibility', () => {
  test('keyboard: every link and button can be reached and shows a focus ring', async ({ page }) => {
    for (const path of ['/', '/lab', '/work/weather', '/lab/world-clock']) {
      await page.goto(path, { waitUntil: 'load' });
      // number every visible link and button, then Tab through and tick them off
      // (document.querySelectorAll, not $$eval: Playwright's selectors reach into the dev toolbar's shadow DOM)
      const ids = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('a[href], button:not([hidden])')]
          .filter((e) => e.offsetParent !== null)
          .map((e, i) => {
            e.setAttribute('data-kb', String(i));
            return String(i);
          }),
      );
      const reached = new Set<string>();
      for (let i = 0; i < ids.length + 20; i++) {
        // extra presses: the dev toolbar (dev only) takes a few
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el?.dataset.kb) return null; // body, or the dev toolbar
          const s = getComputedStyle(el);
          return {
            id: el.dataset.kb,
            html: el.outerHTML.slice(0, 80),
            ring: s.outlineStyle !== 'none' && s.outlineWidth !== '0px',
          };
        });
        if (!info) continue;
        expect(info.ring, `${path}: focus ring on ${info.html}`).toBe(true);
        reached.add(info.id);
      }
      expect(
        ids.filter((id) => !reached.has(id)),
        `${path}: not reachable by Tab`,
      ).toEqual([]);
    }
  });

  test('reduced motion: drawings and the dot stop moving', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/lab');
    const anim = await page.$$eval('.pv *, .dot, .bench .dot-on', (els) =>
      els.map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'),
    );
    expect(anim).toEqual([]);
    await context.close();
  });
});

function readEnv(): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync('.env', 'utf8')
        .split('\n')
        .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
        .filter((m): m is RegExpMatchArray => Boolean(m))
        .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, '')]),
    );
  } catch {
    return {};
  }
}
