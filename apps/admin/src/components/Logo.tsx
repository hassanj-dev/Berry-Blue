import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  href = "/overview",
  className,
  alwaysDark = false,
}: {
  href?: string;
  className?: string;
  /** Login page: always show the white wordmark (no light theme there). */
  alwaysDark?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="BerryBlue Admin"
      className={cn("flex items-center gap-2", className)}
    >
      {/* Dark theme (default): white wordmark */}
      <Image
        src="/brand/wordmark-white.png"
        alt="BerryBlue"
        width={658}
        height={194}
        priority
        unoptimized
        className={cn("h-7 w-auto", !alwaysDark && "[html[data-theme=light]_&]:hidden")}
      />
      {/* Light theme: dark wordmark */}
      {!alwaysDark && (
        <Image
          src="/brand/wordmark-dark.png"
          alt=""
          aria-hidden="true"
          width={658}
          height={189}
          priority
          unoptimized
          className="hidden h-7 w-auto [html[data-theme=light]_&]:block"
        />
      )}
      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
        Admin
      </span>
    </Link>
  );
}
