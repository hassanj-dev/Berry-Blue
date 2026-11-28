import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Mouse } from "lucide-react";
import type { ReactNode } from "react";
import { Keycap } from "./Keycap";
import { cx, iconInline } from "./ui";

const arrow = iconInline;

function Cluster({ top, row }: { top: ReactNode; row: [ReactNode, ReactNode, ReactNode] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      <span />
      {top}
      <span />
      {row[0]}
      {row[1]}
      {row[2]}
    </div>
  );
}

function Cell({
  caption,
  className,
  children,
}: {
  caption: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex min-h-44 flex-col items-center justify-between gap-6 bg-surface p-5",
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center gap-4">{children}</div>
      <p className="text-sm text-muted">{caption}</p>
    </div>
  );
}

/**
 * The standard desktop controls from the guide, drawn as the keys themselves.
 * Decorative: the sentence it illustrates sits right below it in the page.
 */
export function ControlDeck() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4"
    >
      <Cell caption="Move" className="sm:col-span-2">
        <Cluster
          top={<Keycap lit>W</Keycap>}
          row={[<Keycap key="a">A</Keycap>, <Keycap key="s">S</Keycap>, <Keycap key="d">D</Keycap>]}
        />
        <Cluster
          top={
            <Keycap>
              <ArrowUp {...arrow} />
            </Keycap>
          }
          row={[
            <Keycap key="left">
              <ArrowLeft {...arrow} />
            </Keycap>,
            <Keycap key="down">
              <ArrowDown {...arrow} />
            </Keycap>,
            <Keycap key="right">
              <ArrowRight {...arrow} />
            </Keycap>,
          ]}
        />
      </Cell>
      <Cell caption="Jump or act">
        <Keycap className="w-full max-w-36">Space</Keycap>
      </Cell>
      <Cell caption="Aim and click">
        <Mouse size={36} strokeWidth={1.5} className="text-foreground" />
      </Cell>
    </div>
  );
}
