import { Suspense } from "react";
import { Icon } from "@/components/layout/icons";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { mainNav } from "@/lib/nav";

export function BottomNav() {
  return (
    <nav
      aria-label={t("nav.bottom")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <Suspense fallback={null}>
        <ul className="mx-auto flex max-w-md">
          {mainNav.map((item) => (
            <li key={item.href} className="flex-1">
              <NavLink
                href={item.href}
                className="relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted transition-colors"
                activeClassName="text-foreground before:absolute before:top-0 before:h-0.5 before:w-8 before:rounded-full before:bg-brand"
              >
                <Icon name={item.icon} />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </Suspense>
    </nav>
  );
}
