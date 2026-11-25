import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listProviderOptions, listTagMappings, listUnmappedTags } from "@/lib/mappings";
import { addTagMapping, deleteTagMapping } from "@/lib/mappings-actions";
import { ProviderTabs } from "../ProviderTabs";

export const metadata: Metadata = { title: "Tag mappings" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const inputClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
const buttonClass = "rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand";

export default async function TagsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const providers = await listProviderOptions();
  const { provider: wanted } = await searchParams;
  const current = providers.find((p) => p.provider === wanted) ?? providers[0];

  if (!current) return <p className="text-muted">No providers registered.</p>;

  const [mappings, unmapped] = await Promise.all([
    listTagMappings(current.provider),
    listUnmappedTags(current.provider),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Tag mappings</h1>
      <p className="text-sm text-muted">
        Tags are shown in the cleaned form used when a game is approved (for example
        &ldquo;Fun!&rdquo; becomes &ldquo;fun&rdquo;). A mapping renames a tag or removes it. It
        applies at approval time and does not change games that are already live.
      </p>

      <ProviderTabs basePath="/tags" providers={providers} current={current.provider} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Unmapped ({unmapped.length})</h2>
        {unmapped.length === 0 ? (
          <p className="text-muted">Every provider tag has a mapping.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unmapped.map((item) => (
              <li key={item.name} className="rounded-2xl border border-border bg-surface p-4">
                <form action={addTagMapping} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="provider" value={current.provider} />
                  <input type="hidden" name="providerTag" value={item.name} />
                  <span className="min-w-32 font-medium">
                    {item.name}{" "}
                    <span className="text-sm font-normal text-muted">({item.gameCount} games)</span>
                  </span>
                  <input
                    name="ourTag"
                    defaultValue={item.name}
                    maxLength={60}
                    pattern="[a-z0-9\-]+"
                    aria-label={"Our tag for " + item.name}
                    className={inputClass}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="remove" />
                    Remove this tag
                  </label>
                  <button type="submit" className={buttonClass}>
                    Add mapping
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Mapped ({mappings.length})</h2>
        {mappings.length === 0 ? (
          <p className="text-muted">No mappings yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mappings.map((m) => (
              <li
                key={m.provider_tag}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <span>
                  <span className="font-medium">{m.provider_tag}</span>
                  <span className="text-muted"> &rarr; </span>
                  {m.our_tag ?? <em>removed</em>}
                </span>
                <form action={deleteTagMapping}>
                  <input type="hidden" name="provider" value={current.provider} />
                  <input type="hidden" name="providerTag" value={m.provider_tag} />
                  <button type="submit" className={buttonClass + " text-danger"}>
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
