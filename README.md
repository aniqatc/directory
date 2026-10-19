# aniqa.dev

My portfolio (`aniqa.dev`) and lab (`aniqa.dev/lab`). Astro, plain CSS, hosted on Vercel.

```bash
npm install
npm run dev        # http://localhost:4321
```

## Where things live

Every entry is a folder in `src/content/`:

```
src/content/
├── projects/<name>/       portfolio
│   ├── index.md           details and write-up
│   └── preview.astro      its little animated drawing
└── experiments/<name>/    lab
    ├── index.md
    ├── preview.astro
    └── sketch.ts          only if it runs on the site (or sketch.astro for CSS art)
```

The drawing shows on cards and in the lab's hover preview. If an experiment has a sketch, its page shows the sketch instead.

## Add something

Run `npm run new` and answer the questions. It creates the folder with everything filled in from [`templates/`](templates).

**Project (portfolio):** choose **project**, then write the blurb, summary and notes in `index.md`.

**Experiment that links to its own site:** choose **experiment** → **none**, then write `index.md`.

**Experiment that runs on the site:** choose **experiment** → **canvas**, **p5**, **three** or **css**. You get a starter sketch that already works. For p5 or Three.js, install it when asked, then restart `npm run dev`.

Then replace the placeholder drawing in `preview.astro` and check the page in the browser.

**Not ready?** Add `draft: true` to `index.md` to hide it.

## Drawings and sketches

- **Drawing (`preview.astro`):** HTML and CSS on a 200 × 140 board. Use the colours `--pf`, `--pm`, `--pl` and `--hi` (the mint accent). See them all at `localhost:4321/dev/drawings`.
- **Sketch (`sketch.ts`):** export `start(stage)`, draw into `stage`, and return `stop`. Also return `pause`, `resume` and `restart` for those buttons. The starters in `templates/` show how.
- **CSS art (`sketch.astro`):** just HTML and a `<style>` block.

## With Claude Code

- `/new-project <repo>`: writes the case study from the repo's README and draws it.
- `/new-experiment <repo or idea>`: writes the lab note, or builds the sketch with you, and draws it.
- `/new-drawing <name>`: redoes one drawing.

## Scripts

| Command          | What it does                   |
| ---------------- | ------------------------------ |
| `npm run dev`    | Local site at `localhost:4321` |
| `npm run new`    | Add a project or experiment    |
| `npm run build`  | Check and build                |
| `npm test`       | Smoke tests                    |
| `npm run format` | Tidy the code                  |

## Also editable

- `src/lib/now.ts`: "Currently tinkering with", "Now building" and "On the bench".
- `src/lib/contact.ts`: contact links.

More detail for working on the code is in [`AGENTS.md`](AGENTS.md).
