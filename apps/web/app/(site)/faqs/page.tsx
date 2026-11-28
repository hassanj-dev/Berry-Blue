import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { FaqExplorer } from "@/components/site/FaqExplorer";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { btn, cx, focusRing, skeletonBlock, textLink } from "@/components/site/ui";
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
        title="Frequently asked questions"
        description="Quick answers to common questions"
      />
      <Container className="grid gap-12 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
        <aside className="order-last lg:order-first lg:col-span-4">
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-24 lg:max-w-xs">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Did not find your answer?</h2>
              <p className="text-muted">Send us a message and we will reply by email</p>
            </div>
            <Link href="/contact" className={btn("primary", "sm")}>
              Contact us
            </Link>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className={cx("font-mono text-sm", textLink, focusRing)}
            >
              {siteConfig.contactEmail}
            </a>
          </div>
        </aside>
        <div className="lg:col-span-8">
          <Suspense fallback={<FaqSkeleton />}>
            <FaqContent />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

async function FaqContent() {
  const faqs = await getFaqs();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <FaqExplorer faqs={faqs} />
    </>
  );
}

function FaqSkeleton() {
  const block = skeletonBlock;
  return (
    <div role="status" className="flex flex-col gap-8">
      <span className="sr-only">Loading questions</span>
      <div className={cx("h-12 w-full", block)} />
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cx("h-16 w-full", block)} />
        ))}
      </div>
    </div>
  );
}
