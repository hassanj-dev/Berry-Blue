import Link from "next/link";
import { FaDiscord, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import { t } from "@/i18n";
import { siteConfig } from "@/lib/site";

// An empty href means the page does not exist yet: the name is shown without a link.
const columns = [
  {
    title: "footer.playTitle",
    items: [
      { label: "footer.allGames", href: "/games" },
      { label: "footer.trendingGames", href: "/games?sort=trending" },
      { label: "footer.newGames", href: "/games?sort=new" },
      { label: "footer.myFavorites", href: "/favorites" },
    ],
  },
  {
    title: "footer.resources",
    items: [
      { label: "footer.faqs", href: "" },
      { label: "footer.gameGuides", href: "" },
      { label: "footer.blog", href: "" },
      { label: "footer.shop", href: "" },
    ],
  },
  {
    title: "footer.company",
    items: [
      { label: "footer.aboutUs", href: "/about" },
      { label: "footer.contactUs", href: "/contact" },
    ],
  },
  {
    title: "footer.legal",
    items: [
      { label: "footer.privacyPolicy", href: "/privacy" },
      { label: "footer.termsOfService", href: "/terms" },
    ],
  },
] as const;

// Add the real profile address to turn an icon into a link.
const social = [
  { name: "LinkedIn", Glyph: FaLinkedinIn, url: "" },
  { name: "Instagram", Glyph: FaInstagram, url: "" },
  { name: "TikTok", Glyph: FaTiktok, url: "" },
  { name: "Discord", Glyph: FaDiscord, url: "" },
  { name: "YouTube", Glyph: FaYoutube, url: "" },
];

const iconClass =
  "flex size-10 items-center justify-center rounded-xl bg-foreground/10 transition hover:-translate-y-0.5 hover:bg-primary hover:text-white";

export function Footer() {
  return (
    <footer className="mt-12 overflow-hidden border-t border-border [container-type:inline-size]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-10 px-4 pt-14 text-sm md:grid-cols-4 md:px-8 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-4 xl:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-xl font-[600]">
            {/* Placeholder mark until the real logo is ready. */}
            <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
              <rect width="32" height="32" rx="9" className="fill-primary" />
              <circle cx="12" cy="19" r="6" fill="#fff" />
              <circle cx="21" cy="12" r="4" fill="#fff" opacity="0.7" />
            </svg>
            {siteConfig.name}
          </Link>
          <p className="mt-3 max-w-xs text-muted">{t("footer.tagline")}</p>
          <ul aria-label={t("footer.social")} className="mt-5 flex flex-wrap gap-2">
            {social.map(({ name, Glyph, url }) => (
              <li key={name}>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    title={name}
                    className={iconClass}
                  >
                    <Glyph size={18} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    role="img"
                    aria-label={name + ", " + t("footer.comingSoon")}
                    title={name + ", " + t("footer.comingSoon")}
                    className={iconClass + " text-muted"}
                  >
                    <Glyph size={18} aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={t(column.title)}>
            <p className="mb-4 font-semibold">{t(column.title)}</p>
            <ul className="flex flex-col gap-3">
              {column.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-[#858B9A] transition-colors hover:text-white [html[data-theme=light]_&]:text-muted [html[data-theme=light]_&]:hover:text-foreground"
                    >
                      {t(item.label)}
                    </Link>
                  ) : (
                    <span
                      className="cursor-default text-[#858B9A] transition-colors hover:text-white [html[data-theme=light]_&]:text-muted [html[data-theme=light]_&]:hover:text-foreground"
                      title={t("footer.comingSoon")}
                    >
                      {t(item.label)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="mt-12 px-4 pb-7 text-center text-[11px] text-muted">
        {t("footer.copyright", { name: siteConfig.name })}
      </p>
    </footer>
  );
}
