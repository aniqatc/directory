---
title: 100 Days of CSS
type: Challenge
stack: CSS / Sass / Webpack
released: 2023-10
live: css100.aniqa.dev
repo: css-100
summary: 'My version of the 100 Days of CSS challenge: one self-contained CSS piece a day.'
---

## Why I built it

To sharpen my CSS through pure CSS art, animation, 3D transforms and SVG. I got through 82 of the 100 days, most of them between October and December 2023, and wrote a README for each one with the key concepts and what tripped me up.

## What I learned

1. One folder per day, with its styles, markup, an optional script and its notes, each wrapped in its own class (`.day-001`) so styles never bleed across days. A Webpack setup loads every entry.
2. Stacking: `z-index` only works on positioned elements, and pseudo-elements stack above their parent. To put one behind, I gave it its own stacking context and a negative `z-index` (day 1).
3. Restarting an animation: removing and re-adding a class doesn't replay it, so I forced a reflow in between (day 2).
4. Timing inside `@keyframes`: percentages start each circle's scale at a different point in one cycle, with no `animation-delay` (day 4).
5. Transforms overwrite each other: a `scale()` in an animation cancels the `translate(-50%, -50%)` used to centre. On day 26 I centred with negative margins instead, and left day 16's workaround as it was, as a reminder of why.
6. SVG elements can't have pseudo-elements, so the tooltips on day 5's graph moved into one absolutely positioned div.
7. Gradients don't animate: a `conic-gradient` spinner wouldn't run, so I used an SVG stroke instead. `outline-offset` gave me a dotted border I could push in or out (day 10).
8. Drawing SVG lines with `stroke-dasharray` and `stroke-dashoffset`, made simpler with the `pathLength` attribute (days 22, 30 and 68).
9. Invisible space: a giant quote mark carried extra space above and below it until `line-height: 0` made `top: 0` mean the top (day 12).
10. Out of sight isn't out of the way: hidden elements still caught clicks until I set `pointer-events: none` (days 13, 24 and 39).
11. State without JavaScript: hidden radio and checkbox inputs, styled labels and the `~` selector for tabs, toggles and buttons, including two labels for one checkbox (days 19, 20, 27, 36, 71 and 74).
12. One animation for many elements: an `--index` set from JavaScript, then `calc()` for each element's duration and delay. Variables inside `@keyframes` turned four animations into two, and negative delays start an element partway through (days 31, 39, 63 and 68).
13. Different transitions in and out: one sequence for opening and another for closing, plus removing the grey tap highlight on mobile (day 25).
14. Flexbox beyond one row: an auto margin instead of a nested container (day 9), and `flex-basis: 100%` to break a table onto its own row (day 62).
15. Forms: a custom file upload, number and range inputs styled across browsers, and `:valid` flipping a form over when the password matches (days 15, 32, 53 and 76).
16. SCSS from day 51: `@for` loops that write a separate `@keyframes` for each element, mixins with parameters, `@function`, `@if` / `@else`, and the modulo operator for alternating transitions (days 51 to 59).
17. 3D: `perspective` for a shared space and `perspective()` for a single element, `preserve-3d`, and `backface-visibility` for flip cards. I built a cube, a carousel, an icosahedron and a sliced sphere. Day 57 was the first time I copied the original's values, because I couldn't work out the formula myself.
