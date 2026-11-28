import type { ReactNode } from "react";
import { cx, gutter } from "./ui";

const widths = {
  default: "max-w-7xl",
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
  return <div className={cx("mx-auto w-full", gutter, widths[size], className)}>{children}</div>;
}
