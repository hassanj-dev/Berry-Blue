/**
 * Shared class recipes for the public site pages.
 * Spacing is on the 4px scale, controls use rounded-lg, cards rounded-2xl.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** Inset ring for elements that sit inside an overflow-hidden parent. */
export const focusRingInset =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

type Variant = "primary" | "secondary";
type Size = "md" | "sm";

export function btn(variant: Variant = "primary", size: Size = "md"): string {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    size === "md" ? "h-11 px-5" : "h-10 px-4",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-surface text-foreground hover:bg-foreground/5",
    focusRing,
  );
}

export const surfaceCard = "rounded-2xl border border-border bg-surface";

/** One icon size and stroke across the site. */
export const iconProps = { size: 18, strokeWidth: 1.5, "aria-hidden": true } as const;
