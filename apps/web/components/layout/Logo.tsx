import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={"flex items-center gap-2 text-lg font-[600] " + className}>
      <span aria-hidden="true" className="size-3 rounded-full bg-primary" />
      {siteConfig.name}
    </Link>
  );
}
