import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { t } from "@/i18n";
import { about } from "@/lib/static-pages";

export const metadata: Metadata = { title: t("footer.about") };

export default function AboutPage() {
  return <StaticPage title={t("footer.about")} intro={about.intro} sections={about.sections} />;
}
