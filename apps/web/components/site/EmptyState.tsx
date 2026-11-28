import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { iconProps } from "./ui";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-muted">
        <Icon {...iconProps} />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
