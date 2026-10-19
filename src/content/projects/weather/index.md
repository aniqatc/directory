---
title: Weather
type: Dashboard
stack: JS / Bootstrap / OpenWeather
released: 2022-11
live: weather.aniqa.dev
repo: weather
order: 4
updated: 2026-10
blurb: Live conditions and a 7-day forecast for 200,000+ cities, in light and dark.
summary: A light and dark weather dashboard with live conditions and a 7-day forecast for any city, plus the weather in five random cities.
---

## Why

My first project with live data. Weather was the obvious choice: an API, a search box and a lot to lay out.

## What it does

1. Search 200,000+ cities, with accent-insensitive suggestions you can pick with the keyboard, or use your location.
2. Current conditions, from feels-like and humidity to sunrise and sunset, and a 7-day forecast.
3. Weather in five random cities around the world; click one to load it.
4. Remembers your city and theme, and works offline after the first visit.

## Hardest part

Searching 200,000+ cities instantly in the browser. A Python script splits OpenWeather’s 42 MB city list into 520 shards by their first two letters, so each search downloads one small file.

## What I learned

1. Searching by coordinates, so cities that share a name resolve correctly.
2. Times and forecast days in the city’s own time zone, not yours.
3. Service worker caching that never serves stale weather.
4. Switching between °F and °C by re-rendering data already loaded, without another request.

## Revisited

1. Nov 2023: city search suggestions, PWA support, and a WeatherService class with managers.
2. Apr 2026: upgraded to the One Call 3.0 API.
3. Oct 2026: fixed forecast day names, stale cached weather and units, and added keyboard navigation to search.
