"use client";

import { SignalHigh, SignalLow } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { setLowInternet, useLowInternet } from "@/lib/low-internet";

export function LowInternetToggle() {
  const on = useLowInternet();
  const Signal = on ? SignalLow : SignalHigh;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={t("lowInternet.label")}
      title={t("lowInternet.title")}
      onClick={() => setLowInternet(!on)}
      className={cn(
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:text-foreground",
        on ? "text-brand" : "text-muted",
      )}
    >
      <Signal size={20} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
