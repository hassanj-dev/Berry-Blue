import Link from "next/link";
import type { ProviderOption } from "@/lib/mappings";

export function ProviderTabs({
  basePath,
  providers,
  current,
}: {
  basePath: string;
  providers: ProviderOption[];
  current: string;
}) {
  return (
    <nav aria-label="Choose provider">
      <ul className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <li key={p.provider}>
            <Link
              href={basePath + "?provider=" + p.provider}
              aria-current={p.provider === current ? "page" : undefined}
              className="chip"
            >
              {p.display_name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
