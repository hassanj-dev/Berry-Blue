import Link from "next/link";
import { Suspense } from "react";
import { NavLink } from "@/components/layout/NavLink";
import { SearchBox } from "@/components/layout/SearchBox";
import { t } from "@/i18n";
import { mainNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand">
          {siteConfig.name}
        </Link>

        <SearchBox />

        <nav aria-label={t("nav.main")} className="hidden md:block">
          <Suspense fallback={null}>
            <ul className="flex gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
                    activeClassName="bg-surface text-foreground"
                  >
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Suspense>
        </nav>

        <Link
          href="/favorites"
          aria-label={t("favorites.link")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
