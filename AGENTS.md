# aniqa.dev

Aniqa's portfolio (`aniqa.dev`, dark) and lab (`aniqa.dev/lab`, light). One Astro 7 site, plain CSS, strict TypeScript, on Vercel. Every page is static except the likes API. `README.md` is the human guide; this file covers what isn't obvious from the code.

## Commands

- Dev server: `astro dev --background` (manage with `astro dev stop` / `status` / `logs`). Restart it after changing `package.json` or `astro.config.mjs`, or Vite serves "504 Outdated Optimize Dep".
- `npm run dev` is `astro dev --ignore-lock` on purpose: Astro auto-backgrounds the server when it thinks an AI agent ran it, and VS Code's terminal can trip that detection (`TERM_PROGRAM=vscode` + `GIT_PAGER=cat`), so `npm run dev` would return straight away. `--ignore-lock` keeps a normal foreground server (Ctrl+C stops it) that `astro dev stop` / `status` don't track. `npm run og` and `npm run screenshots` rely on it staying in the foreground.
- `npm run build` (type-check + build), `npm run lint`, `npm run format`.
- There is no `npm run preview`; the Vercel adapter doesn't support it.
- Check changes in a real browser with Playwright screenshots, not just the build.

## Content

- One folder per entry in `src/content/`; the folder name is the slug. `projects/` is Selected work (`/work/<slug>`), `experiments/` is the lab (`/lab/<slug>`). Schema: `src/content.config.ts`.
- Every entry needs `index.md` and `screenshot.png` (from `npm run screenshots`: projects in dark mode, lab entries in light), with `screenshotAlt` describing it. A case study or lab note without them fails the build. An experiment with `sketch.ts` or `sketch.astro` gets a live stage page; without one it's a note that links out.
- Every lab entry has the same header: Made / Type / Stack / Links under the lede. Links is Live ↗ (or npm ↗), Code ↗, then v1 ↗ when the entry has a `v1` URL. An experiment's Code ↗ points at its folder in this repo (or its own `repo`).
- Experiment stages: `stage: frame` (default, 16:9, square on phones, with Fullscreen) for canvas, p5, Three.js and CSS art; `stage: fit` (grows to its content, no Fullscreen) for studies, types `CSS study` / `JS study`, built from `templates/experiment-study/` with the shared parts in `src/styles/demo.css`.
- `themes: true` adds Day / Night under the stage. Night puts `.night` on the stage, which gives it the portfolio's tokens (`tokens.css`); the rest of the page stays light. Sketches read colours with `colours(stage)` and return `recolor()` (`src/lib/sketch.ts`); CSS art and studies follow on their own.
- `headsUp` is the "Before you start" box, for something the reader must know before using the page. Keep it rare; history like "first made on CodePen" goes in a Revisited section instead.
- `draft: true` hides an entry everywhere. `example: true` marks a placeholder.
- Scaffold with `npm run new` (copies from `templates/`). Follow the skills in `.claude/skills/` for new projects and experiments.
- App reviews live in `reviews/` (`/reviews/<slug>`): `npm run new -- --kind review` makes one from `templates/review/` as a draft, which shows on the dev server only. Web apps get `screenshot.png` and `logo.png` from `npm run screenshots -- reviews/<slug>`; phone and iPad apps (`device: phone | tablet`) use screenshots from the device. `npm run scorecard -- <slug>` makes `scorecard.png` for the post on X, and `npm run og` makes the same card as the review's link preview once it's published. Both render `src/pages/dev/scorecard/`. Apps given feedback privately (no review) are a short list in `src/lib/private-feedback.ts`, with optional logos in `src/assets/private-feedback/`.
- After adding an entry or changing a title, blurb or screenshot, run `npm run og` and commit the images in `public/og/`. Vercel can't generate them.

## Gotchas

- Markdown runs through Sätteri, not remark/rehype: add plugins to `satteri({ hastPlugins })` in `astro.config.mjs`, not `markdown.rehypePlugins`.
- View transitions are on, so page scripts run once. Put per-page setup in `onPage()` from `src/scripts/page.ts` and return a cleanup function. Navigate with `navigate()` from `astro:transitions/client`.
- p5 and three aren't installed by default. Install one when an experiment needs it, then restart the dev server.
- The Upstash database is live. Clean up any test likes you create.
- Never print the values in `.env`.
- The email sign-ups (`UpdatesSignup.astro`) post to Buttondown's embed-subscribe endpoint for `CONTACT.buttondown`, with `mode: 'no-cors'`, so the page can't read the reply; it assumes success unless the request itself fails. Each form's `tag` keeps the home page (`updates`) and reviews (`reviews`) lists apart.

## Conventions

- Entry notes: first person, plain and specific. Don't invent facts; leave `[bracketed notes]` for Aniqa to fill in.
- Keep: plain CSS with tokens in `src/styles/tokens.css` (no Tailwind), the lab at `/lab` (`lab.aniqa.dev` redirects there), no hover preview on touch screens, and reduced motion turning animations off.
- Astro docs: https://docs.astro.build
