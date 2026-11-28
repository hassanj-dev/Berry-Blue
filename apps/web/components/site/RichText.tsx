import type { ReactNode } from "react";
import { Keycap } from "./Keycap";
import { cx, focusRing, textLink } from "./ui";

const EMAIL = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}";
const URL = "https?:\\/\\/[A-Za-z0-9./-]*[A-Za-z0-9/]";
const KEY = "\\b(?:Esc|Space)\\b";

/**
 * Renders approved copy as it is written, and turns email addresses and site
 * links into real links. With `keys`, keyboard keys named in the text are
 * drawn as keycaps. The words themselves are never changed.
 */
export function RichText({ text, keys = false }: { text: string; keys?: boolean }) {
  const pattern = new RegExp(`(${EMAIL})|(${URL})${keys ? `|(${KEY})` : ""}`, "g");
  const out: ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `${at}-${match[0]}`;
    if (match[1]) {
      out.push(
        <a key={key} href={`mailto:${match[1]}`} className={cx(textLink, focusRing)}>
          {match[1]}
        </a>,
      );
    } else if (match[2]) {
      out.push(
        <a key={key} href={match[2]} className={cx(textLink, focusRing)}>
          {match[2]}
        </a>,
      );
    } else {
      out.push(
        <Keycap key={key} as="kbd" size="sm" className="mx-0.5 align-middle">
          {match[0]}
        </Keycap>,
      );
    }
    last = at + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
