# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The app auto-updates, so releases are identified by date rather than semver.

## [Unreleased]

## [1.0.0] - 2026-11-19

First public release.

### Added
- Diary of micro-series: ratings (half stars), likes, rewatches, multiple logs per series, reviews with spoiler hiding.
- Watchlist, lists (with tags and likes) and four favourites on your profile, reorderable by drag.
- Social: public profiles, follow / unfollow, friends' activity feed, incoming activity, member search.
- Stats: rating histogram, averages and totals.
- Filters and sorting sheet (Explore, Series, Home rows, Watchlist, Likes) saved between sessions.
- Series form with theme chips (autocomplete, drag to reorder), ordered cast, episode count and duration.
- Built-in platforms (DramaBox, ReelShort, ShortMax, GoodShort, FlexTV, Desconocido) plus custom platforms you can manage and delete.
- Spanish / English interface.
- Desktop layout (≥1024px) with hero, popular row, friends' reviews and sidebar, while keeping the mobile layout untouched.
- Installable PWA with automatic update check.
- Open-source tooling: MIT license, contributing guide, issue / PR templates, CI (`node scripts/check.mjs`), self-host script (`scripts/setup.mjs`).

### Database
- Migrations `0001`–`0016` (schema with RLS, social, covers bucket, list extras, list likes, watchlist, platforms).

[Unreleased]: https://github.com/itstxti/microboxd/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/itstxti/microboxd/releases/tag/v1.0.0
