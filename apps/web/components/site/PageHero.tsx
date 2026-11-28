import type { ReactNode } from "react";
import { Container } from "./Container";
import { cx, focusRing, h1Class, textLink } from "./ui";

export type HeroMeta = { label: string; value: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  split = "text",
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Actions under the description. */
  children?: ReactNode;
  /** The page's visual, shown next to the text on wide screens. */
  aside?: ReactNode;
  /** "even" gives the visual half the width, "text" gives the text more room. */
  split?: "text" | "even";
  /** Real facts about the page, shown as a ruled strip under the hero. */
  meta?: HeroMeta[];
}) {
  return (
    <section>
      <Container
        className={cx(
          "grid gap-8 pb-6 pt-10 md:pb-8 md:pt-12 lg:grid-cols-12 lg:gap-10",
          aside ? "lg:items-center" : false,
        )}
      >
        <div
          className={cx(
            "rise-in flex flex-col gap-5",
            !aside ? "lg:col-span-9" : split === "even" ? "lg:col-span-6" : "lg:col-span-7",
          )}
        >
          {eyebrow && <p className="text-sm text-muted">{eyebrow}</p>}
          <h1 className={h1Class}>{title}</h1>
          {description && (
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
              {description}
            </p>
          )}
          {children && <div className="pt-3">{children}</div>}
        </div>
        {aside && (
          <div
            className={cx(
              "rise-in rise-in-late",
              split === "even" ? "lg:col-span-6" : "lg:col-span-5",
            )}
          >
            {aside}
          </div>
        )}
      </Container>

      {meta && meta.length > 0 && (
        <div>
          <Container>
            <dl className="grid divide-y divide-border sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0 lg:grid-cols-4">
              {meta.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 py-3 sm:flex-col sm:justify-start sm:gap-1 sm:py-5"
                >
                  <dt className="shrink-0 text-sm text-muted">{item.label}</dt>
                  <dd className="text-right font-mono text-sm tabular-nums [overflow-wrap:anywhere] sm:text-left">
                    {item.href ? (
                      <a href={item.href} className={cx(textLink, focusRing)}>
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      )}
    </section>
  );
}
