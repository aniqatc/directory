---
title: Valorant
type: Landing page
stack: HTML / CSS / JS
released: 2022-11
live: valorant.aniqa.dev
repo: valorant
updated: 2024-08
summary: A fan landing page for Valorant’s agents and maps, with light and dark themes and a quick quiz that matches you to an agent role.
screenshotAlt: 'The Valorant fan page in light mode: a grid of map cards from Lotus to Breeze, and an Agents banner with character art and a Find Your Match button.'
---

## Why I built it

My first landing page. I picked a game with a strong visual identity to practise laying out a whole page.

## What I learned

1. CSS Grid with auto-fit and minmax, so 24 agent cards reflow without a breakpoint for every screen size.
2. Absolute positioning to layer text over each agent card.
3. Theme colours in CSS variables, so the toggle swaps one class instead of restyling each element.
4. An empty touchstart listener, so phones apply hover styles when you tap.

## Revisited

1. Nov 2023: moved the theme colours into CSS variables and simplified the toggle.
2. Aug 2024: fixed a hover bug and updated the agents and maps.
