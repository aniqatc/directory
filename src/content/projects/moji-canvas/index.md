---
title: Moji Canvas
type: Web app
stack: React / Framer Motion / Supabase
released: 2025-01
live: moji.aniqa.dev
repo: moji-canvas
order: 2
updated: 2026-10
blurb: Arrange, animate and share sticker collages made from 4,000+ emoji illustrations.
screenshotAlt: 'Moji Canvas: a pink dotted canvas with the “moji canvas” title surrounded by emoji, and a toolbar on the left for mode, theme, colours, motion, saving and sharing.'
summary: An emoji sticker canvas where you arrange, animate and share collages made from over 4,000 OpenMoji illustrations.
---

## Why

A bigger React project. A canvas full of draggable stickers is a lot of state to look after.

## What it does

1. Drop random stickers from 10 themes or search for one, then drag them anywhere.
2. Edit each sticker’s size, tilt, animation and speed in a panel you can drag aside or collapse.
3. 10 animations with canvas-wide play, pause, shuffle and speed.
4. Save to your browser, download a PNG, or share a link anyone can keep editing. It works offline too.

## Hardest part

Keeping it smooth with lots of stickers: animations pause above 40 and the canvas caps at 150.

## What I learned

1. Moving state out of props into two contexts, to learn Context properly.
2. Custom hooks for keys, local storage, animation and sticker data.
3. CSS keyframe animations with one speed variable, keeping dozens of loops off the JavaScript thread.
4. Upgrading saved data, so old share links keep working.
5. Editing without a mouse: Enter adds a sticker, arrows nudge it, Delete removes it, and modals trap and return focus.

## Revisited

1. Oct 2026: per-sticker editing, a searchable sticker picker, a movable editing panel and animations rewritten as CSS keyframes.
