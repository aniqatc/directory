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

I wanted to learn the backend properly. Widgets let me take on one new skill at a time (third-party APIs, MongoDB models, scraping, image export, text processing) without starting a whole new project.

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

Making user-submitted links safe. Each one is scraped for metadata, checked against Google Safe Browsing and run through a profanity filter, with a clear message for every way it can fail.

## What I learned

1. Scheduled data instead of live calls. Free API tiers allow too few requests for every visitor, so node-cron refreshes stocks and currencies each weekday and lottery results monthly into MongoDB.
2. Accounts without sign-up: a random ID in localStorage ties tasks and likes to each visitor.
3. Processing user submissions: bookmarks are scraped with Cheerio, checked with Google Safe Browsing, tagged with natural and filtered with leo-profanity before saving.
4. Likes cached in sessionStorage and capped at five per visitor, to cut repeat requests.
5. One folder per widget (markup, script, styles and a core module per job), loaded with Webpack’s require.context.

## Revisited

1. Sep–Dec 2024: added the task manager, financial markets, lottery, repo card and bookmarks widgets.
2. Feb 2025: example .env files and better loading states.
3. Oct 2026: redesigned with shared design tokens, one card shell and a 12-column grid. Every widget works the same as before.

## If I built it again

[Two or three sentences on what you would change now]
