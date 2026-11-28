import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { siteConfig } from "@/lib/site";
import { privacy } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: privacy.title,
  description: `What information ${siteConfig.name} collects, how it is used, and the choices available to you.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPage
      page={privacy}
      meta={[
        { label: "Effective date", value: privacy.effective },
        { label: "Last updated", value: privacy.updated ?? privacy.effective },
        { label: "Sections", value: String(privacy.sections.length) },
        {
          label: "Contact",
          value: siteConfig.privacyEmail,
          href: `mailto:${siteConfig.privacyEmail}`,
        },
      ]}
    />
  );
}
