import type { ReactNode } from "react";
import { Container } from "./Container";
import { h2Class } from "./ui";

export function SectionHeading({
  title,
  description,
  id,
}: {
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <h2 id={id} className={h2Class}>
        {title}
      </h2>
      {description && <p className="text-pretty text-muted">{description}</p>}
    </div>
  );
}

/**
 * The page grid: a heading in the left four columns, content in the right
 * eight. Every section on the site sits on these same twelve columns.
 */
export function Section({
  title,
  description,
  id,
  children,
}: {
  title: string;
  description?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16">
      <Container className="grid gap-8 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <SectionHeading title={title} description={description} />
        </div>
        <div className="lg:col-span-8">{children}</div>
      </Container>
    </section>
  );
}
