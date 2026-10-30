---
title: Weather Mini
type: Web app
stack: React / Bootstrap / OpenWeather
released: 2024-12
live: mini.weather.aniqa.dev
repo: weather-mini
updated: 2026-10
summary: A small React weather app with current conditions and a 5-day forecast for any city or your current location.
screenshotAlt: 'Weather Mini: a small weather card for New York with the temperature, humidity, wind, visibility, conditions and a five-day forecast.'
---

## Why I built it

A small companion to the full dashboard, to practise React basics: state, effects, props, conditional rendering and forms.

## What I learned

1. Chained requests: one effect fetches the current weather, then uses its coordinates to fetch the forecast.
2. Turning 3-hour forecast readings into one per day, the one closest to noon in the city’s time zone.
3. A reusable Card that the loading, error and weather states all share.

## Revisited

1. Oct 2026: fixed the forecast row, which showed 3-hour readings labelled as days, and made current location search by coordinates.
