import type { ReactNode } from "react";
import { cx } from "./ui";

const widths = {
  default: "max-w-6xl",
  content: "max-w-4xl",
  narrow: "max-w-3xl",
} as const;

export function Container({
  size = "default",
  className,
  children,
}: {
  size?: keyof typeof widths;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[size], className)}>
      {children}
    </div>
  );
}
