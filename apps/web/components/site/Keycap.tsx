import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * The one signature detail of these pages: a small keyboard key used for
 * step numbers. Decorative, the surrounding <ol> already carries the order.
 */
export function Keycap({ children, size = "md" }: { children: ReactNode; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center border border-b-2 border-border bg-background font-medium tabular-nums text-foreground",
        size === "sm" ? "size-6 rounded-md text-xs" : "size-8 rounded-lg text-sm",
      )}
    >
      {children}
    </span>
  );
}
