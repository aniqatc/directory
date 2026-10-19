# aniqa.dev

Aniqa's portfolio (`aniqa.dev`, dark) and lab (`aniqa.dev/lab`, light): one Astro 7 site, plain CSS (no Tailwind), TypeScript strict, hosted on Vercel. Every page is static except the likes API. `README.md` is the human guide to adding entries; this file is the working context for agents.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

| Command                                              | What it does                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run build`                                      | `astro check` then `astro build` (output in `dist/client` and `.vercel/output`)             |
| `npm run check` / `lint` / `format` / `format:check` | Type-check, ESLint, Prettier                                                                |
| `npm test`                                           | Playwright smoke tests (`tests/smoke.spec.ts`) against the dev server; reuses a running one |
| `npm run new`                                        | Scaffold an entry from `templates/` (see below)                                             |

- There is no `npm run preview`: the Vercel adapter doesn't support `astro preview`. Test against the dev server.
- After installing a package, or changing `package.json` or `astro.config.mjs`, restart the dev server (`astro dev stop`, `astro dev --background`). Otherwise Vite serves "504 Outdated Optimize Dep" and scripts fail to load. Clearing `node_modules/.vite` gives a clean start.
- Check work in a real browser with Playwright (installed) and screenshots, not just the build.

## Content model

Everything lives in `src/content/`, one folder per entry. The folder name is the slug.

```
src/content/
├── projects/<slug>/       → portfolio (Selected work), /work/<slug>
│   ├── index.md           # frontmatter (facts) + ## sections (case study)
│   └── preview.astro      # its drawing
└── experiments/<slug>/    → lab, /lab/<slug>
    ├── index.md
    ├── preview.astro
    └── sketch.ts | sketch.astro   # only if it runs on the page
```

- Schema: `src/content.config.ts`. Both collections share a base (title, type, stack, released `YYYY-MM`, live host, repo, summary, updated, draft). `projects` adds `order` (position in Selected work) and `blurb`. `experiments` adds `example`, `hint` and `time`.
- **The folder decides the side** (projects vs experiments). **A sketch file decides the page**: an experiment with `sketch.ts`/`sketch.astro` gets the stage page; without one it's a lab note linking out.
- **Every entry needs `preview.astro`.** It shows on portfolio cards, the lab hover preview, and the detail page (except sketch experiments, whose page shows the sketch). A missing one fails the build.
- `draft: true` hides an entry from the portfolio and lab everywhere, dev included; `/dev/drawings` still lists it. `example: true` marks a placeholder: "Example" tag, left out of stats, Random entry and Latest in the lab.
- `## Heading` sections in `index.md` become label-left sections through a Sätteri hast plugin (`src/lib/md-sections.mjs`, wired in `astro.config.mjs`). Astro 7's default Markdown processor is Sätteri, so `markdown.rehypePlugins` doesn't work; add plugins to `satteri({ hastPlugins })`.
- `src/lib/projects.ts`: `getSelected()`, `getLab()` (numbered oldest first), `byYear`, `stats`, `latest`, `links`. `src/lib/badges.ts`: New (released within 60 days) / Updated (the 3 newest `updated`) / Example.
- Short lists that aren't entries: `src/lib/now.ts` (tinkering chips, Now building, On the bench) and `src/lib/contact.ts`.

## Adding entries

- `npm run new` copies a folder from `templates/` (`project`, `experiment`, `experiment-{canvas,p5,three,css}`), fills the frontmatter in `index.md`, and replaces `{{title}}` / `{{slug}}` in the other files. Use flags with `--yes` to skip prompts.
- `templates/` is excluded from Prettier (`.prettierignore`) and from the type check (`tsconfig.json`), because its files hold placeholders and only make sense once copied.
- Project skills in `.claude/skills/`: `new-project` (portfolio + drawing), `new-experiment` (lab: links out, or builds a sketch), `new-drawing` (the drawing rules; the other two follow it).

## Drawings

- `preview.astro` is markup plus a scoped `<style>` on a 200 × 140 board. `src/components/Preview.astro` finds it by folder and scales it (`fit="width"`, `fit="height"`, or a fixed `scale`).
- Board colours: `--pf`, `--pm`, `--pl`, `--ps`, `--hi` (mint accent, on one element). A custom background starts with `<i class="pv-bg">`. Shared board CSS and keyframes are in `src/styles/drawings.css`; animations are paused until shown.
- All drawings are dark. `/dev/drawings` (dev only, `?only=slug`) shows every drawing at every size.

## Sketches

- `sketch.ts` exports `start(stage)` per `src/lib/sketch.ts`: draw into the stage, size to it, handle resizes, return `stop` (plus optional `pause` / `resume` / `restart`, which turn on those buttons). `sketch.astro` is plain HTML/CSS rendered into the stage.
- `src/scripts/sketch-runner.ts` loads each sketch as its own bundle and runs Pause / Restart / Fullscreen; reduced-motion visitors start paused.
- p5 and three aren't installed by default. When an experiment needs one, install it (`npm i p5 && npm i -D @types/p5`); `astro.config.mjs` pre-bundles whichever is installed.

## Page scripts and view transitions

- `ClientRouter` (in `src/layouts/Base.astro`) swaps pages in place with a 0.5s cross-fade, so the portfolio ↔ lab switch fades between night and day.
- Because of that, a page's script runs once, not per visit. Put per-page setup in `onPage()` from `src/scripts/page.ts`. It runs on every page; return a cleanup function to stop timers, observers and listeners before the next page swaps in. Document-level delegated listeners (likes clicks, contact copy) are registered once at module level.
- The pet (`src/scripts/pet.ts`) lives in `#pet-layer` (`transition:persist`), so it survives page changes; it looks up the header dot fresh each time. On a full reload it restores its spot from `sessionStorage`.
- Use `navigate()` from `astro:transitions/client` for scripted navigation.

## Likes

- `src/pages/api/likes.ts` (`prerender = false`, a Vercel function). GET `?visitor=<uuid>&slugs=a,b` returns `{ slug: { total, mine } }`; POST `{ slug, visitor }` adds one.
- Redis keys: `likes:<slug>` is the total; `likes:<slug>:by:<visitor>` is one visitor's count (0–5). A Lua script checks the limit and increments both atomically. Rate limit: 20 POSTs per 10s per IP (`@upstash/ratelimit`, keys `rl:likes*`). Only published lab entries can be liked.
- The client (`src/scripts/likes.ts`) keeps an anonymous visitor UUID in `localStorage`, updates optimistically and rolls back on failure.
- The Upstash database is the live one. Don't leave test likes behind: the API smoke test deletes its own; clean up any others.

## Stars

`src/lib/github.ts` fetches star counts at build time, one request per repo, using `GITHUB_TOKEN` if set. If GitHub fails, the stars are hidden rather than failing the build. `.github/workflows/refresh-stars.yml` calls a Vercel deploy hook (`VERCEL_DEPLOY_HOOK` secret) daily at 09:00 UTC; scheduled workflows only run from the default branch.

## Meta and link previews

`Base.astro` sets the title, description, canonical URL, `theme-color` (dark or light per mode), Open Graph and Twitter card tags. Pages pass `description` (detail pages use the entry's summary); the 404 passes `noindex`. Every published entry has its own share card, `public/og/<collection>/<slug>.png` (title, label, type · year, blurb and its real drawing), screenshotted from the dev-only page `/dev/og/<collection>/<slug>`. `Detail.astro` uses it when the file exists and falls back to `public/og-portfolio.png` / `public/og-lab.png` (also used by the home and lab pages). `npm run og` (`scripts/og.mjs`) draws all of them plus `public/apple-touch-icon.png`, reusing a running dev server or starting one; it skips drafts, because `public/` files are reachable even when a page is hidden. Vercel can't run a browser, so the images are generated locally and committed: rerun `npm run og` after adding an entry, changing a drawing or editing a title or blurb. A smoke test fails if an entry is missing its card. `public/robots.txt` points to the sitemap and disallows `/api/`.

## Environment

`.env` (gitignored; names in `.env.example`): `GITHUB_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (the Vercel Marketplace may name them `KV_REST_API_URL` / `KV_REST_API_TOKEN`; both work). Never print their values.

## Deploy (Vercel)

1. Import the repo; Astro is detected (build `npm run build`). Pushes get preview deploys; `main` is production.
2. Environment variables: `GITHUB_TOKEN`, plus the Upstash pair if Upstash wasn't added through the Marketplace.
3. Domains: `aniqa.dev`, `www.aniqa.dev` (redirect to apex), `lab.aniqa.dev`. `vercel.json` 308-redirects `lab.aniqa.dev/*` to `aniqa.dev/lab/*`; it only runs for domains attached to this project.
4. Deploy hook `refresh-stars` on `main` → GitHub secret `VERCEL_DEPLOY_HOOK`.
5. Check: `lab.aniqa.dev/world-clock` lands on `aniqa.dev/lab/world-clock`, and a sixth like is refused.

## Conventions

- Match the existing voice in entry notes: first person, plain and specific, British spelling (practise, colour). Don't invent facts; leave `[bracketed notes]` for Aniqa.
- Commits: never add Claude / AI co-author lines. Don't push unless asked.
- Design decisions to keep: plain CSS with tokens in `src/styles/tokens.css` (`--pop` dark accent, `--pop-lab` light); the lab at `/lab`, not a subdomain; touch screens get no hover preview; reduced motion turns animations off globally.

## Astro Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
- [View transitions](https://docs.astro.build/en/guides/view-transitions/)
