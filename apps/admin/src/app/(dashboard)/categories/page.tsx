import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listCategoryMappings, listProviderOptions, listUnmappedCategories } from "@/lib/mappings";
import { addCategoryMapping, deleteCategoryMapping } from "@/lib/mappings-actions";
import { listCategories } from "@/lib/moderation";
import { ProviderTabs } from "../ProviderTabs";

export const metadata: Metadata = { title: "Category mappings" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const inputClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
const buttonClass = "rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand";

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const providers = await listProviderOptions();
  const { provider: wanted } = await searchParams;
  const current = providers.find((p) => p.provider === wanted) ?? providers[0];

  if (!current) return <p className="text-muted">No providers registered.</p>;

  const [mappings, unmapped, categories] = await Promise.all([
    listCategoryMappings(current.provider),
    listUnmappedCategories(current.provider),
    listCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Category mappings</h1>
      <p className="text-sm text-muted">
        A mapping turns a provider category into one of our categories. Games from every provider
        that map to the same category appear together on the public site.
      </p>

      <ProviderTabs basePath="/categories" providers={providers} current={current.provider} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Unmapped ({unmapped.length})</h2>
        {unmapped.length === 0 ? (
          <p className="text-muted">Every provider category has a mapping.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unmapped.map((item) => (
              <li key={item.name} className="rounded-2xl border border-border bg-surface p-4">
                <form action={addCategoryMapping} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="provider" value={current.provider} />
                  <input type="hidden" name="providerCategory" value={item.name} />
                  <span className="min-w-32 font-medium">
                    {item.name}{" "}
                    <span className="text-sm font-normal text-muted">({item.gameCount} games)</span>
                  </span>
                  <select name="categoryId" required defaultValue="" className={inputClass}>
                    <option value="" disabled>
                      Choose a category...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                key={m.provider_category}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <span>
                  <span className="font-medium">{m.provider_category}</span>
                  <span className="text-muted"> &rarr; </span>
                  {m.categories?.name ?? m.category_id}
                </span>
                <form action={deleteCategoryMapping}>
                  <input type="hidden" name="provider" value={current.provider} />
                  <input type="hidden" name="providerCategory" value={m.provider_category} />
                  <button type="submit" className={buttonClass + " text-danger"}>
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted">
          Deleting a mapping does not change games that already got their category from it.
        </p>
      </section>
    </div>
  );
}
