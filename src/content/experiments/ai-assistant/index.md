---
title: AI Assistant
type: Web app
stack: JS / Tailwind / Webpack
released: 2023-12
live: code.aniqa.dev
repo: ai-assistant
updated: 2026-10-19
summary: A coding chat that explains, refactors, debugs or converts a snippet in one click, with highlighted answers you can copy, save or download.
screenshotAlt: 'The AI coding assistant: a “Your personal AI coding assistant” heading, four modes to pick from (Explain, Refactor, Debug and Convert), and an empty workspace for pasting code.'
---

## Why I built it

It started as a SheCodes course project where we were only given the API. The modes, chat commands, toolbars and history are my own additions.

## What I learned

1. Asking the model to reply in a fixed JSON shape, so code renders with Prism instead of parsing free text.
2. Prompt context per mode, so you can paste code with no explanation.
3. Chat commands that let you drive the whole site from the keyboard, or tap them from the `help` list.
4. One click listener on the chat for every Copy and command button, including ones restored from history.
5. API keys injected by Webpack at build time, never in the repo.

## Revisited

1. Jan 2025: saved messages load instantly instead of replaying the typewriter effect.
2. Oct 2026: refreshed the design and made it work on phones, with chat bubbles, a Copy button on every code block, a character counter and a tappable command list. Saved messages now restore with their own styling.
