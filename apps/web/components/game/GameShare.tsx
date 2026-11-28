"use client";

import { QrCode, Share2, Smartphone, X } from "lucide-react";
import { iconProps } from "@/components/game/icon-style";
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

// Round share button for the toolbar. The "Link copied" note appears under the toolbar.
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
        <Share2 {...iconProps} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="absolute right-0 top-full z-20 mt-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted empty:hidden"
      >
        {statusText}
      </span>
    </>
  );
}

// The QR popup, used by the toolbar icon and by the "made for phones" notice.
// The QR library loads only when the popup is opened.
function useQrPopup() {
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

  const dialog = (
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
        className="absolute right-2 top-2 flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
      >
        <X {...iconProps} aria-hidden="true" />
      </button>

      <div className="flex flex-col items-center gap-4 p-6 pt-10 text-center">
        <div className="size-36 overflow-hidden rounded-lg bg-white">
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
  );

  return { openPopup, dialog };
}

// QR icon in the toolbar (desktop only). It opens a small popup with the QR code.
export function GameQr() {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, () => false);
  const { openPopup, dialog } = useQrPopup();

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
        <QrCode {...iconProps} aria-hidden="true" />
      </button>
      {dialog}
    </>
  );
}

// Desktop only, and only for games that are not made for desktop (the page decides that).
// It says so plainly and offers the QR code. Phones and tablets never see it.
export function GameDesktopNotice() {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, () => false);
  const { openPopup, dialog } = useQrPopup();

  if (!isDesktop) return null;

  return (
    <div
      role="note"
      className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border-strong bg-surface px-4 py-3 text-sm"
    >
      <Smartphone {...iconProps} className="shrink-0 text-muted" aria-hidden="true" />
      <p className="min-w-0 flex-1">{t("game.touchOnlyNotice")}</p>
      <button
        type="button"
        onClick={openPopup}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <QrCode size={16} strokeWidth={1.5} aria-hidden="true" />
        {t("game.playOnPhone")}
      </button>
      {dialog}
    </div>
  );
}
