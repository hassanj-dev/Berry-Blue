import type { ReactNode } from "react";

// A small, safe Markdown renderer. It builds React elements (never raw HTML), so nothing
// typed in the admin can run as a script. Supports headings, paragraphs, lists, quotes,
// code, links, images, bold and italic.

const INLINE =
  /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;

function safeHref(url: string): string | null {
  return /^(https?:\/\/|\/|mailto:)/i.test(url) ? url : null;
}

function safeImage(url: string): string | null {
  return /^(https:\/\/|\/)/i.test(url) ? url : null;
}

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${index++}`;
    if (match[2] !== undefined) {
      const src = safeImage(match[2]);
      if (src) {
        out.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={k}
            src={src}
            alt={match[1]}
            loading="lazy"
            className="my-4 h-auto max-w-full rounded-xl"
          />,
        );
      } else {
        out.push(match[0]);
      }
    } else if (match[4] !== undefined) {
      const href = safeHref(match[4]);
      const external = href !== null && /^https?:\/\//i.test(href);
      out.push(
        href ? (
          <a
            key={k}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {inline(match[3], k)}
          </a>
        ) : (
          match[3]
        ),
      );
    } else if (match[5] !== undefined) {
      out.push(
        <code key={k} className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.9em]">
          {match[5]}
        </code>,
      );
    } else if (match[6] !== undefined) {
      out.push(<strong key={k}>{inline(match[6], k)}</strong>);
    } else if (match[7] !== undefined) {
      out.push(<em key={k}>{inline(match[7], k)}</em>);
    }
    last = at + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const headingClass = [
  "",
  "mt-12 mb-4 text-2xl font-semibold leading-tight tracking-tight",
  "mt-8 mb-3 text-xl font-semibold leading-snug tracking-tight",
  "mt-5 mb-2 text-base font-semibold",
  "mt-5 mb-2 text-base font-semibold",
];

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let n = 0;

  const isBlockStart = (line: string) =>
    /^(#{1,6})\s/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*([-*]|\d+\.)\s+/.test(line) ||
    /^(-{3,}|\*{3,})\s*$/.test(line);

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${n++}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^```/.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre
          key={key}
          className="my-5 overflow-x-auto rounded-xl bg-foreground/10 p-4 font-mono text-sm"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      // The page title is the h1, so "#" in the article becomes an h2.
      const level = Math.min(heading[1].length + 1, 4);
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      blocks.push(
        <Tag key={key} className={headingClass[level]}>
          {inline(heading[2], key)}
        </Tag>,
      );
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key} className="my-8 border-border" />);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]))
        quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(
        <blockquote key={key} className="my-5 border-l-2 border-border-strong pl-4 text-muted">
          {inline(quote.join(" "), key)}
        </blockquote>,
      );
      continue;
    }

    const list = /^\s*([-*]|\d+\.)\s+/.exec(line);
    if (list) {
      const ordered = /\d/.test(list[1]);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag
          key={key}
          className={`my-4 flex flex-col gap-2 pl-6 ${ordered ? "list-decimal" : "list-disc"}`}
        >
          {items.map((item, j) => (
            <li key={j}>{inline(item, `${key}-${j}`)}</li>
          ))}
        </Tag>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i]))
      paragraph.push(lines[i++]);
    if (paragraph.length === 0) {
      paragraph.push(lines[i++]); // never stall on an odd line
    }
    blocks.push(
      <p key={key} className="my-4 leading-7">
        {inline(paragraph.join(" "), key)}
      </p>,
    );
  }

  return <>{blocks}</>;
}
