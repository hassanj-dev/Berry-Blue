import { z } from "zod";

// localStorage can be edited by anyone: a wrong shape becomes an empty list.
const listSchema = z.array(z.string().min(1).max(100));

const EMPTY: readonly string[] = [];

// A short list of game slugs kept in localStorage, shaped for useSyncExternalStore.
export function createSlugList(key: string, max: number) {
  const listeners = new Set<() => void>();
  let lastRaw: string | null = null;
  let lastList: readonly string[] = EMPTY;
  // Only used when localStorage is blocked (private mode): the list lives until the page closes.
  let memory: readonly string[] | null = null;

  function parse(raw: string | null): readonly string[] {
    if (!raw) return EMPTY;
    try {
      const result = listSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data.slice(0, max) : EMPTY;
    } catch {
      return EMPTY;
    }
  }

  // Returns the same array until the stored text changes. useSyncExternalStore needs that.
  function getSnapshot(): readonly string[] {
    if (memory) return memory;

    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return EMPTY;
    }

    if (raw !== lastRaw) {
      lastRaw = raw;
      lastList = parse(raw);
    }
    return lastList;
  }

  function getServerSnapshot(): readonly string[] {
    return EMPTY;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  // Other tabs change localStorage too: the "storage" event tells us.
  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) emit();
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  }

  // The list is cut to max: the newest stay, the oldest drop off.
  function write(next: readonly string[]) {
    const capped = next.slice(0, max);
    try {
      localStorage.setItem(key, JSON.stringify(capped));
      memory = null;
    } catch {
      memory = capped;
    }
    emit();
  }

  return { subscribe, getSnapshot, getServerSnapshot, write };
}
