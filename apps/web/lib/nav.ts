import type { IconName } from "@/components/layout/icons";
import type { MessageKey } from "@/i18n";

export type NavItem = { href: string; labelKey: MessageKey; icon: IconName };

export const mainNav: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: "home" },
  { href: "/games", labelKey: "nav.games", icon: "grid" },
];

export const footerNav: { href: string; labelKey: MessageKey }[] = [
  { href: "/about", labelKey: "footer.about" },
  { href: "/contact", labelKey: "footer.contact" },
  { href: "/privacy", labelKey: "footer.privacy" },
  { href: "/terms", labelKey: "footer.terms" },
];
