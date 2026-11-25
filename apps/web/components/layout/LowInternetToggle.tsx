"use client";

import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { setLowInternet, useLowInternet } from "@/lib/low-internet";

// Three signal bars. When the mode is on, two of them fade: low signal.
function SignalIcon({ low }: { low: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 20v-4" />
      <path d="M12 20v-9" opacity={low ? 0.3 : 1} />
      <path d="M19 20V5" opacity={low ? 0.3 : 1} />
    </svg>
  );
}

export function LowInternetToggle() {
  const on = useLowInternet();

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={t("lowInternet.label")}
      title={t("lowInternet.title")}
      onClick={() => setLowInternet(!on)}
      className={cn(
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:text-foreground",
        on ? "text-brand" : "text-muted",
      )}
    >
      <SignalIcon low={on} />
    </button>
  );
}
