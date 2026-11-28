import type { ReactNode } from "react";

// A layout stays mounted between pages, a template does not: so the short fade (.rise-in in globals.css)
// plays on every page change. It is off for reduced motion and in Low Internet Mode.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="rise-in">{children}</div>;
}
