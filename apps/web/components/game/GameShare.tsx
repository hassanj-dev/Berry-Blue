"use client";

import { Share2, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { actionButton } from "@/components/game/action-styles";
import { t } from "@/i18n";

type Status = "idle" | "copied" | "failed";

// "Desktop" = a mouse-like device with a wide screen. Phones and tablets do not get the QR code.
const DESKTOP_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getDesktop() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

// No query string or hash, so shared links stay clean.
function pageUrl() {
  return window.location.origin + window.location.pathname;
}

// Round share button for the toolbar. The "Link copied" note appears next to it.
export function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function showStatus(next: Status) {
    setStatus(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 3000);
  }

  async function handleShare() {
    const url = pageUrl();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: t("game.shareText", { title }), url });
        return;
      } catch (error) {
        // The visitor closed the share sheet: nothing to do. Any other error falls back to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showStatus("copied");
    } catch {
      showStatus("failed");
    }
  }

  const statusText =
    status === "copied" ? t("game.linkCopied") : status === "failed" ? t("game.copyFailed") : "";

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label={t("game.share")}
        title={t("game.share")}
        className={actionButton}
      >
        <Share2 size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <span aria-live="polite" className="text-sm text-muted empty:hidden">
        {statusText}
      </span>
    </>
  );
}

// Phone icon in the toolbar (desktop only). It opens a small popup with the QR code.
// The QR library loads only when the popup is opened.
export function GameQr() {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, () => false);
  const [qr, setQr] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  async function openPopup() {
    dialogRef.current?.showModal();
    if (qr) return;

    try {
      const QRCode = await import("qrcode");
      setQr(
        await QRCode.toDataURL(pageUrl(), {
          width: 288,
          margin: 2,
          errorCorrectionLevel: "M",
        }),
      );
    } catch (error) {
      console.error("QR code failed:", error);
    }
  }

  if (!isDesktop) return null;

  return (
    <>
      <button
        type="button"
        onClick={openPopup}
        aria-label={t("game.playOnPhone")}
        title={t("game.playOnPhone")}
        className={actionButton}
      >
        <Smartphone size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={t("game.playOnPhone")}
        // A click on the dark area around the popup lands on the dialog itself, and closes it.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={t("common.close")}
          title={t("common.close")}
          className="absolute right-2 top-2 flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
        >
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center gap-4 p-6 pt-10 text-center">
          <div className="size-36 overflow-hidden rounded-xl bg-white">
            {qr ? (
              // A data URL cannot go through next/image, so a plain img is correct here.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} width={144} height={144} alt={t("game.qrAlt")} />
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{t("game.playOnPhone")}</p>
            <p className="text-sm text-muted">{t("game.scanQr")}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
