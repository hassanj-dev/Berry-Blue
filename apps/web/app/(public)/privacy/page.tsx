import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { t } from "@/i18n";
import { DRAFT_NOTICE, LAST_UPDATED, privacy } from "@/lib/static-pages";

export const metadata: Metadata = { title: t("footer.privacy") };

export default function PrivacyPage() {
  return (
    <StaticPage
      title={t("footer.privacy")}
      intro={privacy.intro}
      draftNotice={DRAFT_NOTICE}
      updated={LAST_UPDATED}
      sections={privacy.sections}
    />
  );
}
