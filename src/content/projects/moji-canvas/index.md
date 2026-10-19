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
summary: An emoji sticker canvas where you arrange, animate and share collages made from over 4,000 OpenMoji illustrations.
---

## Why

A bigger React project. A canvas full of draggable stickers is a lot of state to look after.

## Hardest part

Keeping it smooth with lots of stickers: animations pause above 40, the canvas caps at 150, and every animation runs in CSS instead of JavaScript.

## What I learned

1. Moving state out of props into two contexts, to learn Context properly.
2. Custom hooks for keys, local storage, animation and sticker data.
3. CSS keyframe animations with one speed variable, keeping dozens of loops off the JavaScript thread.
4. Upgrading saved data, so old share links keep working.

## Revisited

1. Oct 2026: per-sticker editing, a searchable sticker picker, a movable editing panel and animations rewritten as CSS keyframes.

## If I built it again

[Two or three sentences on what you would change now]
