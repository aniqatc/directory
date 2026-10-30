---
title: Omnifood
type: Redesign
stack: HTML / Sass / JS
released: 2022-12
live: omnifood.aniqa.dev
repo: omnifood
updated: 2023-11
summary: My redesign of the Omnifood landing page from Jonas Schmedtmann’s HTML and CSS course, in my own colours and styling.
screenshotAlt: 'The Omnifood landing page: “A healthy meal delivered to your door, every single day”, diet tags, Learn More and Get Started buttons, and a stack of colourful meal bowls.'
---

## Why I built it

A redesign exercise: rebuild an existing site in my own style and make it hold up on every screen.

## What I learned

1. IntersectionObserver for two jobs: the sticky header and animating screenshots as they scroll in.
2. Sass partials, one per section and breakpoint, instead of one long stylesheet.
3. Cross-browser testing: vendor prefixes, and custom-styled dropdowns because every browser draws them differently.
4. Eight breakpoints, from small phones to wide desktops.

## Revisited

1. Sep 2023: compressed and resized the largest images.
2. Nov 2023: moved the styles into Sass partials and locked scrolling while the mobile menu is open.
