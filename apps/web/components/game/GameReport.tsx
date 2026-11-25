"use client";

import { useState, useTransition } from "react";
import { t } from "@/i18n";
import { reportGame } from "@/lib/report-actions";

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
      <summary className="cursor-pointer text-muted">{t("game.report")}</summary>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          aria-label={t("game.reportReason")}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5"
        >
          <option value="not_loading">{t("game.reasonNotLoading")}</option>
          <option value="broken_controls">{t("game.reasonControls")}</option>
          <option value="inappropriate">{t("game.reasonInappropriate")}</option>
          <option value="other">{t("game.reasonOther")}</option>
        </select>
        <button
          type="button"
          onClick={send}
          disabled={pending}
          className="rounded-lg border border-border px-3 py-1.5 hover:border-brand disabled:opacity-60"
        >
          {t("game.reportSend")}
        </button>
        <p className="text-muted" aria-live="polite">
          {status === "failed" ? t("game.reportFailed") : ""}
        </p>
      </div>
    </details>
  );
}
