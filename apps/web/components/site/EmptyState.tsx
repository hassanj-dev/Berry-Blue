import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cx, iconProps, surfaceCard } from "./ui";

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
    <div className={cx("flex flex-col items-start gap-6 p-8 md:p-12", surfaceCard)}>
      <Icon {...iconProps} className="text-muted" />
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
