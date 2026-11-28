/**
 * Shared class recipes for the public site pages.
 * Spacing is on the 4px scale, controls and buttons use rounded-lg, cards rounded-2xl.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** Inset ring for elements that sit inside an overflow-hidden parent. */
export const focusRingInset =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

/** Page gutters, shared by Container and the mobile menu so edges always line up. */
export const gutter = "px-5 sm:px-6 lg:px-8";

/** Type scale: page heading 32/40/48, section heading 24/28/32. Hierarchy comes from size, not weight. */
export const h1Class =
  "text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.5rem] lg:text-5xl";
export const h2Class =
  "text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem] lg:text-[2rem]";

/** Loading placeholder. Static on purpose: nothing here is live, so nothing pulses. */
export const skeletonBlock = "rounded-lg bg-foreground/5";

type Variant = "primary" | "secondary";
type Size = "md" | "sm";

export function btn(variant: Variant = "primary", size: Size = "md"): string {
  return cx(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium",
    "transition-[color,background-color,border-color,transform] active:scale-[0.98] motion-reduce:active:scale-100",
    "disabled:cursor-not-allowed disabled:opacity-60",
    size === "md" ? "h-11 px-5" : "h-10 px-4",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
      : "border border-border bg-surface text-foreground hover:bg-foreground/5",
    focusRing,
  );
}

export const surfaceCard = "rounded-2xl border border-border bg-surface";

/** One icon size and stroke across the site. */
export const iconProps = { size: 18, strokeWidth: 1.5, "aria-hidden": true } as const;

/** The one smaller size, for icons that sit inline next to small text. */
export const iconInline = { size: 16, strokeWidth: 1.5, "aria-hidden": true } as const;

/** Counts, dates and other meta: quiet mono figures. */
export const metaText = "font-mono text-xs tabular-nums text-subtle";

export const textLink =
  "rounded-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground";
