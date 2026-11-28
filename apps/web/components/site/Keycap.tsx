import type { ReactNode } from "react";
import { cx } from "./ui";

const sizes = {
  sm: "h-6 min-w-6 rounded-md px-1.5 text-xs",
  md: "h-9 min-w-9 rounded-lg px-2 text-sm",
} as const;

/**
 * The site's signature detail: a keyboard key. Used for step numbers and for
 * real keys named in the guides. `lit` marks the one key being pressed.
 */
export function Keycap({
  children,
  size = "md",
  lit = false,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  size?: keyof typeof sizes;
  lit?: boolean;
  as?: "span" | "kbd";
  className?: string;
}) {
  return (
    <Tag
      className={cx(
        "inline-flex shrink-0 select-none items-center justify-center border font-mono font-normal leading-none tabular-nums",
        sizes[size],
        lit
          ? "border-primary bg-primary text-primary-foreground shadow-[inset_0_-2px_0_0_rgb(0_0_0/0.3)]"
          : "border-border bg-background text-foreground shadow-[inset_0_-2px_0_0_var(--border)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
