import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={siteConfig.name}
      className={"flex items-center text-lg " + className}
    >
      {/* Dark theme (default): white wordmark */}
      <Image
        src="/brand/wordmark-white.png"
        alt={siteConfig.name}
        width={658}
        height={194}
        priority
        className="h-[1.75em] w-auto [html[data-theme=light]_&]:hidden"
      />
      {/* Light theme: dark wordmark */}
      <Image
        src="/brand/wordmark-dark.png"
        alt=""
        aria-hidden="true"
        width={658}
        height={189}
        priority
        className="hidden h-[1.75em] w-auto [html[data-theme=light]_&]:block"
      />
    </Link>
  );
}
