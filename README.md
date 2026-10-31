# aniqa.dev

My portfolio at aniqa.dev, with a lab of smaller experiments at aniqa.dev/lab. Built with Astro, hosted on Vercel. _Built with agent assistance from Claude._

**[Live site](https://aniqa.dev)** · **[Lab](https://aniqa.dev/lab)**

| Portfolio (dark)                                                                                      | Lab (light)                                                                              |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| ![Portfolio title card: "Aniqa." with a mint full stop on a dark background](public/og-portfolio.png) | ![Lab title card: "Lab." with a teal full stop on a light background](public/og-lab.png) |

## Tech

- **Astro 7** and **TypeScript** (strict), with plain CSS and theme tokens
- **Upstash Redis** for likes, on **Vercel**
- **Fontsource** for self-hosted Bricolage Grotesque and Geist
- **p5.js** and **Three.js** for experiments that need them
- **Playwright** for the screenshots and share cards

## Features

- **Portfolio** (dark): selected projects with screenshot previews and case studies, and an intro with what I'm building now.
- **Lab** (light): an archive of experiments with hover previews, a random-entry button, and likes (five per visitor).
- **App reviews**: apps from solo founders at `/reviews`, each with scores, screenshots in a browser, phone or iPad frame, and a scorecard to post on X.
- **Everywhere**: a share card for each entry, a pet that follows you between pages and leaves a trail (a ghost, a bee, a snowball… one of twenty, changing through the year), and a 404 with a sleeping dot.

## Design

Dark for the portfolio, light for the lab, with a cross-fade between them. One accent: mint on dark, a deeper teal on light. Every preview is a screenshot of the real thing: projects in dark mode, lab entries in light.

## Accessibility

- Every link and button is reachable by keyboard and shows a focus ring.
- Reduced motion stops the animations and the pet.
- The current page is marked with `aria-current`, and icon-only controls have labels.

## Project structure

```text
src/
  content/      projects/, experiments/ and reviews/, one folder per entry
  components/   previews, lab rows, cards, the like button, the pet
  pages/        home, case studies, lab, reviews, 404, and api/likes.ts
  scripts/      likes, hover previews, pet, sketch runner
  lib/          content helpers, Redis client, GitHub stars, "now" lists
  styles/       theme tokens, portfolio and lab styles
templates/      starters for npm run new
```

## Key concepts

- **One folder per entry.** The folder puts it in the portfolio or the lab, and its frontmatter is checked at build time.
- **Static, plus one function.** Only `/api/likes` runs on the server; every page is built ahead of time.
- **Star counts at build time.** A daily rebuild keeps them current, so visitors never call GitHub.
- **Likes in Redis.** A total per entry and a count per visitor; the sixth like is refused. Visitors are anonymous browser IDs.
- **Screenshots** sit next to each entry as `screenshot.png`, made by `npm run screenshots` and served as WebP through `astro:assets`. The hover previews only load theirs on the first hover.
- **Page scripts** set up in `onPage()` and clean up before the next page loads, since pages swap in place.
- **The pet** is one behaviour (`src/scripts/pet.ts`) with swappable drawings in `src/lib/pets.ts`, and comes out of the logo dot or the full stop in the page title. Its trail is in `src/scripts/pet-trail.ts`. `PET` is `'auto'`, which follows the `SEASONS` calendar there (a pet a month, plus birthdays and holidays, first match wins); set it to a pet's name to pin one.

## Setup

Requires Node 22.22+. For `npm run screenshots`, `npm run og` and `npm run scorecard`, also run `npx playwright install chromium`.

```bash
git clone https://github.com/aniqatc/directory
cd directory
npm install
npm run dev    # http://localhost:4321
```

The site builds without any keys; likes and faster star counts need these:

| Variable                                             | For                                           | Where to get it                                                                                      |
| ---------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Likes                                         | Vercel → Storage → Upstash Redis, then `vercel env pull .env.local` (`KV_REST_API_*` names work too) |
| `GITHUB_TOKEN`                                       | Star counts (optional, avoids the rate limit) | A read-only GitHub token                                                                             |
| `VERCEL_DEPLOY_HOOK`                                 | Daily star refresh (Actions secret)           | Vercel → Settings → Git → Deploy Hooks                                                               |

### Add an entry

Run `npm run new` and answer the prompts. It creates a folder from [`templates/`](templates) with the frontmatter filled in.

- **Project (portfolio):** choose **project**, then write the blurb, summary and notes in `index.md`. It gets a case study at `/work/<slug>`; `order` sets its place in Selected work.
- **Lab entry that links out:** choose **experiment** → **none**, then write `index.md`.
- **Experiment that runs on the site:** choose **experiment**, then **canvas**, **p5**, **three** or **css**. Each starter already works; replace it with your own. For p5 or Three.js, install the library when asked and restart `npm run dev`.
- **Study (one idea with controls):** choose **experiment** → **study**. Its stage grows to fit it, and `src/styles/demo.css` has the buttons, sliders and lines that make it match the lab. `word-cycle` shows one.

Optional fields for experiments: `themes: true` adds a Day / Night switch in the top-right corner of the stage, and `headsUp: "…"` adds a "Before you start" box (for any lab entry; use it rarely).

Then, for any entry: run `npm run screenshots -- <slug>` and describe what's on screen in `screenshotAlt`, run `npm run og` for its share card, and check the page. If a site needs something before its shot (its own theme toggle, a hint to wait out, a repo image to fall back to), add it to `OVERRIDES` in [`scripts/screenshots.mjs`](scripts/screenshots.mjs). Set `draft: true` to hide it until it's ready.

With Claude Code, `/new-project` and `/new-experiment` do the writing and the screenshot for you.

### Add an app review

Run `npm run new` and choose **review**, or `npm run new -- --kind review --app "Tally Ho" --maker tallyhoapp --live tallyho.app`. It creates `src/content/reviews/<slug>/` from [`templates/review/`](templates/review) as a draft, which only shows on `npm run dev`.

- **Web app:** `npm run screenshots -- reviews/<slug>` takes `screenshot.png` and saves the site's icon as `logo.png`.
- **Phone or iPad app:** set `device: phone` or `tablet`, put the App Store link in `live`, and add screenshots from the device: `screenshot.png`, plus `screenshot-2.png` and `screenshot-3.png` for a phone.

Fill in the scores, verdict and sections, then run `npm run scorecard -- <slug>` for `scorecard.png`, the picture to post on X. When it's ready, delete `draft: true` and run `npm run og` so the review's link unfurls as its scorecard. Add `stillUsing: true` later if you keep using the app.

For feedback you send the maker privately instead, add the app to `PRIVATE_FEEDBACK` in [`src/lib/private-feedback.ts`](src/lib/private-feedback.ts) (its logo, if you have one, goes in `src/assets/private-feedback/`). It shows under "Feedback given privately" on `/reviews`, with no page of its own.

## Scripts

| Command                             | What it does                                |
| ----------------------------------- | ------------------------------------------- |
| `npm run dev`                       | Local site at `localhost:4321`              |
| `npm run build`                     | Type-check, then build                      |
| `npm run new`                       | Add a project, experiment or app review     |
| `npm run og`                        | Make share cards for every entry and review |
| `npm run scorecard`                 | Make each review's scorecard for X          |
| `npm run screenshots`               | Retake every entry's screenshot             |
| `npm run check` / `lint` / `format` | Type-check, lint, format                    |

## Changelog

### October 2026

- Rebuilt in Astro, replacing the React version (kept at the `react-v1` tag).
- Added the lab, likes in Upstash, and build-time star counts.
- Added the 404 page, the pet, page transitions and share cards.
- Gave the pet twenty looks and a calendar: a pet for each month, plus birthdays and holidays.
- Added app reviews, with a scorecard for each one to post on X.

### 2025

- Updated the React portfolio.

## License

Code is [MIT](LICENSE): reuse it freely, keeping the copyright notice. The writing, experiments and images are © Aniqa, all rights reserved.
