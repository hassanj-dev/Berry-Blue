"use client";

import { useEffect } from "react";

// Production only: a service worker in `pnpm dev` would confuse every code change.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
      console.error("Service worker failed:", error);
    });
  }, []);

  return null;
}
