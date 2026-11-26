import { Suspense } from "react";
import { Icon } from "@/components/layout/icons";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { mainNav } from "@/lib/nav";

// Fixed phone bar. The safe-area padding keeps it clear of the home indicator and the notch.
// The public layout leaves the same space under the page, so nothing is hidden behind the bar.
export function BottomNav() {
  return (
    <nav
      aria-label={t("nav.bottom")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur-xl lg:hidden"
    >
      <Suspense fallback={null}>
        <ul className="mx-auto flex max-w-md px-2">
          {mainNav.map((item) => (
            <li key={item.href} className="flex-1">
              <NavLink
                href={item.href}
                className="relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium leading-none text-muted transition-colors hover:text-foreground"
                activeClassName="text-foreground before:absolute before:top-0 before:h-0.5 before:w-7 before:rounded-full before:bg-brand"
              >
                <Icon name={item.icon} size={22} />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </Suspense>
    </nav>
  );
}
