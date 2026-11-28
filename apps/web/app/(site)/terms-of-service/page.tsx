import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { StaticPage } from "@/components/layout/StaticPage";
import { t } from "@/i18n";
import { DRAFT_NOTICE, LAST_UPDATED, terms } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: t("footer.terms"),
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <Container size="content" className="py-12 md:py-16">
      <StaticPage
        title={t("footer.terms")}
        intro={terms.intro}
        draftNotice={DRAFT_NOTICE}
        updated={LAST_UPDATED}
        sections={terms.sections}
      />
    </Container>
  );
}
