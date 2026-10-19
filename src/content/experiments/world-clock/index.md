---
title: World Clock
type: Dashboard
stack: JS / Moment Timezone / SVG
released: 2023-10
live: clock.aniqa.dev
repo: world-clock
updated: 2026-10
summary: An analog and digital clock for 500+ time zones. Pin cities, slide time forward or back, and see who’s awake.
---

## Why I built it

A small, contained question: what does the time look like everywhere at once?

## What I learned

1. One clock loop: a single interval updates every clock from the same moment. The first version started a new interval on every shuffle and never cleared them.
2. A Shift Time slider that moves every clock and marker together.
3. A Fisher–Yates shuffle, so a city can’t appear twice.
4. My own abbreviation map, so time zones are spelled out.
5. Screen reader states: tiles use aria-pressed for the selected city, and the slider reads “+3h” instead of “180”.

## Revisited

1. Nov 2023: added the app manifest and icons.
2. Oct 2026: redesigned around pinned cities, a Shift Time slider and day/night strips.
