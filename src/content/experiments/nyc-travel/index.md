---
title: NYC Travel
type: Landing page
stack: JS / OpenWeather / DistanceTo
released: 2023-09
live: nyc.aniqa.dev
repo: nyc-travel
updated: 2024-09
summary: A travel guide for New York with live NYC time and weather, flight times from your airport, top destinations and a hotel guide.
---

## Why I built it

A guide to my own city, and a reason to put two APIs and more ambitious layouts on one page.

## What I learned

1. Content from JSON: 27 hotels, the neighbourhoods and weather icons load from files I compiled.
2. Two APIs side by side: weather on page load, flight data on search by airport code or your location.
3. A live clock in New York time, updated every second.
4. Many CSS layouts on one page, often nested: grid and flexbox in every section, and a horizontal scroll container for the destinations.

## Revisited

1. Nov 2023: cleaned up the code and moved data fetching to async functions.
2. Sep 2024: improved the mobile layouts for the neighbourhood and destination cards.
