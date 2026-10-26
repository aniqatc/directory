---
title: Define
type: Web app
stack: React / Tailwind / Framer Motion
released: 2025-01
live: define.aniqa.dev
repo: define
summary: A dictionary app with definitions, examples, pronunciation, related words and photos, in four themes and three typefaces.
---

## Why I built it

A SheCodes project, extended. The course provided the image API; the themes, fonts, related-word lookups and layout are my own.

## What I learned

1. The Context API for settings, so any card can read the theme and font.
2. Custom Tailwind variants (dark, ocean, forest), so each theme is styled right next to the default.
3. Framer Motion variants that stagger the cards, so a new word builds in instead of popping in.

## Revisited

1. Oct 2026: definitions stopped loading because the Free Dictionary API started refusing requests. The dictionary and image APIs now go through Vercel functions, and if the dictionary still fails, definitions come from Wiktionary instead.
