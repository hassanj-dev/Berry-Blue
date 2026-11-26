## Phase 5 (so far)

- Search: title match (pg_trgm index) and exact tag match. Results are not cached. /search is noindex.
- Live suggestions: /api/search/suggest, cached for 60 seconds at the CDN.
- Filters: category, device and tag live in the URL. A wrong value is ignored.
- Favorites (max 50) and recently played (max 12) live in localStorage, per browser. No accounts and no sync between devices. At the maximum, the oldest entry drops off.
- Both lists are checked when read. Games that were unpublished are dropped when /favorites loads.
- Rate limits and Turnstile (4G) are still not built. Do them before Phase 7.

- Continue playing (homepage): reads the recent list from localStorage, loads cards via /api/games/by-slugs. Hidden when the list is empty.
- Hover preview: CSS only, description over the thumbnail. Only for a mouse (hover: hover and pointer: fine) or keyboard focus. Low Internet Mode (5F) hides it with html[data-low-internet].

- Phase 6 design: dark is the default theme, light is a choice kept in localStorage ("theme"), applied by lib/theme-script.ts before paint. Neutral graphite surfaces, one blue. --primary (#0000ff) is only for fills with white text. --brand is the blue that is readable on the current theme, used for text, icons and the focus ring. Font: Rubik, with Geist Mono for figures. Weights 400, 500, 600.
