"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

export function GameShare({ title }: { title: string }) {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, () => false);
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Build the QR code only on desktop, and load the library only then.
  useEffect(() => {
    if (!isDesktop) return;
    let cancelled = false;

    async function build() {
      try {
        const QRCode = await import("qrcode");
        const dataUrl = await QRCode.toDataURL(pageUrl(), {
          width: 160,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setQr(dataUrl);
      } catch (error) {
        console.error("QR code failed:", error);
      }
    }

    void build();
    return () => {
      cancelled = true;
    };
  }, [isDesktop]);

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
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand"
        >
          {t("game.share")}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {statusText}
        </p>
      </div>

      {isDesktop && qr ? (
        <div className="flex items-center gap-4 self-start rounded-2xl border border-border bg-surface p-4">
          {/* A data URL cannot go through next/image, so a plain img is correct here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={160} height={160} alt={t("game.qrAlt")} className="rounded-lg" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{t("game.playOnPhone")}</p>
            <p className="text-sm text-muted">{t("game.scanQr")}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
