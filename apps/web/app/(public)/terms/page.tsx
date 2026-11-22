import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { t } from "@/i18n";
import { DRAFT_NOTICE, LAST_UPDATED, terms } from "@/lib/static-pages";

export const metadata: Metadata = { title: t("footer.terms") };

export default function TermsPage() {
  return (
    <StaticPage
      title={t("footer.terms")}
      intro={terms.intro}
      draftNotice={DRAFT_NOTICE}
      updated={LAST_UPDATED}
      sections={terms.sections}
    />
  );
}
