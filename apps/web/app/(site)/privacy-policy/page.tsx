import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { StaticPage } from "@/components/layout/StaticPage";
import { t } from "@/i18n";
import { DRAFT_NOTICE, LAST_UPDATED, privacy } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: t("footer.privacy"),
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <Container size="content" className="py-12 md:py-16">
      <StaticPage
        title={t("footer.privacy")}
        intro={privacy.intro}
        draftNotice={DRAFT_NOTICE}
        updated={LAST_UPDATED}
        sections={privacy.sections}
      />
    </Container>
  );
}
