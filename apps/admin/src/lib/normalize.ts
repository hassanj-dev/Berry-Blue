// Keep these in sync with packages/providers/core/src/normalize.ts (category) and with the tag
// cleaning inside the approve_staged_game SQL function. The database check on
// category_mappings catches a mismatch for categories.

// Lowercase, single spaces.
export function normalizeProviderCategory(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

// "Fun!" -> "fun", "Action Games" -> "action-games".
export function normalizeTag(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
