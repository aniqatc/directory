# aniqa.dev

Aniqa's portfolio (`aniqa.dev`, dark) and lab (`aniqa.dev/lab`, light). One Astro 7 site, plain CSS, strict TypeScript, on Vercel. Every page is static except the likes API. `README.md` is the human guide; this file covers what isn't obvious from the code.

## Commands

- Dev server: `astro dev --background` (manage with `astro dev stop` / `status` / `logs`). Restart it after changing `package.json` or `astro.config.mjs`, or Vite serves "504 Outdated Optimize Dep".
- `npm run build` (type-check + build), `npm test` (Playwright against the dev server), `npm run lint`, `npm run format`.
- There is no `npm run preview`; the Vercel adapter doesn't support it.
- Check changes in a real browser with Playwright screenshots, not just the build.

## Content

- One folder per entry in `src/content/`; the folder name is the slug. `projects/` is Selected work (`/work/<slug>`), `experiments/` is the lab (`/lab/<slug>`). Schema: `src/content.config.ts`.
- Every entry needs `index.md` and `preview.astro` (its drawing); a missing drawing fails the build. An experiment with `sketch.ts` or `sketch.astro` gets a live stage page; without one it's a note that links out.
- `draft: true` hides an entry everywhere. `example: true` marks a placeholder.
- Scaffold with `npm run new` (copies from `templates/`). Follow the skills in `.claude/skills/` for new projects, experiments and drawings.
- After adding an entry or changing a title, blurb or drawing, run `npm run og` and commit the images in `public/og/`. Vercel can't generate them, and a test fails if one is missing.

## Gotchas

- Markdown runs through Sätteri, not remark/rehype: add plugins to `satteri({ hastPlugins })` in `astro.config.mjs`, not `markdown.rehypePlugins`.
- View transitions are on, so page scripts run once. Put per-page setup in `onPage()` from `src/scripts/page.ts` and return a cleanup function. Navigate with `navigate()` from `astro:transitions/client`.
- p5 and three aren't installed by default. Install one when an experiment needs it, then restart the dev server.
- The Upstash database is live. Clean up any test likes you create.
- Never print the values in `.env`.

## Conventions

- Entry notes: first person, plain and specific. Don't invent facts; leave `[bracketed notes]` for Aniqa to fill in.
- Keep: plain CSS with tokens in `src/styles/tokens.css` (no Tailwind), the lab at `/lab` (`lab.aniqa.dev` redirects there), no hover preview on touch screens, and reduced motion turning animations off.
- Astro docs: https://docs.astro.build
