---
name: new-drawing
description: Design and build the animated CSS preview drawing for an aniqa.dev entry (its preview.astro, shown on portfolio cards, the lab hover preview and detail pages), or replace the placeholder made by `npm run new`. Use when the user asks for a new or better preview, drawing or thumbnail, or runs /new-drawing <slug>. The new-project and new-experiment skills follow this one for their drawing step.
---

# New preview drawing

Every entry has a drawing: a tiny animated illustration in plain HTML and CSS (no images, no canvas), drawn on a **200 × 140 px board** and scaled to fit wherever it appears. This skill makes one that looks like it belongs with the others.

## Where it shows

| Entry                     | Drawing shows on                                   |
| ------------------------- | -------------------------------------------------- |
| Project                   | Portfolio card, case study page                    |
| Experiment that links out | Lab hover preview, lab note page                   |
| Experiment with a sketch  | Lab hover preview only (its page shows the sketch) |

## Where it goes

`src/content/<projects|experiments>/<slug>/preview.astro`, next to the entry's `index.md`. One file: markup, then a `<style>` block scoped to this drawing, so plain selectors like `.face` can't leak into other drawings. Nothing to register. The site finds it by folder.

If `npm run new` made a placeholder (a dot, the title and two grey lines with `todo-*` classes), replace the whole file.

## Before drawing

Find the entry's one recognisable idea: open its live site or README (`gh api repos/aniqatc/<repo>/readme --jq .content | base64 -d`) and read its `index.md`. The best drawings show **what you do in the project**, not its logo:

- `projects/weather`: sun, a drifting cloud, a temperature, a week of bars.
- `experiments/world-clock`: an analog face with a spinning hand beside a digital time.
- `projects/keyboard`: three rows of keys, some pressing in turn.
- `experiments/hogwarts`: four house banners lighting up while it says SORTING….
- `projects/rflect-cli`: a terminal typing `rflect write`.

For an experiment with a sketch, draw a still, simplified take on the sketch (see `experiments/drift/preview.astro`).

Read 2–3 existing `preview.astro` files first so the new one matches in density and style.

## Rules

1. **Board:** everything sits inside 200 × 140. Position with `left` / `top` / `right` / `bottom` in px. `i`, `b` and `span` are already `position: absolute; display: block` on the board; use `position: static` for flex children.
2. **Palette:** use the board variables, not new colours:
   - `--pf` foreground (light text, main shapes)
   - `--pm` muted (secondary shapes, small text)
   - `--pl` line (outlines, placeholder bars)
   - `--ps` surface (board background)
   - `--hi` the mint accent. Use it on **one** element so the eye lands there.

   Only add a literal colour when the subject needs it (Valorant red, Hogwarts house colours).

3. **Background:** the default is `--ps`. For a custom one, make `<i class="pv-bg"></i>` the first element and give `.pv-bg` its `background` in the style block. On wide portfolio cards it stretches to the box edges automatically (see `projects/weather/preview.astro`).
4. **Shapes:** 3–10 elements. Simple geometry: rounded rectangles, circles, lines, a short mono label at most (the board font is mono; use `var(--font-display)` for a big number like `72°`). No emoji unless the project is about emoji (Moji Canvas).
5. **Motion:** one or two gentle loops that act out the project. Animate only `transform` and `opacity` (`background` is fine for small blinking squares). Reuse the shared keyframes in `src/styles/drawings.css` (`pulse`, `spin`, `wob`, `drift`, `blink`, `flick`, `bob`, `grow`, `draw`, `flow`, `press`, `mark`, `walk`) before adding your own in the style block. Don't set `animation-play-state`: drawings are paused by default and play only in the hover preview, on detail pages and on the portfolio card in view. Reduced motion is handled globally.
6. **Legible small:** the lab tile is 146 × 102 and the hover preview 220 × 154. Check that the idea still reads at that size.
7. **Computed shapes:** loops and maths in the frontmatter are fine (see `projects/playground/preview.astro`, `experiments/nyc-travel/preview.astro`). Round with `toFixed` so the HTML stays tidy.

## Check it

1. With the dev server running (`astro dev --background`), open `http://localhost:4321/dev/drawings?only=<slug>`. It shows the tile, the portfolio card and the detail-page sizes, all animating.
2. Screenshot those sizes with Playwright (it's installed) and look: nothing clipped at the board edge, the accent used once, readable at tile size, and the background matching on the wide card.
3. Compare side by side with two other drawings in `/dev/drawings` for weight and density.
4. Run `npm run build`. An entry with no `preview.astro` fails the build with a message naming the folder.

Show the user the screenshots and ask before reworking the concept. Don't commit unless they ask.
