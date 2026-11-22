import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { t } from "@/i18n";
import { siteConfig } from "@/lib/site";
import { contact } from "@/lib/static-pages";

export const metadata: Metadata = { title: t("footer.contact") };

export default function ContactPage() {
  return (
    <StaticPage title={t("footer.contact")} intro={contact.intro} sections={contact.sections}>
      <p>
        <span className="text-muted">{contact.emailLabel}: </span>
        <a
          href={"mailto:" + siteConfig.contactEmail}
          className="font-semibold text-brand hover:underline"
        >
          {siteConfig.contactEmail}
        </a>
      </p>
    </StaticPage>
  );
}
