"use client";

import { Flag, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { actionButton } from "@/components/game/action-styles";
import { t } from "@/i18n";
import { reportGame } from "@/lib/report-actions";

// A flag button. It opens a small panel under the toolbar (the toolbar is the positioned parent).
export function GameReport({ gameId }: { gameId: string }) {
  const [reason, setReason] = useState("not_loading");
  const [status, setStatus] = useState<"idle" | "sent" | "failed">("idle");
  const [pending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      try {
        setStatus((await reportGame(gameId, reason)) ? "sent" : "failed");
      } catch {
        setStatus("failed");
      }
    });
  }

  if (status === "sent") {
    return <p className="text-sm text-muted">{t("game.reportSent")}</p>;
  }

  return (
    <details className="text-sm">
      <summary
        aria-label={t("game.report")}
        title={t("game.report")}
        className={actionButton + " list-none [&::-webkit-details-marker]:hidden"}
      >
        <Flag size={18} strokeWidth={1.5} aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-full z-20 mt-2 flex w-72 max-w-full flex-col gap-3 rounded-xl border border-border bg-surface p-3">
        <select
          aria-label={t("game.reportReason")}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-11 rounded-lg border border-border bg-background px-3"
        >
          <option value="not_loading">{t("game.reasonNotLoading")}</option>
          <option value="broken_controls">{t("game.reasonControls")}</option>
          <option value="inappropriate">{t("game.reasonInappropriate")}</option>
          <option value="other">{t("game.reasonOther")}</option>
        </select>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={send}
            disabled={pending}
            aria-label={t("game.reportSend")}
            title={t("game.reportSend")}
            className={actionButton}
          >
            <Send size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <p className="text-muted" aria-live="polite">
            {status === "failed" ? t("game.reportFailed") : ""}
          </p>
        </div>
      </div>
    </details>
  );
}
