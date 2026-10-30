---
# App review → /reviews/<slug>
# src/content/reviews/<slug>/index.md (this file), plus optional files in the same folder:
#   logo.png        the app's icon on /reviews (square, 300 × 300 or larger); without it, its first letter on `brand`
#   screenshot.png  the framed screenshot under the facts (1440 × 900, like the case studies)
#   any other images you put under "What I liked"
app: App Name
maker: handle # the maker's X handle, without the @
date: 2026-10-30 # YYYY-MM-DD, the day the review goes up
type: Web app # Web app, iOS app, Chrome extension, CLI tool…
triedOn: MacBook, Chrome # where you tried it
live: example.com # the app's address, no https://
# post: https://x.com/aniqatc/status/… # optional: the review's post on X
summary: One line on what the app does, for the top of the page.
verdict: Promising # one word for Overall: Promising, Delightful, Solid…
brand: '#8b7cf6' # the app's brand colour, in quotes
scores: # 1 to 5: 4–5 shows as Polished, 3 Getting there, 1–2 Needs love
  firstImpression: 4
  onboarding: 3
  bestFeature: 5
  easeOfUse: 4
  value: 3 # pricing / value
screenshotAlt: What's on screen in screenshot.png. # delete if there's no screenshot.png
draft: true # shows on npm run dev only; delete when it's ready to go up
---

## First look

Two or three sentences on the first five minutes: signing up, the empty state, and the moment it clicked.

## What I liked

1. A specific detail that worked well. To show it, leave a blank line, then the image and an _italic_ caption:

   ![What's in the picture](./liked-detail.png)
   _What the picture shows_

2. Two images on one line sit side by side, for phone screens:

   ![The first screen](./phone-before.png) ![The second screen](./phone-after.png)
   _What changes between the two_

3. A point doesn't need a picture.

## Small ideas

1. A gentle suggestion, phrased as something to try.
2. Another idea, ideally small enough to ship this week.

## Who it's for

One sentence on who would love this app.
