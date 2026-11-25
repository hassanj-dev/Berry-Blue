## Phase 5 (so far)

- Search: title match (pg_trgm index) and exact tag match. Results are not cached. /search is noindex.
- Live suggestions: /api/search/suggest, cached for 60 seconds at the CDN.
- Filters: category, device and tag live in the URL. A wrong value is ignored.
- Favorites (max 50) and recently played (max 12) live in localStorage, per browser. No accounts and no sync between devices. At the maximum, the oldest entry drops off.
- Both lists are checked when read. Games that were unpublished are dropped when /favorites loads.
- Rate limits and Turnstile (4G) are still not built. Do them before Phase 7.
