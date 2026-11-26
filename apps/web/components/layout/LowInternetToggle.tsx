"use client";

import { Wifi, WifiLow, WifiOff } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { useNetworkStatus } from "@/lib/low-internet";

// An indicator, not a button: it only shows the connection status.
export function LowInternetToggle() {
  const status = useNetworkStatus();
  const bad = status !== "ok";
  const Glyph = status === "offline" ? WifiOff : bad ? WifiLow : Wifi;

  const text =
    status === "offline"
      ? t("lowInternet.offline")
      : status === "slow"
        ? t("lowInternet.slow")
        : t("lowInternet.online");
  const shortText =
    status === "offline" ? t("lowInternet.offlineShort") : t("lowInternet.slowShort");

  return (
    <div
      title={text}
      className={cn(
        "mr-1 flex h-9 min-w-9 shrink-0 items-center justify-center gap-2 rounded-full",
        bad
          ? "bg-red-500/15 px-3 text-red-400 [html[data-theme=light]_&]:text-red-700"
          : "text-muted",
      )}
    >
      <span className="relative flex">
        <Glyph size={18} strokeWidth={2} aria-hidden="true" />
      </span>
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
