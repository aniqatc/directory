# aniqa.dev

My portfolio (`aniqa.dev`, dark) and lab (`aniqa.dev/lab`, light): one Astro site, plain CSS, hosted on Vercel.

## How content works

Everything lives in `src/content/`, one folder per entry:

```
src/content/
├── projects/                  → portfolio (Selected work), /work/<slug>
│   └── weather/
│       ├── index.md           # facts (frontmatter) + case study (## sections)
│       └── preview.astro      # its drawing
└── experiments/               → lab, /lab/<slug>
    ├── world-clock/           # links out to its own site
    │   ├── index.md
    │   └── preview.astro
    └── drift/                 # runs on the page
        ├── index.md
        ├── preview.astro
        └── sketch.ts          # or sketch.astro for CSS art
```

**Every entry has a drawing** (`preview.astro`): a small animated CSS picture. A page shows the real thing when there is one, otherwise the drawing:

| Entry                     | Drawing shows on            | Its page shows                                |
| ------------------------- | --------------------------- | --------------------------------------------- |
| Project                   | Portfolio card, case study  | The drawing                                   |
| Experiment that links out | Lab hover preview, lab note | The drawing, plus Live / Code links           |
| Experiment with a sketch  | Lab hover preview           | The sketch, with Pause / Restart / Fullscreen |

**Drafts:** add `draft: true` to an entry's `index.md` to keep it off the portfolio and the lab (in dev too). Its drawing still shows in `/dev/drawings`, so you can work on it.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command           | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `npm run dev`     | Local dev server at `localhost:4321`                                 |
| `npm run new`     | Add a project or experiment: asks a few questions, creates the files |
| `npm run build`   | Type-check, then build to `dist/`                                    |
| `npm run preview` | Serve the built site locally                                         |
| `npm run check`   | Type-check only                                                      |
| `npm run format`  | Format everything with Prettier                                      |
| `npm run lint`    | ESLint                                                               |
| `npm test`        | Playwright smoke tests                                               |

## Add an entry

`npm run new` asks a few questions and copies the matching folder from [`templates/`](templates) into `src/content/`. Every entry gets `index.md` and a placeholder `preview.astro`; sketch experiments also get a starter sketch that already runs. Flags skip the questions, e.g. `npm run new -- --kind experiment --sketch p5 --title "Garden" --yes`.

### Project (portfolio)

1. `npm run new`, choose **project**. It goes to the end of Selected work (`order` sets the position).
2. In `index.md`: fill in `blurb` (one line for the card) and `summary`, then write Why, What I learned, and optionally Hardest part, Revisited, If I built it again. Any `##` heading becomes a section.
3. Replace the placeholder drawing in `preview.astro` (see [Drawings](#drawings)).
4. Check `/` and `/work/<slug>`.

### Experiment that links out (lab)

For something that lives on its own site, like World Clock.

1. `npm run new`, choose **experiment**, then **none** for the sketch.
2. In `index.md`: fill in `summary`, `live` and `repo`, then Why I built it, What I learned, and optionally Revisited.
3. Replace the placeholder drawing in `preview.astro`.
4. Check `/lab` (hover the row) and `/lab/<slug>`.

### Experiment that runs on the site (lab)

For a sketch shown on the page itself, like Drift.

1. `npm run new`, choose **experiment**, then **canvas**, **p5**, **three** or **css**. For p5 or Three.js, install the library when it says so (`npm i p5 && npm i -D @types/p5`), then restart `npm run dev`.
2. Build the sketch in `sketch.ts` or `sketch.astro` (see [Sketches](#sketches)).
3. In `index.md`: set `hint` (shown under the stage) and `time`, then write Idea and Notes.
4. Replace the placeholder drawing in `preview.astro`. It's what people see when they hover the row in the lab.
5. Check `/lab/<slug>`.

## Sketches

The starter in `templates/experiment-<tool>/` already runs; change it into your own.

- **`sketch.ts` (canvas, p5.js, Three.js):** export `start(stage)`. It draws into the stage, sizes to `stage.clientWidth` / `clientHeight`, handles resizes, and returns `stop`. Return `pause`, `resume` and `restart` too, and those buttons appear. The contract is in [`src/lib/sketch.ts`](src/lib/sketch.ts), and [`drift/sketch.ts`](src/content/experiments/drift/sketch.ts) is a complete example.
- **`sketch.astro` (CSS art):** HTML and a `<style>` block, rendered into the stage.
- **Colours:** use `var(--accent)`, `var(--fg)` and `var(--bg)` (or read them with `getComputedStyle`) to follow the lab colours.
- **Bundling:** each sketch is bundled on its own, so p5 or three only load on the page that uses them. Extra files (shaders, helpers) can sit in the same folder.

## Drawings

`preview.astro` is a tiny animated picture on a 200 × 140 board: markup, then a `<style>` block that only applies to that drawing.

- **Colours:** use the board colours `--pf` (foreground), `--pm` (muted), `--pl` (lines) and `--hi` (the mint accent, on one element).
- **Background:** for your own, start with `<i class="pv-bg"></i>` and give `.pv-bg` a `background`.
- **Animations:** shared ones like `pulse`, `spin` and `wob` live in `src/styles/drawings.css`. Drawings only animate while on show.
- **See them all:** `localhost:4321/dev/drawings` shows every drawing at every size (add `?only=<slug>` for one). Dev only.

## With Claude Code

| Command                       | What it does                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `/new-project <repo>`         | Runs `npm run new`, drafts the case study from the repo's README in my voice, and designs the drawing                           |
| `/new-experiment <repo/idea>` | Links out: drafts the lab note and designs the drawing. Runs on the page: scaffolds the sketch, builds it with me, and draws it |
| `/new-drawing <slug>`         | Designs or redoes one entry's drawing and checks it at every size                                                               |

The skills live in [`.claude/skills/`](.claude/skills).

## Also editable

- `src/lib/now.ts`: "Currently tinkering with", "Now building" (portfolio) and "On the bench" (lab).
- `src/lib/contact.ts`: contact links in the intro and footer.
