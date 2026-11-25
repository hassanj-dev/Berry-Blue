"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function DashboardError({ reset }: { reset: () => void }) {
  const router = useRouter();

  // refresh() re-fetches the server data, then reset() re-renders the page.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-danger p-4">
      <h1 className="text-lg font-bold text-danger">Something went wrong</h1>
      <p className="text-sm">The action could not be completed. Try again, or reload the page.</p>
      <button
        type="button"
        onClick={retry}
        className="self-start rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand"
      >
        Try again
      </button>
    </div>
  );
}
