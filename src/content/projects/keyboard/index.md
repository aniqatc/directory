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

## What it does

1. A Mac-style layout that responds to clicks, taps and your real keyboard, with a shortcut for every theme and light show.
2. A Markdown editor with Write, Split and Preview views.
3. fn turns on Markdown shortcuts, so a labelled key adds a heading, bold, a link, a list or code.
4. Word, character and keystroke counts, autosave and an optional click sound.

## Hardest part

Making a keyboard of 60+ keys accessible: one Tab stop with arrow-key navigation, a screen reader name for every key, and AA contrast in all eight themes.

## What I learned

1. Keys from data: one layout definition drives the markup, labels and shortcuts, matched to presses with KeyboardEvent.code.
2. Themes as CSS custom properties, applied before the first paint so there’s no flash of the wrong theme. New themes spread out from the key you pressed with the View Transitions API.
3. On-screen typing through insertText, so undo still works.
4. Light shows that only animate opacity and transform, so they stay smooth on phones.
5. Web Audio for the click sound, so fast typing doesn’t cut it off.

## Revisited

1. Nov 2023: untangled the nested animation timeouts into helper functions.
2. Oct 2026: redesigned, split into modules, added two light shows and an accessibility pass.
