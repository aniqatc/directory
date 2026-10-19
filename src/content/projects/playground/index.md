---
title: Playground
type: Full stack
stack: Sass / Tailwind / JS / Webpack / Node / Express / MongoDB
released: 2023-12
live: playground.aniqa.dev
repo: playground
order: 1
updated: 2026-10
blurb: Eight full-stack widgets in one app, from a graphing calculator to a community bookmark board.
summary: Eight independent widgets, from a graphing calculator to a community bookmark board, each built to practise a different part of full-stack development.
---

## Why

I wanted fully working widgets, each with the features of a full-sized project, all in one site: a one-stop shop of beginner to intermediate full-stack builds. Fitting eight of them together made me think hard about architecture and how to structure the whole project.

## The widgets

1. **About**: what the playground is for, the stack and my GitHub activity grid.
2. **Calculator**: evaluates expressions, graphs functions and saves the result as a PNG.
3. **Digital footprint**: what a site can learn about you from your IP and browser, on a map.
4. **Task manager**: tasks with priorities, due dates, tags and archive.
5. **Financial markets**: currency rates and stocks with 7-day charts.
6. **Lottery history**: search 20+ years of Powerball and Mega Millions draws for your numbers.
7. **Repo card**: any GitHub repo as a card with its stats, saved as an image.
8. **Community bookmarks**: submit a link; it gets a title, description and topic tags, and people vote on it.

## Hardest part

Making user-submitted links safe. Each one is scraped with Cheerio, checked against Google Safe Browsing, tagged with natural and run through leo-profanity, with a clear message for every way it can fail.

## What I learned

1. Scheduled data instead of live calls. Free API tiers allow too few requests for every visitor, so node-cron refreshes stocks and currencies each weekday and lottery results monthly into MongoDB.
2. Accounts without sign-up: a random ID in localStorage ties tasks and likes to each visitor.
3. Likes cached in sessionStorage and capped at five per visitor, to cut repeat requests.
4. One folder per widget (markup, script, styles and a core module per job), loaded with Webpack’s require.context.
5. Announcing changes to screen readers: aria-pressed for toggles and likes, live regions for calculator and lottery results, and aria-invalid on form errors.

## Revisited

1. Sep–Dec 2024: added the task manager, financial markets, lottery, repo card and bookmarks widgets.
2. Feb 2025: example .env files and better loading states.
3. Oct 2026: redesigned with shared design tokens, one card shell and a 12-column grid. Every widget works the same as before.
