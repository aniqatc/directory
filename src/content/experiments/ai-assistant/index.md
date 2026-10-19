---
title: AI Assistant
type: Web app
stack: JS / Tailwind / Webpack
released: 2023-12
live: code.aniqa.dev
repo: ai-assistant
updated: 2025-01
summary: A coding chat that explains, refactors, debugs or converts a snippet in one click, with highlighted answers you can copy, save or download.
---

## Why I built it

It started as a SheCodes course project where we were only given the API. The modes, chat commands, toolbars and history are my own additions.

## What I learned

1. Asking the model to reply in a fixed JSON shape, so code renders with Prism instead of parsing free text.
2. Prompt context per mode, so you can paste code with no explanation.
3. Chat commands that let you drive the whole site from the keyboard.
4. API keys injected by Webpack at build time, never in the repo.

## Revisited

1. Jan 2025: saved messages load instantly instead of replaying the typewriter effect.
