// Smoke tests: every page loads cleanly, the two moods are right, and the interactive parts work.
// Run with `npm test` (starts or reuses the dev server).
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Watches for page errors and console errors during the test.
function watchErrors(page: Page) {
  const errors: string[] = [];
  // Listen for page errors and console errors and collect them in the `errors` array.
  page.on('pageerror', (e) => errors.push(e.message));
  // Listen for console messages of type 'error' and collect them in the `errors` array.
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

// Returns a list of all case study and lab page URLs by reading the two index pages.
async function allPages(page: Page) {
  await page.goto('/');
  // Get all work project links from the portfolio index page.
  const work = await page.$$eval('.project h3 a', (a) => a.map((x) => x.getAttribute('href')!));
  await page.goto('/lab');
  // Get all lab project links from the lab index page.
  const lab = await page.$$eval('.row .t a', (a) => a.map((x) => x.getAttribute('href')!));
  return [...work, ...lab];
}

// Test suite for various pages and their expected behaviors.
test.describe('pages', () => {
  // Test for the portfolio index page.
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

  // Test for the lab index page.
  test('lab is light, with the stats row, archive and next-entry row', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/lab');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    await expect(page.locator('.row').first()).toBeVisible();
    await expect(page.locator('.lab-stats .facts dd').first()).not.toBeEmpty();
    // random entry sits at the end of the stats row
    await expect(page.locator('.lab-stats .dice')).toBeVisible();
    // the list ends with the next entry, numbered one past the last
    const entries = await page.locator('.row').count();
    await expect(page.locator('.next-entry-number')).toHaveText(String(entries + 1).padStart(2, '0'));
    expect(errors).toEqual([]);
  });

  // Test the next-entry sign-up: it only says thanks for now, and sends nothing.
  test('the next-entry form thanks you without sending anything', async ({ page }) => {
    await page.goto('/lab');
    const requests: string[] = [];
    page.on('request', (r) => r.method() !== 'GET' && requests.push(r.url()));
    await page.fill('.next-entry-email', 'someone@example.com');
    await page.click('.next-entry-button');
    await expect(page.locator('.next-entry-thanks')).toBeVisible();
    await expect(page.locator('.next-entry-form')).toBeHidden();
    expect(requests).toEqual([]);
  });

  // Test that every case study and lab page loads without errors.
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

  // Test that every entry has its own link-preview card.
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
  // Test that a missing page returns the 404 with the sleeping dot.
  test('a missing page gets the 404 with the sleeping dot', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await page.click('.nf-pet');
    await expect(page.locator('.nf-pet')).toHaveClass(/awake/);
  });
  // Test that draft projects never show up in the portfolio.
  test('drafts never show', async ({ page }) => {
    expect((await page.goto('/work/for-zayn'))?.status()).toBe(404);
    await page.goto('/');
    await expect(page.locator('.project[data-title="For Zayn"]')).toHaveCount(0);
  });
});

// Test suite for interactive elements and user interactions.
test.describe('interactions', () => {
  // Test that the Portfolio / Lab switch correctly changes the site mode.
  test('the Portfolio / Lab switch flips the mood', async ({ page }) => {
    await page.goto('/');
    await page.click('.switch a[href="/lab"]');
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    await expect(page.locator('.switch a[href="/lab"]')).toHaveAttribute('aria-current', 'page');
  });

  // Test that hovering over an archive row reveals its associated drawing.
  test('hovering an archive row shows its drawing', async ({ page }) => {
    await page.goto('/lab');
    const row = page.locator('.row').first();
    await row.hover();
    await page.mouse.move(400, (await row.boundingBox())!.y + 20);
    await expect(page.locator('.tip')).toHaveClass(/show/);
    await expect(page.locator('.tip .pvbox:not([hidden])')).toHaveCount(1);
  });

  // Test that clicking the random entry button navigates to a lab page.
  test('random entry opens a lab page', async ({ page }) => {
    await page.goto('/lab');
    await page.click('.dice');
    await expect(page).toHaveURL(/\/lab\/.+/, { timeout: 5000 });
  });

  // Test that the pet comes out, follows you to the next page, and goes home.
  test('the pet comes out, follows you to the next page, and goes home', async ({ page }) => {
    await page.goto('/');
    await page.click('.brand i');
    await expect(page.locator('.pet')).toHaveCount(1);
    await expect(page.locator('.pet')).toHaveAttribute('data-pet', /^[a-z]+$/); // whichever pet src/lib/pets.ts picks
    await page.focus('.switch a[href="/lab"]');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.locator('.pet')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pet')).toHaveCount(0, { timeout: 3000 });
  });
});

// Test suite for individual experiment pages.
test.describe('experiment pages', () => {
  // Test that an individual experiment page has the expected elements and behaviors.
  test('a study: the lab-note header with Links, a stage that fits, Day / Night and Pause, but no Fullscreen', async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto('/lab/word-cycle');
    await expect(page.locator('.d-head .facts dt')).toHaveText(['Made', 'Type', 'Stack', 'Links']);
    // the top bar has Archive and the like button, but no position (No. 04 / 12)
    await expect(page.locator('.d-top')).not.toContainText('No.');
    await expect(page.locator('.d-eyebrow .chip')).toHaveText('Updated');
    await expect(page.locator('.heads-up')).toHaveCount(0);
    // Links in the notes go to other sites, so they open in a new tab like Live and Code
    await expect(page.locator('.sec a[href^="https://codepen.io"]')).toHaveAttribute('target', '_blank');
    const stage = page.locator('.stage');
    await expect(stage).toHaveClass(/stage-fit/);
    await expect(page.locator('[data-act="fullscreen"], .fs-exit')).toHaveCount(0);
    // Links holds Code and v1, both in a new tab; the stage has no Fig. label and its caption no links
    const entryLinks = page.locator('.entry-facts dd a');
    await expect(entryLinks).toHaveText(['Code ↗', 'v1 ↗']);
    await expect(entryLinks.first()).toHaveAttribute(
      'href',
      /\/directory\/tree\/main\/src\/content\/experiments\/word-cycle$/,
    );
    await expect(entryLinks.last()).toHaveAttribute('href', 'https://codepen.io/aniqatc/pen/xxJVMYK');
    for (const link of await entryLinks.all()) await expect(link).toHaveAttribute('target', '_blank');
    await expect(page.locator('.stage-bar a')).toHaveCount(0);
    await expect(stage).not.toContainText('Fig.');

    // Day / Night sits in the stage's corner; Night gives the stage the portfolio's colours and leaves the page light
    await expect(stage.locator('.stage-theme')).toBeVisible();
    const bg = (sel: string) =>
      page.locator(sel).evaluate((el) => getComputedStyle(el).getPropertyValue('--bg').trim());
    await page.click('[data-theme-set="night"]');
    await expect(stage).toHaveClass(/night/);
    await expect(page.locator('[data-theme-set="night"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await bg('.stage')).toBe('#16151b');
    expect(await bg('body')).toBe('#f1efea');

    // The study itself works: Roll swaps the version, and the caption's Pause stops it like a sketch
    await page.click('button[data-mode="roll"]');
    await expect(page.locator('.scene')).toHaveAttribute('data-mode', 'roll');
    await expect(page.locator('.demo-code')).toContainText('translateY');
    const pause = page.locator('.stage-bar [data-act="pause"]');
    await expect(pause).toHaveText('Pause');
    await pause.click();
    await expect(pause).toHaveText('Play');
    await expect(page.locator('.scene')).toHaveCSS('--play', 'paused');
    expect(errors).toEqual([]);
  });

  // Test that a lab note retains its drawing and shows its Live and Code links in the header facts.
  test('a lab note keeps its drawing, with Live and Code in its Links', async ({ page }) => {
    await page.goto('/lab/world-clock');
    await expect(page.locator('.d-head .facts dt')).toHaveText(['Made', 'Type', 'Stack', 'Links']);
    await expect(page.locator('.pvbig')).toBeVisible();
    await expect(page.locator('.entry-facts dd a')).toHaveText(['Live ↗', 'Code ↗']);
    await expect(page.locator('.d-top')).not.toContainText('No.');
    await expect(page.locator('figcaption')).toHaveCount(0);
    await expect(page.locator('.heads-up, .stage')).toHaveCount(0);
  });
});

// Test suite for page changes and view transitions, ensuring smooth navigation and script persistence.
test.describe('page changes (view transitions)', () => {
  // Test that navigating between pages does not trigger a full reload and that scripts continue to function.
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

    // lab → a lab note: the big heart and the drawing's scaling start (a lab note by name: the newest row can be an experiment, which has a stage instead of a drawing)
    await page.click('.row[data-slug="world-clock"] .t a');
    await expect(page.locator('.d-title')).toBeVisible();
    expect(await sameDocument()).toBe(true);
    await expect(page.locator('.like-lg .lc')).toHaveText(/\d+/);
    await expect(page.locator('.pvbig')).toHaveAttribute('style', /--s:/);

    // portfolio → lab → a lab note → back to the portfolio: the scroll counter and card drawings work again
    await page.click('.switch a[href="/"]');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'portfolio');
    expect(await sameDocument()).toBe(true);
    await page.locator('.project').nth(2).scrollIntoViewIfNeeded();
    await expect(page.locator('.progress-now b')).not.toHaveText('01 / 05');
    await expect(page.locator('.project .pvbig').first()).toHaveAttribute('style', /--s:/);
    expect(errors).toEqual([]);
  });

  // Test that the pet element remains visible and connected across page changes.
  test('the pet stays out across page changes', async ({ page }) => {
    await page.goto('/');
    await page.click('.brand i');
    const pet = await page.locator('.pet').elementHandle();
    await page.click('.switch a[href="/lab"]');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lab');
    // Ensure the pet element is still connected to the DOM after the page change.
    expect(await pet!.evaluate((el) => el.isConnected)).toBe(true);
    await expect(page.locator('.brand i')).toHaveClass(/out/);
  });
});

// Test suite for the like functionality, including the heart filling and API limits.
test.describe('likes', () => {
  // Test that the heart fills to five likes and refuses a sixth like.
  test('the heart fills to five, then a sixth like is refused', async ({ page }) => {
    // Intercept API requests to /api/likes and simulate like counts in memory.
    const counts = new Map<string, number>();
    await page.route('**/api/likes**', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        // Respond to GET requests with the current like counts for the requested slugs.
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
      // Respond to POST requests by incrementing the like count if under the limit.
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

  // Test that the API correctly enforces the limit of five likes per visitor.
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
      // Clean up the likes for this test visitor to avoid affecting other tests.
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
      const mine = Number((await redis.get(`likes:${slug}:by:${visitor}`)) ?? 0);
      if (mine) await redis.decrby(`likes:${slug}`, mine);
      await redis.del(`likes:${slug}:by:${visitor}`);
      if (Number((await redis.get(`likes:${slug}`)) ?? 0) <= 0) await redis.del(`likes:${slug}`);
    }
  });
});

// Accessibility tests for keyboard navigation and focus rings.
test.describe('accessibility', () => {
  // Test that every link and button can be reached via keyboard and shows a focus ring.
  test('keyboard: every link and button can be reached and shows a focus ring', async ({ page }) => {
    for (const path of ['/', '/lab', '/work/weather', '/lab/world-clock', '/lab/word-cycle']) {
      await page.goto(path, { waitUntil: 'load' });
      // Number every visible link and button, then Tab through and tick them off.
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
        // Press Tab to move focus to the next interactive element (dev only for navigating the page)
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el?.dataset.kb) return null; // body, or the dev toolbar
          const s = getComputedStyle(el);
          // Check if the element has a visible focus ring.
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

  // Test for reduced motion settings affecting animations.
  test('reduced motion: drawings and the dot stop moving', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/lab');
    const anim = await page.$$eval('.pv *, .dot', (els) =>
      els.map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'),
    );
    expect(anim).toEqual([]);
    await context.close();
  });
});

// Utility function to read environment variables from the .env file.
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
