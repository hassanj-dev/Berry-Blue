import type { IconName } from "@/components/layout/icons";
import type { MessageKey } from "@/i18n";

export type NavItem = { href: string; labelKey: MessageKey; icon: IconName };

// Phone bottom bar. Order matters.
export const mainNav: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: "home" },
  { href: "/games", labelKey: "nav.games", icon: "grid" },
  { href: "/search", labelKey: "nav.search", icon: "search" },
  { href: "/favorites", labelKey: "nav.favorites", icon: "heart" },
];

// Desktop sidebar. Search lives in the top bar there.
export const sidebarNav: NavItem[] = mainNav.filter((item) => item.href !== "/search");

export const footerNav: { href: string; labelKey: MessageKey }[] = [
  { href: "/about", labelKey: "footer.about" },
  { href: "/contact", labelKey: "footer.contact" },
  { href: "/privacy", labelKey: "footer.privacy" },
  { href: "/terms", labelKey: "footer.terms" },
];
