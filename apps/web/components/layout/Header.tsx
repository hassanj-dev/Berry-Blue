import Link from "next/link";
import { Suspense } from "react";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { mainNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand">
          {siteConfig.name}
        </Link>
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
      </div>
    </header>
  );
}
