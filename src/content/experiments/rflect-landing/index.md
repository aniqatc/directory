---
title: Rflect Landing
type: Landing page
stack: React / Vite / Framer Motion
released: 2025-01
live: rflect.aniqa.dev
repo: rflect-landing
updated: 2026-10
summary: The landing page for rflect. It walks through each command as a terminal session you scroll through.
---

## Why I built it

A CLI is hard to show off, so it needed a page that shows it working.

## What I learned

1. Data-driven sections: each window renders from one object, so adding a command means adding one entry.
2. CSS scroll snapping sets the pace, and Framer Motion reveals each terminal as it arrives.
3. The live star count and version come straight from the GitHub and npm APIs.
4. Respecting reduced motion across every animation with Framer Motion’s MotionConfig.

## Revisited

1. Oct 2026: redesigned around scroll-snapped windows with a progress rail, with terminal demos rewritten to match the real CLI output.
