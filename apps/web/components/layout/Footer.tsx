import Link from "next/link";
import { t } from "@/i18n";
import { footerNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border pb-24 md:pb-6">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <nav aria-label={t("footer.links")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-foreground">
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-4 text-xs text-muted">
          {t("footer.copyright", { name: siteConfig.name })}
        </p>
      </div>
    </footer>
  );
}
