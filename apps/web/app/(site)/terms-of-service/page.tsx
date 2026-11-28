import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { siteConfig } from "@/lib/site";
import { terms } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: terms.title,
  description: `The terms that apply when you use ${siteConfig.name}.`,
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <StaticPage
      page={terms}
      meta={[
        { label: "Effective date", value: terms.effective },
        { label: "Last updated", value: terms.updated ?? terms.effective },
        { label: "Sections", value: String(terms.sections.length) },
        {
          label: "Contact",
          value: siteConfig.contactEmail,
          href: `mailto:${siteConfig.contactEmail}`,
        },
      ]}
    />
  );
}
