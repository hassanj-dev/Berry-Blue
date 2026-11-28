import { MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { EmptyState } from "@/components/site/EmptyState";
import { FaqExplorer } from "@/components/site/FaqExplorer";
import { PageHero } from "@/components/site/PageHero";
import { btn, cx } from "@/components/site/ui";
import { getFaqs } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Answers to common questions about ${siteConfig.name}.`,
  alternates: { canonical: "/faqs" },
};

export default function FaqsPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQs"
        title="Common questions"
        description="Quick answers to common questions."
      />
      <Container size="content" className="py-12 md:py-16">
        <Suspense fallback={<FaqSkeleton />}>
          <FaqContent />
        </Suspense>
      </Container>
    </>
  );
}

/**
 * Reads FAQs from the database and shows them as they are. If the query throws
 * (for example because the table is missing), the error is NOT caught here, so
 * a broken data source is never presented as "no questions yet".
 */
async function FaqContent() {
  const faqs = await getFaqs();

  if (faqs.length === 0) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="No questions published yet"
        description="Questions and answers will appear here once they are added."
      >
        <Link href="/contact" className={btn("secondary", "sm")}>
          Contact us
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <FaqExplorer faqs={faqs} />
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Did not find your answer?</p>
          <p className="text-sm text-muted">Send us a message and we will reply by email.</p>
        </div>
        <Link href="/contact" className={btn("primary", "sm")}>
          Contact us
        </Link>
      </div>
    </div>
  );
}

function FaqSkeleton() {
  const block = "animate-pulse rounded-2xl bg-foreground/5 motion-reduce:animate-none";
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading questions</span>
      <div className={cx("h-12 w-full rounded-lg", block)} />
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cx("h-16 w-full", block)} />
        ))}
      </div>
    </div>
  );
}
