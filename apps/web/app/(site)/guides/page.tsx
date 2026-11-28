import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { EmptyState } from "@/components/site/EmptyState";
import { GuideExplorer } from "@/components/site/GuideExplorer";
import { PageHero } from "@/components/site/PageHero";
import { btn, cx } from "@/components/site/ui";
import { getGuides } from "@/lib/content";

export const metadata: Metadata = {
  title: "Game Guides",
  description: "Step-by-step help to get the most out of your games.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Guides"
        title="Game guides"
        description="Step-by-step help to get the most out of your games."
      />
      <Container className="py-12 md:py-16">
        <Suspense fallback={<GuidesSkeleton />}>
          <GuidesContent />
        </Suspense>
      </Container>
    </>
  );
}

async function GuidesContent() {
  const guides = await getGuides();

  if (guides.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No guides yet"
        description="Guides will appear here as soon as they are published."
      >
        <Link href="/games" className={btn("secondary", "sm")}>
          Browse games
        </Link>
      </EmptyState>
    );
  }

  return <GuideExplorer guides={guides} />;
}

function GuidesSkeleton() {
  const block = "animate-pulse rounded-2xl bg-foreground/5 motion-reduce:animate-none";
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading guides</span>
      <div className={cx("h-12 w-full max-w-xl rounded-lg", block)} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cx("h-64", block)} />
        ))}
      </div>
    </div>
  );
}
