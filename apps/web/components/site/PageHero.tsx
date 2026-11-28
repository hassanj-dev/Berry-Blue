import type { ReactNode } from "react";
import { Container } from "./Container";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <Container className="py-12 md:py-16 lg:py-20">
        <div className="flex max-w-2xl flex-col gap-4">
          {eyebrow && <p className="text-sm font-medium text-muted">{eyebrow}</p>}
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && <p className="text-base text-muted sm:text-lg">{description}</p>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
