import type { SupabaseClient } from "@supabase/supabase-js";
import { createSecretClient } from "./supabase";

const PAGE_SIZE = 1000;
const CONCURRENCY = 5;
const TIMEOUT_MS = 10_000;
// A game counts as flagged after this many failed checks in a row. The admin app shows the flag.
const FLAGGED_AFTER = 3;

type GameRow = { id: string; slug: string; embed_url: string };

type CheckResult =
  | { kind: "ok"; status: number }
  | { kind: "fail"; status: number | null; error: string }
  | { kind: "skip"; reason: string };

async function listPublishedGames(supabase: SupabaseClient): Promise<GameRow[]> {
  const games: GameRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("games")
      .select("id, slug, embed_url")
      .eq("is_published", true)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`listPublishedGames failed: ${error.message}`);
    games.push(...(data as GameRow[]));
    if (data.length < PAGE_SIZE) break;
  }

  return games;
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.name === "TimeoutError") return "timed out";
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause as { code?: string; errors?: { code?: string }[] } | undefined;
  const code = cause?.code ?? cause?.errors?.[0]?.code;
  return code ? error.message + " (" + code + ")" : error.message;
}

async function checkGame(game: GameRow, base: URL | null): Promise<CheckResult> {
  const isAbsolute = /^https?:\/\//i.test(game.embed_url);
  if (!isAbsolute && !base) {
    return { kind: "skip", reason: "relative embed URL and WEB_BASE_URL is not set" };
  }

  let url: URL;
  try {
    url = new URL(game.embed_url, base ?? undefined);
  } catch {
    return { kind: "fail", status: null, error: "invalid embed URL" };
  }

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "BerryBlueHealthCheck/1.0" },
    });
    // We only need the headers, so do not download the page.
    await response.body?.cancel();

    if (!response.ok) {
      return { kind: "fail", status: response.status, error: `HTTP ${response.status}` };
    }

    const frameOptions = response.headers.get("x-frame-options")?.trim().toLowerCase();
    const sameOrigin = base !== null && new URL(response.url).origin === base.origin;
    if (frameOptions === "deny" || (frameOptions === "sameorigin" && !sameOrigin)) {
      return {
        kind: "fail",
        status: response.status,
        error: `blocks embedding (X-Frame-Options: ${frameOptions})`,
      };
    }

    return { kind: "ok", status: response.status };
  } catch (error) {
    return { kind: "fail", status: null, error: describeError(error) };
  }
}

async function main() {
  const rawBase = process.env.WEB_BASE_URL;
  const base = rawBase ? new URL(rawBase) : null;

  const supabase = createSecretClient();
  const games = await listPublishedGames(supabase);

  if (games.length === 0) {
    console.log("No published games to check.");
    return;
  }

  const failures: { slug: string; error: string; failedInARow: number }[] = [];
  const skipReasons = new Set<string>();
  let ok = 0;
  let skipped = 0;
  let recordErrors = 0;
  let next = 0;

  async function runner() {
    while (true) {
      const game = games[next];
      next += 1;
      if (!game) return;

      const result = await checkGame(game, base);

      if (result.kind === "skip") {
        skipped += 1;
        skipReasons.add(result.reason);
        continue;
      }

      const { data, error } = await supabase.rpc("record_health_check", {
        p_game_id: game.id,
        p_ok: result.kind === "ok",
        p_http_status: result.status,
        p_error: result.kind === "fail" ? result.error : null,
      });

      if (error) {
        recordErrors += 1;
        console.error(`Could not record the result for "${game.slug}": ${error.message}`);
        continue;
      }

      if (result.kind === "ok") ok += 1;
      else failures.push({ slug: game.slug, error: result.error, failedInARow: Number(data) });
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, games.length) }, runner));

  console.log("Health check finished");
  console.table({
    published: games.length,
    ok,
    failing: failures.length,
    flagged: failures.filter((f) => f.failedInARow >= FLAGGED_AFTER).length,
    skipped,
  });

  if (failures.length > 0) {
    console.log("Failing games:");
    console.table(failures);
  }
  for (const reason of skipReasons) console.log(`Skipped: ${reason}`);

  // Failing games are normal data, not a script error. Only exit with 1 if saving results failed.
  if (recordErrors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
