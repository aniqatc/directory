---
title: Word Cycle
type: CSS study
stack: CSS keyframes / mix-blend-mode
released: 2022-12
updated: 2026-10-21
stage: fit
themes: true
hint: Slide the split · switch the blend · swap or roll
summary: A headline that cycles through nine words and changes colour as it crosses from a white page to a black one.
---

## Idea

I first made this for the headline of my NYC Travel page: "New York is" followed by a word that keeps changing. At the time, it was the most fun, artistic thing I could think of as a beginner.

## Notes

1. Swap is the original animation: the words are set with `content` inside the keyframes. `content` can't be animated, so each word flips over partway between two keyframes instead of fading. No JavaScript.
2. `mix-blend-mode: exclusion` on white text shows black over the white half and white over the black half. On the white half, each coloured word turns into its opposite colour.
3. Roll keeps the real words in a list and slides it up one line at a time, so the change can ease smoothly. Screen readers get all nine words once, instead of a word that keeps changing.
4. In the original pen, a sticky headline and a 100vh spacer moved the split as you scrolled. Here in the lab, the Split slider moves it.

## Revisited

1. Dec 2022: first version, made on CodePen for my NYC Travel landing page ([v1](https://codepen.io/aniqatc/pen/xxJVMYK)).
2. Oct 2026: rebuilt for the lab with Roll, the blend switch and the Split slider.
