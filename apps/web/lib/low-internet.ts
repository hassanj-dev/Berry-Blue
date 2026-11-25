import { useSyncExternalStore } from "react";
import { LOW_INTERNET_ATTR, LOW_INTERNET_KEY } from "@/lib/low-internet-script";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

// Another tab changed the choice: follow it.
function onStorage(event: StorageEvent) {
  if (event.key !== LOW_INTERNET_KEY) return;
  document.documentElement.toggleAttribute(LOW_INTERNET_ATTR, event.newValue === "on");
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return document.documentElement.hasAttribute(LOW_INTERNET_ATTR);
}

// false on the server and while hydrating, so the button never causes a hydration warning.
function getServerSnapshot() {
  return false;
}

export function useLowInternet() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setLowInternet(on: boolean) {
  document.documentElement.toggleAttribute(LOW_INTERNET_ATTR, on);
  try {
    localStorage.setItem(LOW_INTERNET_KEY, on ? "on" : "off");
  } catch {
    // Storage can be blocked (private mode). The mode still works until the page closes.
  }
  emit();
}
