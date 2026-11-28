import Link from "next/link";
import { Suspense } from "react";
import { siteConfig } from "@/lib/site";
import { Container } from "./Container";
import { SiteNav } from "./SiteNav";
import { cx, focusRing } from "./ui";

/**
 * Minimal public header: wordmark and a few links. No sidebar, no search.
 * The nav reads the pathname on the client, so it sits in its own Suspense
 * boundary. The header has a fixed height, so nothing shifts when it appears.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className={cx("flex items-center rounded-lg", focusRing)}
        >
          {/* Dark theme shows the white wordmark, light theme the blue one. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/wordmark-white.png"
            alt=""
            height={26}
            className="h-[26px] w-auto light:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/wordmark-blue.png"
            alt=""
            height={26}
            className="hidden h-[26px] w-auto light:block"
          />
        </Link>
        <Suspense fallback={null}>
          <SiteNav />
        </Suspense>
      </Container>
    </header>
  );
}
