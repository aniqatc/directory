---
title: Keyboard
type: Interactive
stack: HTML / CSS / JS / Marked
released: 2023-01
live: keyboard.aniqa.dev
repo: keyboard
order: 3
updated: 2026-10
blurb: A themed virtual keyboard with light shows, paired with a live Markdown editor.
summary: A virtual keyboard with eight themes and four light shows, paired with a Markdown editor that previews as you type.
---

## Why

I wanted to practise interaction states with something that reacts to clicks, taps and a real keyboard. The editor gives the keystrokes somewhere useful to go.

## Hardest part

Making a keyboard of 60+ keys accessible: one Tab stop with arrow-key navigation, a screen reader name for every key, and AA contrast in all eight themes.

## What I learned

1. Keys from data: one layout definition drives the markup, labels and shortcuts, matched to presses with KeyboardEvent.code.
2. Themes as CSS custom properties, applied before the first paint so there’s no flash of the wrong theme.
3. On-screen typing through insertText, so undo still works.
4. Light shows that only animate opacity and transform, so they stay smooth on phones.

## Revisited

1. Nov 2023: untangled the nested animation timeouts into helper functions.
2. Oct 2026: redesigned, split into modules, added two light shows and an accessibility pass.

## If I built it again

[Two or three sentences on what you would change now]
