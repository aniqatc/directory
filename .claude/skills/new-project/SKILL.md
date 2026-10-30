---
name: new-project
description: Add a portfolio project (Selected work) to aniqa.dev, with npm run new, a case study drafted from the repo's README in Aniqa's voice, and its screenshot. Use when the user wants to add, write up or feature a project on the portfolio, or runs /new-project <repo or title>. For the lab, use new-experiment.
---

# New project (portfolio)

A project is a folder, `src/content/projects/<slug>/`, holding:

- `index.md`: frontmatter for the facts, `##` sections for the case study.
- `screenshot.png`: the live site in dark mode, shown on the case study, the portfolio hover preview and its share card, with `screenshotAlt` describing it.

`npm run new` copies `templates/project/` there and fills in the frontmatter. This skill gathers the facts, runs it, writes the case study and takes the screenshot. Lab entries go through the **new-experiment** skill instead.

## 1. Gather the facts

The user gives a repo name, a title or a link. From GitHub (the `gh` CLI is logged in as aniqatc):

```bash
gh api repos/aniqatc/<repo> --jq '{description, homepage, created_at, language}'
gh api repos/aniqatc/<repo>/readme --jq .content | base64 -d
gh api repos/aniqatc/<repo>/languages
gh api repos/aniqatc/<repo>/commits --jq '.[].commit.message' | head -40
```

From these, work out:

- **title**
- **type:** a label such as Web app, Dashboard, Full stack, CLI tool or Interactive.
- **stack:** 3–7 tools, " / " between them, most important first.
- **released:** the month it first went live. `created_at` is a fair default; ask if the README says otherwise.
- **updated:** the newest changelog month, if it was revisited.
- **live:** host only, from `homepage`.
- **repo**

## 2. Scaffold

```bash
npm run new -- --yes --kind project --title "Weather" --type Dashboard --stack "JS / Bootstrap / OpenWeather" \
  --released 2022-11 --updated 2026-10 --live weather.aniqa.dev --repo weather --blurb "…" --summary "…"
```

- **`order`:** set automatically, to the end of Selected work. Change it in `index.md` if the user wants it higher.
- **Not ready yet:** add `--draft` to keep it off the portfolio and the lab. `npm run screenshots` skips drafts.

## 3. Write the case study

Replace the template text in `index.md`. Match the voice of the existing entries: read `projects/playground/index.md` and `projects/weather/index.md` first.

- **Voice:** first person, plain and specific. Short sentences. British spelling: practise (verb), colour, neighbourhood, recognise.
- **blurb:** one line, about 15 words, for the card.
- **summary:** two sentences on what it is and what you can do with it. No hype.
- **Why:** the real reason, often what skill it was for. One short paragraph.
- **What I learned:** 3–5 numbered items. Each names a technique, then what it let the project do: "Sharded search data: the 42 MB city list split into 520 files, so the browser only downloads the one for what you're typing."
- **Hardest part** (optional): one problem and how it was solved.
- **Revisited** (optional): dated items, "Oct 2026: what changed.", from the changelog or commits.
- **What it does:** 3–4 one-line key features from the README's feature list, covering what the summary doesn't. Skip it when the project has its own parts section (Playground's widgets).
- **Extra sections:** if the project is made of parts the README lists (Playground's eight widgets), add a `## The widgets`-style section after Why: a numbered list of `**Name**: what it does.` Any `##` heading becomes a section.

**Don't invent facts.** If the README doesn't say, write a `[bracketed note for Aniqa]` and list those gaps in your reply. Delete optional sections with nothing real to say.

## 4. Take the screenshot

Run `npm run screenshots -- <slug>`. It shoots the live site at 1440 × 900 in dark mode. Look at `screenshot.png`: if the site has its own theme toggle, a banner or a loading state in the shot, or should fall back to an image in its repo, add an override for it in `OVERRIDES` in `scripts/screenshots.mjs` and run it again. Then write `screenshotAlt` in `index.md`: what's on screen, one sentence. A missing screenshot or alt text fails the build.

## 5. Check

1. Run `npm run og` to make the entry's link-preview card (it uses the screenshot), then `npm run build`. The schema catches bad dates and missing fields, and a missing screenshot fails with the folder named.
2. With the dev server running, screenshot `/` (the row and its hover preview) and `/work/<slug>` with Playwright.
3. Tell the user what you filled in, what's still a placeholder, and where. If it was on "Now building" in `src/lib/now.ts`, remove it from `BUILDING`. Don't commit unless they ask; when they do, use no Claude co-author line.
