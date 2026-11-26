# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The app auto-updates, so releases are identified by date rather than semver.

## [Unreleased]

### Added
- Import series from a JSON file (Settings → Import series): review the list, duplicates come unticked, add the rest. `scripts/import-dramabox.mjs` and `scripts/import-narto.mjs` build that file from public pages (run them on your own computer; polite, remember what they already collected, stop at the first 403/429). `import-narto.mjs --provider reelshort` takes only that provider's series; unknown platforms are added to the platform list on import.
- Profile privacy: Public / Private profiles with follow requests (Settings → Privacy). Private profiles show a lock to non-followers; requests appear in Activity → Incoming with Accept / Decline and a dot on the Activity icon. Two separate settings: count my ratings in the global averages, and appear in member search.
- Light theme (opt-in) with a Theme setting: Dark (default), Light or System. One coherent warm palette; dark header, bottom bar and modal headers on mobile.
- Desktop: keyboard shortcuts (`Esc`, `/`), browser Back closes layers, `#/s/<id>` deep links, review cards on Home and a card grid on Explore, filters and list editor as rounded floating modals, stacked Popular / Friends reviews on the series page, secondary screens.
- Image cropper when uploading covers, cast photos and avatars; click a cover or cast photo to enlarge it.
- Mobile Home community section; welcome message links to your profile; theme and platform chips on search results are clickable.

### Changed
- Cover images are cached by the service worker (cache-first), decoded lazily, and new uploads get a one-year cache header.
- Faster desktop transitions.
- The app now defaults to the dark theme regardless of the device setting.
- Member profiles no longer repeat the reviews list below the Reviews row.

### Fixed
- Toggle switches stayed beige when switched on in the light theme.
- Search is cleared when browsing from Explore; member search no longer flickers; desktop profile header alignment; image upload quality.
- Website placeholder in Settings is now translated.

### Database
- Migration `0017`: `profiles.visibility` / `count_in_stats` / `discoverable`, `follows.status`, `can_view()` and visibility-aware read policies; `series_stats` now aggregates without exposing per-member rows.

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
