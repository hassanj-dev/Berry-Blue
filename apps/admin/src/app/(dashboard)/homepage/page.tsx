import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { deleteBanner, setBannerActive } from "@/lib/banners-actions";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Homepage banners" };

type BannerRow = {
  id: string;
  title: string;
  tag: string | null;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
};

export default async function HomepageBannersPage() {
  await requireAdmin();

  const { data, error } = await createSecretClient()
    .from("home_banners")
    .select("id, title, tag, image_url, link_url, sort_order, is_active")
    .order("sort_order")
    .order("created_at");

  if (error) throw new Error(`banners list failed: ${error.message}`);
  const banners = (data ?? []) as BannerRow[];

  return (
    <div>
      <PageHeader
        title={`Homepage banners (${banners.length})`}
        description="The slider at the top of the home page. With no active banner, the site shows trending games instead."
        actions={
          <Link
            href="/homepage/new"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Add banner
          </Link>
        }
      />

      {banners.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No banners yet.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {banners.map((banner) => (
            <li key={banner.id}>
              <Card className="flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image_url}
                  alt=""
                  className="aspect-[2/1] w-40 rounded-xl border border-border object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{banner.title}</span>
                  <span className="truncate text-sm text-muted">
                    {banner.tag ? `${banner.tag} · ` : ""}
                    {banner.link_url} · order {banner.sort_order}
                  </span>
                  <span className={"text-sm " + (banner.is_active ? "" : "text-danger")}>
                    {banner.is_active ? "Showing" : "Hidden"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/homepage/${banner.id}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-border px-4 text-sm hover:border-brand"
                  >
                    Edit
                  </Link>
                  <form action={setBannerActive}>
                    <input type="hidden" name="bannerId" value={banner.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={banner.is_active ? "false" : "true"}
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      {banner.is_active ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <form action={deleteBanner}>
                    <input type="hidden" name="bannerId" value={banner.id} />
                    <ConfirmButton
                      message={`Delete the banner "${banner.title}"?`}
                      className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-danger px-4 text-sm text-danger hover:bg-danger/10"
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
