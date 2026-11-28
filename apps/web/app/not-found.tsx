import { CircleAlert, Home } from "lucide-react";
import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import Link from "next/link";

const digitsFont = Chakra_Petch({ weight: "700", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Page not found",
};

function Truck() {
  return (
    <div aria-hidden="true" className="nf-truck">
      <div className="nf-body">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93">
          <path
            className="nf-stroke nf-cab"
            strokeWidth={3}
            d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
          />
          <path
            className="nf-stroke nf-window"
            strokeWidth={3}
            d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
          />
          <rect
            className="nf-stroke"
            strokeWidth={2}
            fill="#FFFCAB"
            rx={1}
            height={7}
            width={5}
            y={63}
            x={187}
          />
          <rect
            className="nf-stroke nf-tire-out"
            strokeWidth={2}
            rx={1}
            height={11}
            width={4}
            y={81}
            x={193}
          />
          <rect
            className="nf-stroke nf-cargo"
            strokeWidth={3}
            rx="2.5"
            height={90}
            width={121}
            y="1.5"
            x="6.5"
          />
          <rect
            className="nf-stroke nf-cargo"
            strokeWidth={2}
            rx={2}
            height={4}
            width={6}
            y={84}
            x={1}
          />
        </svg>
      </div>
      <div className="nf-tires">
        {[0, 1].map((n) => (
          <svg key={n} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30">
            <circle className="nf-tire-out" strokeWidth={3} r="13.5" cy={15} cx={15} />
            <circle className="nf-tire-in" r={7} cy={15} cx={15} />
          </svg>
        ))}
      </div>
      <div className="nf-road" />
    </div>
  );
}

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-xs flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-brand">
          <CircleAlert size={14} strokeWidth={1.5} aria-hidden="true" />
          Error 404
        </span>
        <p
          aria-hidden="true"
          className={digitsFont.className + " text-6xl leading-none text-brand md:text-7xl"}
        >
          404
        </p>
        <h1 className="text-xl font-bold">Page Not Found</h1>
        <p className="text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Truck />
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Home size={16} strokeWidth={1.5} aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
