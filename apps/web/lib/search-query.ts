export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 60;

// The URL is not trusted: take the first q, tidy the spaces, cut it to the maximum length.
// null = nothing to search for yet (missing or too short).
export function parseSearchQuery(params: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = (raw ?? "").trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH).trim();

  return q.length >= SEARCH_MIN_LENGTH ? q : null;
}

// Suggestions start from the first letter. The full search page still needs SEARCH_MIN_LENGTH.
export const SUGGEST_MIN_LENGTH = 1;

export function parseSuggestQuery(raw: string | null) {
  const q = (raw ?? "").trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH).trim();
  return q.length >= SUGGEST_MIN_LENGTH ? q : null;
}
