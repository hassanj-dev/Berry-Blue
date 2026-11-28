"use client";

import { Flag, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { actionButton } from "@/components/game/action-styles";
import { iconProps } from "@/components/game/icon-style";
import { t } from "@/i18n";
import { reportGame } from "@/lib/report-actions";

const REASONS = [
  { value: "not_loading", label: "game.reasonNotLoading" },
  { value: "broken_controls", label: "game.reasonControls" },
  { value: "inappropriate", label: "game.reasonInappropriate" },
  { value: "other", label: "game.reasonOther" },
] as const;

const MAX_LENGTH = 500;

// A flag button. It opens a panel under the toolbar (the toolbar is the positioned parent).
export function GameReport({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("not_loading");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "failed">("idle");
  const [pending, startTransition] = useTransition();

  // After sending: show the thanks message for 1 second, then close and reset.
  useEffect(() => {
    if (status !== "sent") return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      setStatus("idle");
      setReason("not_loading");
      setDetails("");
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [status]);

  function send() {
    startTransition(async () => {
      try {
        const ok = await reportGame(gameId, reason, reason === "other" ? details : "");
        setStatus(ok ? "sent" : "failed");
      } catch {
        setStatus("failed");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={t("game.report")}
        title={t("game.report")}
        onClick={() => setOpen(!open)}
        className={actionButton}
      >
        <Flag {...iconProps} aria-hidden="true" />
      </button>

      {open && status === "sent" && (
        <p
          role="status"
          className="absolute right-0 top-full z-50 mt-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm shadow-xl"
        >
          {t("game.reportSent")}
        </p>
      )}

      {open && status !== "sent" && (
        <div
          role="dialog"
          aria-label={t("game.report")}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-full rounded-2xl border border-border bg-surface p-4 text-sm shadow-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-medium">{t("game.reportTitle")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("common.close")}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-foreground"
            >
              <X {...iconProps} aria-hidden="true" />
            </button>
          </div>

          <>
            <fieldset className="mt-3 flex flex-col gap-1">
              <legend className="sr-only">{t("game.reportReason")}</legend>
              {REASONS.map((item) => (
                <label
                  key={item.value}
                  className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 hover:bg-foreground/5 has-checked:bg-foreground/10"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                    className="size-4 accent-primary"
                  />
                  {t(item.label)}
                </label>
              ))}
            </fieldset>

            {reason === "other" && (
              <label className="mt-3 flex flex-col gap-1.5">
                <span className="text-muted">{t("game.reportDetails")}</span>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  maxLength={MAX_LENGTH}
                  rows={3}
                  placeholder={t("game.reportDetailsPlaceholder")}
                  className="resize-none rounded-lg border border-border-strong bg-background px-3 py-2 text-base sm:text-sm"
                />
                <span className="self-end text-xs tabular-nums text-muted">
                  {details.length}/{MAX_LENGTH}
                </span>
              </label>
            )}

            <p role="alert" className="mt-2 text-muted empty:hidden">
              {status === "failed" ? t("game.reportFailed") : ""}
            </p>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 cursor-pointer rounded-lg px-4 text-muted hover:text-foreground"
              >
                {t("game.reportCancel")}
              </button>
              <button
                type="button"
                onClick={send}
                disabled={pending}
                className="h-10 cursor-pointer rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
              >
                {t("game.reportSend")}
              </button>
            </div>
          </>
        </div>
      )}
    </>
  );
}
