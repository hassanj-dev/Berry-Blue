"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="flex min-h-[60dvh] items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-xs flex-col items-center gap-3 text-center">
        <WifiOff size={40} strokeWidth={1.5} aria-hidden="true" />
        <h1 className="text-xl font-bold">Connection problem</h1>
        <p className="text-sm text-muted">
          We could not load this page. Check your internet and try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <RefreshCw size={16} strokeWidth={1.5} aria-hidden="true" />
          Try again
        </button>
      </div>
    </main>
  );
}
