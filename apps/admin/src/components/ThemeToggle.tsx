"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getLight() {
  return document.documentElement.dataset.theme === "light";
}

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getLight, () => false);

  function toggle() {
    const next = light ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (private mode). The choice then lasts until the page is closed.
    }
  }

  const Icon = light ? Moon : Sun;

  return (
    <button
      type="button"
      aria-pressed={light}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      onClick={toggle}
      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
    >
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
