---
name: new-experiment
description: Add an experiment to the aniqa.dev lab, either one that links out to its own site (a lab note) or one that runs on the page (a canvas, p5.js, Three.js or CSS art sketch, or a CSS / JS study with controls), with npm run new, its notes and its preview drawing. Use when the user wants to add something to the lab, start a sketch or experiment, or runs /new-experiment <repo, title or idea>.
---

# New experiment (lab)

An experiment is a folder, `src/content/experiments/<slug>/`. There are two kinds:

| Kind                             | Files                                                      | Its page shows                                | Drawing shows on                   |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------------- | ---------------------------------- |
| **Links out** (like World Clock) | `index.md`, `preview.astro`                                | Lab note with Live / Code links               | Lab hover preview and the lab note |
| **Runs on the page**             | `index.md`, `preview.astro`, `sketch.ts` or `sketch.astro` | The sketch, with Pause / Restart / Fullscreen | Lab hover preview only             |
| **A study** (runs on the page)   | `index.md`, `preview.astro`, `sketch.astro`                | The study in a stage that grows to fit it     | Lab hover preview only             |

Every lab entry has the same header (Made / Type / Stack under the lede). Optional fields: `themes: true` (a Day / Night switch in the top-right corner of the stage) and `headsUp` (a "Before you start" box, rare).

Every experiment gets a drawing. `npm run new` copies the matching `templates/experiment*/` folder.

## 1. Which kind?

Ask unless it's clear:

- **Something that lives on its own site or repo:** links out. Go to section 2.
- **Something to build and show here:** runs on the page. Ask which tool, then go to section 3.
  - `canvas`: plain canvas, no libraries.
  - `p5`: p5.js.
  - `three`: Three.js.
  - `css`: CSS art.
  - `study`: one idea with controls (type `CSS study` or `JS study`). Its stage grows to fit it (`stage: fit`) and has no Fullscreen. Build it from the shared parts in `src/styles/demo.css`; `experiments/word-cycle` shows one.

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
   - **`sketch.ts`:** exports `start(stage)` (contract in `src/lib/sketch.ts`). It draws into `stage`, sizes to `stage.clientWidth` / `clientHeight`, handles resizes with a ResizeObserver, and returns `stop`. Return `pause`, `resume` and `restart` too, and those buttons appear. The starter in `templates/experiment-<tool>/sketch.ts` is a working example.
   - **`sketch.astro`:** plain HTML and a `<style>` block, rendered into the stage. A study's script goes in a `<script>` using `onPage()`, and looks for its own `[data-study="<slug>"]` first so it does nothing on other pages.
   - **Colours:** read them from the stage with `colours(stage)` (`src/lib/sketch.ts`), not from the page, so the sketch follows the lab theme and Night. With `themes: true`, return `recolor()` to read them again and redraw. CSS art and studies use `var(--bg)`, `var(--fg)`, `var(--accent)` and follow on their own.
   - **Extra files:** shaders and helpers can sit in the same folder.
3. **Fill in `index.md`:** `hint` (one line shown under the stage, like "Move to stir · click to scatter"), `summary`, Idea and Notes (numbered, N.1, N.2…). If it started somewhere else (a CodePen), add a Revisited section with R.1 linking the first version as "v1". Write in Aniqa's voice. Leave bracketed placeholders for anything only she knows.

## 4. Make the drawing

Follow the **new-drawing** skill (`.Codex/skills/new-drawing/SKILL.md`) to replace the placeholder `preview.astro`. For a sketch, draw a still, simplified take on it, since the drawing is what people see when they hover over it in the lab.

## 5. Check

1. Run `npm run og` to make the entry's link-preview card (it needs the finished drawing), then `npm run build`.
2. With the dev server running, open `/lab/<slug>` and screenshot it with Playwright.
   - **For a sketch:** check that it draws, that Pause / Play and Restart work, that Fullscreen opens and Esc closes it, and that it starts paused on a still frame with reduced motion (Playwright `reducedMotion: 'reduce'`).
   - **For a study:** check that the stage fits it at desktop and phone widths, that every control works by keyboard, and with `themes: true` that it reads well on Night.
3. On `/lab`, hover the new row and check the drawing appears.
4. If it was on "On the bench" in `src/lib/now.ts`, remove it from `BENCH`.
5. **Not ready yet:** add `draft: true` to `index.md` to keep it off the portfolio and the lab. Its drawing still shows in `/dev/drawings`.

Tell the user what you built, what's still a placeholder, and where. Don't commit unless they ask; when they do, use no Codex co-author line.
