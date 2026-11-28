import "server-only";
import { revalidatePath } from "next/cache";
import { listAllStaged } from "@/lib/moderation-lists";
import { checkRules, loadRuleContext } from "@/lib/moderation-rules";
import { refreshSite } from "@/lib/refresh-site";
import { createSecretClient } from "@/lib/supabase/secret";

export type AutoApproveResult = { considered: number; approved: number; failed: number };

// Approves every pending game that passes the rules (see moderation-rules.ts). Each one is hidden
// and goes to Games > Pending, so nothing becomes live without you pressing Publish.
// Used by the "Approve all that pass the rules" button and by the worker after an import.
export async function runAutoApprove(adminId: string): Promise<AutoApproveResult> {
  const supabase = createSecretClient();

  const games = await listAllStaged("pending");
  const ctx = await loadRuleContext(games);

  let approved = 0;
  let failed = 0;

  for (const game of games) {
    if (checkRules(game, ctx).length > 0) continue;

    const slug = game.slug as string;
    const { error } = await supabase.rpc("approve_staged_game", {
      p_staged_id: game.id,
      p_category_id: game.category_id as string,
      p_admin_id: adminId,
      p_slug: slug,
    });
    if (error) {
      console.error("auto approve failed:", game.id, error.message);
      failed++;
      continue;
    }
    ctx.usedSlugs.add(slug);

    const { data: marked, error: markError } = await supabase
      .from("games")
      .update({ is_published: false })
      .eq("slug", slug)
      .select("id");
    if (markError || !marked?.length) {
      console.error("could not hide the game after approve:", slug, markError?.message);
      failed++;
      continue;
    }
    approved++;
  }

  revalidatePath("/moderation");
  revalidatePath("/games");
  revalidatePath("/overview");
  await refreshSite(["games"]);

  return { considered: games.length, approved, failed };
}
