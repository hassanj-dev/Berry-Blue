import type { ReactNode } from "react";

export type PageSection = { heading: string; paragraphs: string[] };

type StaticPageProps = {
  title: string;
  intro?: string;
  draftNotice?: string;
  updated?: string;
  sections: PageSection[];
  children?: ReactNode;
};

export function StaticPage({
  title,
  intro,
  draftNotice,
  updated,
  sections,
  children,
}: StaticPageProps) {
  return (
    <main>
      <article className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold md:text-4xl">{title}</h1>
          {intro && <p className="text-muted">{intro}</p>}
          {updated && <p className="text-sm text-muted">{updated}</p>}
        </header>

        {draftNotice && (
          <p
            role="note"
            className="rounded-xl border border-border bg-surface p-3 text-sm text-muted"
          >
            {draftNotice}
          </p>
        )}

        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {children}
      </article>
    </main>
  );
}
