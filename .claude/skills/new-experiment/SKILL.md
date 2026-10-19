---
name: new-experiment
description: Add an experiment to the aniqa.dev lab, either one that links out to its own site (a lab note) or one that runs on the page (a canvas, p5.js, Three.js or CSS art sketch), with npm run new, its notes and its preview drawing. Use when the user wants to add something to the lab, start a sketch or experiment, or runs /new-experiment <repo, title or idea>.
---

# New experiment (lab)

An experiment is a folder, `src/content/experiments/<slug>/`. There are two kinds:

| Kind                              | Files                                                      | Its page shows                                | Drawing shows on                   |
| --------------------------------- | ---------------------------------------------------------- | --------------------------------------------- | ---------------------------------- |
| **Links out** (like World Clock)  | `index.md`, `preview.astro`                                | Lab note with Live / Code links               | Lab hover preview and the lab note |
| **Runs on the page** (like Drift) | `index.md`, `preview.astro`, `sketch.ts` or `sketch.astro` | The sketch, with Pause / Restart / Fullscreen | Lab hover preview only             |

Every experiment gets a drawing. `npm run new` copies the matching `templates/experiment*/` folder.

## 1. Which kind?

Ask unless it's clear:

- **Something that lives on its own site or repo:** links out. Go to section 2.
- **Something to build and show here:** runs on the page. Ask which tool, then go to section 3.
  - `canvas`: plain canvas, no libraries.
  - `p5`: p5.js.
  - `three`: Three.js.
  - `css`: CSS art.

## 2. Links out

Gather the facts from GitHub, as in the new-project skill (`gh api repos/aniqatc/<repo>`, its README and commits): title, type, stack, released, updated, live and repo.

```bash
npm run new -- --yes --kind experiment --sketch none --title "World Clock" --type Dashboard \
  --stack "JS / Moment Timezone / SVG" --released 2023-10 --updated 2026-10 --live clock.aniqa.dev \
  --repo world-clock --summary "…"
```

Then write `index.md` in Aniqa's voice (read `experiments/world-clock/index.md` first): Why I built it, What I learned (3–5 numbered, technique then what it did), and optionally Revisited. The voice rules and "don't invent facts" from the new-project skill apply.

Go to section 4.

## 3. Runs on the page

```bash
npm run new -- --yes --kind experiment --sketch p5 --title "Zayn's Garden" --summary "…"
```

This creates `index.md`, a placeholder `preview.astro`, and a starter sketch that already runs. The starter is `templates/experiment-<tool>/sketch.ts` for canvas, p5 and Three.js, or `sketch.astro` for CSS art.

1. **Install the library if needed** (the script says so): `npm i p5 && npm i -D @types/p5`, or `npm i three && npm i -D @types/three`. Then restart the dev server (`astro dev stop`, `astro dev --background`). Vite won't serve a newly installed package until it restarts.
2. **Build the sketch with the user.**
   - **`sketch.ts`:** exports `start(stage)` (contract in `src/lib/sketch.ts`). It draws into `stage`, sizes to `stage.clientWidth` / `clientHeight`, handles resizes with a ResizeObserver, and returns `stop`. Return `pause`, `resume` and `restart` too, and those buttons appear. `experiments/drift/sketch.ts` is the full example.
   - **`sketch.astro`:** plain HTML and a `<style>` block, rendered into the stage.
   - **Colours:** read `--bg`, `--fg` and `--accent` from the page (`getComputedStyle(document.documentElement)`) so the sketch follows the lab theme.
   - **Extra files:** shaders and helpers can sit in the same folder.
3. **Fill in `index.md`:** `hint` (one line shown under the stage, like "Move to stir · click to scatter"), `time`, `summary`, Idea and Notes (numbered, N.1, N.2…). Write in Aniqa's voice. Leave bracketed placeholders for anything only she knows.

## 4. Make the drawing

Follow the **new-drawing** skill (`.claude/skills/new-drawing/SKILL.md`) to replace the placeholder `preview.astro`. For a sketch, draw a still, simplified take on it (see `experiments/drift/preview.astro`), since the drawing is what people see when they hover over it in the lab.

## 5. Check

1. Run `npm run build`.
2. With the dev server running, open `/lab/<slug>` and screenshot it with Playwright.
   - **For a sketch:** check that it draws, that Pause / Play and Restart work, that Fullscreen opens and Esc closes it, and that it starts paused on a still frame with reduced motion (Playwright `reducedMotion: 'reduce'`).
3. On `/lab`, hover the new row and check the drawing appears.
4. If it was on "On the bench" in `src/lib/now.ts`, remove it from `BENCH`.
5. **Not ready yet:** add `draft: true` to `index.md` to keep it off the portfolio and the lab. Its drawing still shows in `/dev/drawings`.

Tell the user what you built, what's still a placeholder, and where. Don't commit unless they ask; when they do, use no Claude co-author line.
