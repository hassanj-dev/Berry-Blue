"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { cx, focusRing, iconProps } from "./ui";

/**
 * Both icons are always rendered and CSS shows the right one, so the button
 * matches the saved theme on first paint without a hydration mismatch.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode: the theme still changes for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      className={cx(
        "flex size-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/5 hover:text-foreground",
        focusRing,
      )}
    >
      <Sun {...iconProps} className="light:hidden" />
      <Moon {...iconProps} className="hidden light:block" />
    </button>
  );
}
