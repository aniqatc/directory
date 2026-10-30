---
title: Time Tapestry
type: Web app
stack: React / TypeScript / Supabase / Mantine / Astronomy Engine
released: 2025-02
live: tt.aniqa.dev
repo: time-tapestry
order: 7
updated: 2026-10
# draft: true # optional: hide it from the portfolio and lab until it's ready
blurb: A calendar of birthdays, history and the sky for any day, with birthdays you can save.
screenshotAlt: Time Tapestry in light mode on June 30, with a month calendar and an add-a-birthday form on the left, and that day's saved and notable birthdays, historical events and Moon phase on the right.
summary: A calendar where you pick any day to see who was born, what happened and what the sky looked like. Sign in to save up to five birthdays of your own, private unless you choose to share them.
---

## Why

[Why you built it: what made you want a calendar of birthdays, history and the sky.]

## What it does

1. Events and notable birthdays for any day come from Wikimedia's On This Day feed, each with a link to read more.
2. The Moon, the planets on a zodiac wheel, and the next lunar and solar eclipses, all for the day you pick.
3. Shared birthdays show as dots on the calendar, so you can see which days other people have filled in.
4. Light and dark themes, and it installs as an app.

## What I learned

1. Astronomy in the browser: Astronomy Engine works out the Moon phase, planet positions and eclipses for any date, so there's no API to call or wait on.
2. Row-level security: Postgres rules let anyone read shared birthdays while only the owner sees their own, and the community view leaves out who the person is to you.
3. Limits in the database: a trigger stops anyone saving more than five birthdays, even if they skip the form.
4. Sign-in without passwords: Supabase sends a magic link by email, through Resend.
5. Time zones: Moonrise and moonset are worked out for New York and only shown when they fall on the day you picked.

## Revisited

1. Oct 2026: added sign-in and saved birthdays, private unless you share them, light and dark themes, and live Moon, planet, zodiac and eclipse data.
