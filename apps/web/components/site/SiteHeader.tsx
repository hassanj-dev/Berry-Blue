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
        <Link href="/" className={cx("rounded-lg text-lg font-semibold tracking-tight", focusRing)}>
          {siteConfig.name}
        </Link>
        <Suspense fallback={null}>
          <SiteNav />
        </Suspense>
      </Container>
    </header>
  );
}
