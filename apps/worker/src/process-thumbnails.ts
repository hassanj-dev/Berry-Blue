import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { createSecretClient } from "./supabase";

const BUCKET = "thumbnails";
const WIDTH = 400;
const HEIGHT = 300;
const PAGE_SIZE = 1000;
const CONCURRENCY = 3;
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;
// After this many failed attempts for the same source URL the job stops trying.
const MAX_FAILURES = 3;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

type ThumbnailRecord = {
  source_url: string;
  webp_url: string | null;
  avif_url: string | null;
  failure_count: number;
};

type GameRow = {
  id: string;
  slug: string;
  thumbnail_url: string;
  game_thumbnails: ThumbnailRecord | ThumbnailRecord[] | null;
};

type Outcome = "processed" | "reapplied" | "skipped";

// --- Safe download -------------------------------------------------------------------------

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a = 0, b = 0] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }

  const v6 = address.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  if (v6.startsWith("::ffff:")) {
    const rest = v6.slice(7);
    return isIP(rest) === 4 ? isPrivateAddress(rest) : true;
  }
  return /^(fc|fd|fe[89ab])/.test(v6);
}

// Only public https addresses. Checked again for every redirect.
async function assertPublicUrl(url: URL) {
  if (url.protocol !== "https:") throw new Error("only https thumbnails are allowed");

  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });

  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("the address is not a public one");
  }
}

async function readLimited(response: Response): Promise<Buffer> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("empty response");

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new Error("image is larger than 5 MB");
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

async function downloadImage(source: string): Promise<Buffer> {
  const deadline = AbortSignal.timeout(TIMEOUT_MS);
  let url = new URL(source);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublicUrl(url);

    const response = await fetch(url, {
      redirect: "manual",
      signal: deadline,
      headers: { "user-agent": "BerryBlueThumbnails/1.0", accept: "image/*" },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("redirect without a location");
      url = new URL(location, url);
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`HTTP ${response.status}`);
    }

    const type = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!ALLOWED_TYPES.has(type)) {
      await response.body?.cancel();
      throw new Error(`not an allowed image type (${type || "none"})`);
    }

    if (Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) {
      await response.body?.cancel();
      throw new Error("image is larger than 5 MB");
    }

    return readLimited(response);
  }

  throw new Error("too many redirects");
}

// --- Storage -------------------------------------------------------------------------------

async function convert(input: Buffer) {
  const base = sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: "cover" });

  const [webp, avif] = await Promise.all([
    base.clone().webp({ quality: 80 }).toBuffer(),
    base.clone().avif({ quality: 50 }).toBuffer(),
  ]);

  return { webp, avif };
}

async function upload(supabase: SupabaseClient, path: string, body: Buffer, contentType: string) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType,
    // The file name contains a hash of the source image, so a file never changes.
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`upload failed: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best effort: delete older files of this game. A failure here is only a warning.
async function removeOldFiles(supabase: SupabaseClient, gameId: string, keep: string[]) {
  const folder = `games/${gameId}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(folder);
  if (error || !data) return;

  const stale = data.map((file) => `${folder}/${file.name}`).filter((path) => !keep.includes(path));
  if (stale.length === 0) return;

  const { error: removeError } = await supabase.storage.from(BUCKET).remove(stale);
  if (removeError) console.warn(`Could not remove old files of ${gameId}: ${removeError.message}`);
}

// --- Job -----------------------------------------------------------------------------------

function recordOf(game: GameRow): ThumbnailRecord | null {
  return Array.isArray(game.game_thumbnails)
    ? (game.game_thumbnails[0] ?? null)
    : game.game_thumbnails;
}

async function listCandidates(supabase: SupabaseClient, ownPrefix: string): Promise<GameRow[]> {
  const games: GameRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("games")
      .select(
        "id, slug, thumbnail_url, game_thumbnails(source_url, webp_url, avif_url, failure_count)",
      )
      .like("thumbnail_url", "http%")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`listCandidates failed: ${error.message}`);
    games.push(...(data as unknown as GameRow[]));
    if (data.length < PAGE_SIZE) break;
  }

  return games.filter((game) => !game.thumbnail_url.startsWith(ownPrefix));
}

async function record(
  supabase: SupabaseClient,
  game: GameRow,
  webpUrl: string | null,
  avifUrl: string | null,
  error: string | null,
) {
  const { error: rpcError } = await supabase.rpc("record_thumbnail", {
    p_game_id: game.id,
    p_source_url: game.thumbnail_url,
    p_webp_url: webpUrl,
    p_avif_url: avifUrl,
    p_error: error,
  });
  if (rpcError) throw new Error(`record_thumbnail failed: ${rpcError.message}`);
}

async function handle(supabase: SupabaseClient, game: GameRow): Promise<Outcome> {
  const existing = recordOf(game);
  const sameSource = existing?.source_url === game.thumbnail_url;

  // Already processed earlier, but an approval put the provider's URL back: reuse the stored files.
  if (sameSource && existing?.webp_url && existing.avif_url) {
    await record(supabase, game, existing.webp_url, existing.avif_url, null);
    return "reapplied";
  }

  if (sameSource && existing && existing.failure_count >= MAX_FAILURES) return "skipped";

  const input = await downloadImage(game.thumbnail_url);
  const { webp, avif } = await convert(input);

  const hash = createHash("sha256").update(input).digest("hex").slice(0, 12);
  const webpPath = `games/${game.id}/${hash}-${WIDTH}x${HEIGHT}.webp`;
  const avifPath = `games/${game.id}/${hash}-${WIDTH}x${HEIGHT}.avif`;

  const webpUrl = await upload(supabase, webpPath, webp, "image/webp");
  const avifUrl = await upload(supabase, avifPath, avif, "image/avif");

  await record(supabase, game, webpUrl, avifUrl, null);
  await removeOldFiles(supabase, game.id, [webpPath, avifPath]);
  return "processed";
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main() {
  const supabase = createSecretClient();

  // Public URL prefix of our own files: games that already use it do not need work.
  const ownPrefix = supabase.storage.from(BUCKET).getPublicUrl("x").data.publicUrl.slice(0, -1);
  const games = await listCandidates(supabase, ownPrefix);

  if (games.length === 0) {
    console.log("No thumbnails to process.");
    return;
  }

  const counts: Record<Outcome | "failed", number> = {
    processed: 0,
    reapplied: 0,
    skipped: 0,
    failed: 0,
  };
  const failures: { slug: string; error: string }[] = [];
  let recordErrors = 0;
  let next = 0;

  async function runner() {
    while (true) {
      const game = games[next];
      next += 1;
      if (!game) return;

      try {
        counts[await handle(supabase, game)] += 1;
      } catch (error) {
        const message = describeError(error);
        counts.failed += 1;
        failures.push({ slug: game.slug, error: message });

        try {
          await record(supabase, game, null, null, message);
        } catch (recordError) {
          recordErrors += 1;
          console.error(describeError(recordError));
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, games.length) }, runner));

  console.log("Thumbnail job finished");
  console.table({ candidates: games.length, ...counts });

  if (failures.length > 0) {
    console.log("Failed:");
    console.table(failures);
  }

  // A failed download is normal data. Only exit with 1 if the results could not be saved.
  if (recordErrors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
