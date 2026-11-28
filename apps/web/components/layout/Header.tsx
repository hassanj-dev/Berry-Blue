import { Shuffle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LowInternetToggle } from "@/components/layout/LowInternetToggle";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchBox } from "@/components/layout/SearchBox";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Phone: logo and toggles on the first row, search under them. Desktop: search on the left (the logo is in the sidebar).
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 md:gap-y-3 md:px-8 md:py-3 lg:flex-nowrap">
        <Suspense fallback={<div className="order-1 size-10 lg:hidden" />}>
          <MobileMenu />
        </Suspense>
        <Logo className="order-1 lg:hidden" />

        <div className="order-2 ml-auto flex items-center lg:order-3">
          <LowInternetToggle />
          {/* prefetch off: /random answers with a different game each time. */}
          <Link
            href="/random"
            prefetch={false}
            rel="nofollow"
            aria-label="Play a random game"
            title="Random game"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
          >
            <Shuffle size={20} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <ThemeToggle />
        </div>

        <div className="order-3 w-full lg:order-2 lg:max-w-md lg:flex-1">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
