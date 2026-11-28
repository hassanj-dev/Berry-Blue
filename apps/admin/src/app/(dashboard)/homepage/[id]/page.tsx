import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BannerForm, type BannerDefaults } from "@/components/BannerForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Banner" };

type Props = { params: Promise<{ id: string }> };

export default async function BannerPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !z.uuid().safeParse(id).success) notFound();

  const supabase = createSecretClient();

  const { data: gameRows, error: gamesError } = await supabase
    .from("games")
    .select("id, slug, title")
    .order("title")
    .limit(500);
  if (gamesError) throw new Error(`games list failed: ${gamesError.message}`);
  const games = (gameRows ?? []) as { id: string; slug: string; title: string }[];

  let banner: BannerDefaults = {
    id: "",
    title: "",
    tag: "",
    description: "",
    imageUrl: null,
    gameId: "",
    customLink: "",
    sortOrder: 0,
    isActive: true,
  };

  if (!isNew) {
    const { data, error } = await supabase
      .from("home_banners")
      .select("id, title, tag, description, image_url, link_url, sort_order, is_active")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`banner load failed: ${error.message}`);
    if (!data) notFound();

    // A link like /game/<slug> selects that game in the list; anything else is a custom link.
    const slug = /^\/game\/([a-z0-9-]+)\/?$/.exec(data.link_url as string)?.[1];
    const game = slug ? games.find((g) => g.slug === slug) : undefined;

    banner = {
      id: data.id as string,
      title: data.title as string,
      tag: (data.tag as string | null) ?? "",
      description: (data.description as string | null) ?? "",
      imageUrl: data.image_url as string,
      gameId: game?.id ?? "",
      customLink: game ? "" : (data.link_url as string),
      sortOrder: data.sort_order as number,
      isActive: data.is_active as boolean,
    };
  }

  return (
    <div>
      <PageHeader title={isNew ? "Add banner" : "Edit banner"} />
      <BannerForm banner={banner} games={games} />
    </div>
  );
}
