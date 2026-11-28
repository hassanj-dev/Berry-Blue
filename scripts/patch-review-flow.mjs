// Run from the Portal root:  node scripts/patch-review-flow.mjs
// Moderation "Approve" now sends a NEW game to Games > Pending (hidden). Saving an edit moves it
// to Uploaded. Publish makes it live. Needs the needs_review column (see the .sql file).
// Safe to run twice. If a line is not found it stops and changes nothing.
import { readFileSync, writeFileSync } from "node:fs";

function patch(file, edits, marker = "needs_review") {
  let text = readFileSync(file, "utf8");
  const crlf = text.includes("\r\n");
  const fix = (s) => (crlf ? s.replace(/\r?\n/g, "\r\n") : s);

  if (text.includes(marker)) {
    console.log("already patched", file);
    return true;
  }
  for (const [from, to] of edits) {
    const count = text.split(from).length - 1;
    if (count !== 1) {
      console.error(
        `${file}: expected 1 match, found ${count} for:\n${from}\nNothing was changed in this file. Send me the file.`,
      );
      return false;
    }
    text = text.replace(from, () => fix(to));
  }
  writeFileSync(file, text);
  console.log("patched", file);
  return true;
}

const actions = "apps/admin/src/lib/games-actions.ts";
const moderation = "apps/admin/src/lib/moderation-actions.ts";

const ok1 = patch(actions, [
  [
    "  // Refresh in every case so a stale list corrects itself.",
    `  if (!error && parsed.data.published === "true") {
    // Live games are never "Pending".
    await createSecretClient()
      .from("games")
      .update({ needs_review: false })
      .eq("id", parsed.data.gameId);
  }

  // Refresh in every case so a stale list corrects itself.`,
  ],
  [
    "  if (newThumbnail && newThumbnail !== current.thumbnail_url) {",
    `  // Saving an edit takes a game out of Pending (it is then under Uploaded).
  const { error: reviewError } = await supabase
    .from("games")
    .update({ needs_review: false })
    .eq("id", input.gameId);
  if (reviewError) console.error("needs_review update failed:", reviewError.message);

  if (newThumbnail && newThumbnail !== current.thumbnail_url) {`,
  ],
]);

const ok2 = patch(moderation, [
  [
    'import { createSecretClient } from "@/lib/supabase/secret";',
    `import { getStaged } from "@/lib/moderation";
import { refreshSite } from "@/lib/refresh-site";
import { createSecretClient } from "@/lib/supabase/secret";`,
  ],
  [
    '  const { error } = await createSecretClient().rpc("approve_staged_game", {',
    `  const supabase = createSecretClient();

  // A game that is already in our list is an update and stays as it is. Only a brand-new game
  // goes to Pending: hidden until it is edited in Games and published.
  const staged = await getStaged(parsed.data.stagedId);
  let isNew = false;
  if (staged) {
    const { data: existing } = await supabase
      .from("games")
      .select("id")
      .eq("provider", staged.provider)
      .eq("provider_game_id", staged.provider_game_id)
      .maybeSingle();
    isNew = !existing;
  }

  const { error } = await supabase.rpc("approve_staged_game", {`,
  ],
  [
    "  // The database function explains itself (for example: slug already used by another game).",
    `  if (!error) {
    revalidatePath("/games");
    if (isNew) {
      const { data: marked, error: markError } = await supabase
        .from("games")
        .update({ is_published: false, needs_review: true })
        .eq("slug", parsed.data.slug)
        .select("id");
      await refreshSite(["games"]);
      if (markError || !marked?.length) {
        console.error("could not mark the game as pending:", markError?.message);
        return {
          error: "Approved, but it could not be set to Pending. Check it in Games before it stays live.",
        };
      }
    }
  }

  // The database function explains itself (for example: slug already used by another game).`,
  ],
]);

const reviewForm = "apps/admin/src/app/(dashboard)/moderation/[id]/ReviewForm.tsx";
const reviewPage = "apps/admin/src/app/(dashboard)/moderation/[id]/page.tsx";

const ok3 = patch(
  reviewForm,
  [
    [
      '<h2 className="text-lg font-bold">Approve and publish</h2>',
      `<h2 className="text-lg font-bold">Approve</h2>
        <p className="text-sm text-muted">
          A new game goes to Games, under Pending (hidden). Edit it there, then publish it.
        </p>`,
    ],
    [
      '{approving ? "Publishing..." : "Approve and publish"}',
      '{approving ? "Approving..." : "Approve"}',
    ],
  ],
  "under Pending",
);

const ok4 = patch(
  reviewPage,
  [
    [
      "<strong>New game.</strong> It is not on the site yet.",
      "<strong>New game.</strong> It is not on the site yet. After you approve it, it goes to Games\n              under Pending.",
    ],
  ],
  "under Pending",
);

if (!ok1 || !ok2 || !ok3 || !ok4) process.exit(1);
