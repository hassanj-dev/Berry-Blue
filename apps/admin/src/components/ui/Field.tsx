import type { ReactNode } from "react";

export const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus-visible:border-brand focus-visible:outline-none";

export const textareaClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:border-brand focus-visible:outline-none";

export const fileClass =
  "block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
