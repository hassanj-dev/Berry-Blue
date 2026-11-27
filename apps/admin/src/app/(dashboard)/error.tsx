"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@/components/ui/Button";

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
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-danger bg-surface p-5"
    >
      <div className="flex items-center gap-2 text-danger">
        <TriangleAlert size={20} strokeWidth={1.75} aria-hidden="true" />
        <h1 className="text-lg font-bold">Something went wrong</h1>
      </div>
      <p className="text-sm text-muted">
        The action could not be completed. Try again, or reload the page.
      </p>
      <Button type="button" variant="secondary" size="sm" onClick={retry} className="self-start">
        Try again
      </Button>
    </div>
  );
}
