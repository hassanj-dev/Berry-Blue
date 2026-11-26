"use client";

import { SignalHigh, SignalLow, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { applyAutoLowInternet, useNetworkStatus } from "@/lib/low-internet";

// An indicator, not a button: the mode follows the connection on its own.
export function LowInternetToggle() {
  const status = useNetworkStatus();

  useEffect(() => {
    applyAutoLowInternet();
  }, [status]);

  const bad = status !== "ok";
  const Signal = status === "offline" ? WifiOff : bad ? SignalLow : SignalHigh;
  const text =
    status === "offline"
      ? t("lowInternet.offline")
      : status === "slow"
        ? t("lowInternet.slow")
        : "";
  const shortText =
    status === "offline" ? t("lowInternet.offlineShort") : t("lowInternet.slowShort");

  return (
    <div
      title={text || undefined}
      className={cn(
        "flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 px-2.5",
        bad ? "text-red-400 [html[data-theme=light]_&]:text-red-700" : "text-muted",
      )}
    >
      <Signal size={20} strokeWidth={bad ? 2 : 1.5} aria-hidden="true" />
      {bad && (
        <span aria-hidden="true" className="whitespace-nowrap text-xs font-medium">
          <span className="sm:hidden">{shortText}</span>
          <span className="max-sm:hidden">{text}</span>
        </span>
      )}
      <span role="status" className="sr-only">
        {text}
      </span>
    </div>
  );
}
