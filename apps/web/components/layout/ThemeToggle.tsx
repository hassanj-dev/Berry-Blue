"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/layout/icons";
import { t } from "@/i18n";

// <html data-theme> is set before paint by lib/theme-script.ts. We only read it and change it.
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

  return (
    <button
      type="button"
      aria-pressed={light}
      aria-label={t("theme.label")}
      title={t("theme.title")}
      onClick={toggle}
      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
    >
      <Icon name={light ? "moon" : "sun"} />
    </button>
  );
}
