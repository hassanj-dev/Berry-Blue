import { useSyncExternalStore } from "react";
import { createSlugList } from "@/lib/local-list";

export const MAX_RECENT = 12;

const store = createSlugList("recent", MAX_RECENT);

export function useRecent() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

// Most recent first, no duplicates.
export function addRecent(slug: string) {
  const current = store.getSnapshot();
  if (current[0] === slug) return;
  store.write([slug, ...current.filter((item) => item !== slug)]);
}

export function clearRecent() {
  store.write([]);
}
