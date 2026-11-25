import { useSyncExternalStore } from "react";
import { createSlugList } from "@/lib/local-list";

export const MAX_FAVORITES = 50;

const store = createSlugList("favorites", MAX_FAVORITES);

export function useFavorites() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

// Newest first. At the maximum, the oldest favorite drops off.
export function toggleFavorite(slug: string) {
  const current = store.getSnapshot();
  if (current.includes(slug)) {
    store.write(current.filter((item) => item !== slug));
  } else {
    store.write([slug, ...current]);
  }
}
