import { Suspense } from "react";
import { NavIcon } from "@/components/layout/icons";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { mainNav } from "@/lib/nav";

export function BottomNav() {
  return (
    <nav
      aria-label={t("nav.bottom")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <Suspense fallback={null}>
        <ul className="mx-auto flex max-w-md">
          {mainNav.map((item) => (
            <li key={item.href} className="flex-1">
              <NavLink
                href={item.href}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted"
                activeClassName="text-brand"
              >
                <NavIcon name={item.icon} />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </Suspense>
    </nav>
  );
}
