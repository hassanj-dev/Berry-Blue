import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/layout/icons";
import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { getCategories } from "@/lib/games";
import { footerNav, sidebarNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

const itemClass =
  "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground";
const itemActive = "bg-surface text-foreground";

async function SidebarCategories() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <nav aria-labelledby="sidebar-categories">
      <h2 id="sidebar-categories" className="mb-2 px-3 text-xs text-muted">
        {t("nav.categories")}
      </h2>
      <Suspense fallback={null}>
        <ul className="flex flex-col gap-0.5">
          {categories.map((category) => (
            <li key={category.id}>
              <NavLink
                href={"/category/" + category.slug}
                className={itemClass}
                activeClassName={itemActive}
              >
                {category.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </Suspense>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-6 overflow-y-auto overflow-x-hidden scroll-row px-3 py-4">
        <Logo className="h-9 px-3" />

        <nav aria-label={t("nav.main")}>
          <Suspense fallback={null}>
            <ul className="flex flex-col gap-0.5">
              {sidebarNav.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} className={itemClass} activeClassName={itemActive}>
                    <Icon name={item.icon} />
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Suspense>
        </nav>

        <Suspense fallback={null}>
          <SidebarCategories />
        </Suspense>

        <div className="mt-auto px-3">
          <nav aria-label={t("footer.links")}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted hover:text-foreground">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-3 text-xs text-muted">
            {t("footer.copyright", { name: siteConfig.name })}
          </p>
        </div>
      </div>
    </aside>
  );
}
