import { useSyncExternalStore } from "react";
import { LOW_INTERNET_ATTR } from "@/lib/low-internet-script";

export type NetworkStatus = "ok" | "slow" | "offline";

type Connection = EventTarget & { effectiveType?: string; saveData?: boolean };

// Chrome, Edge and most Android browsers have this. Safari and Firefox do not.
function getConnection() {
  return (navigator as Navigator & { connection?: Connection }).connection;
}

function readStatus(): NetworkStatus {
  if (!navigator.onLine) return "offline";
  const type = getConnection()?.effectiveType;
  return type === "slow-2g" || type === "2g" || type === "3g" ? "slow" : "ok";
}

function subscribeNetwork(listener: () => void) {
  const connection = getConnection();
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  connection?.addEventListener("change", listener);

  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
    connection?.removeEventListener("change", listener);
  };
}

export function useNetworkStatus() {
  return useSyncExternalStore(subscribeNetwork, readStatus, () => "ok" as NetworkStatus);
}

// Turns the low internet look on or off to match the connection.
export function applyAutoLowInternet() {
  const status = readStatus();
  if (status === "offline") return;

  const on = status === "slow" || getConnection()?.saveData === true;
  document.documentElement.toggleAttribute(LOW_INTERNET_ATTR, on);
}
