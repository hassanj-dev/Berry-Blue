import "server-only";
import { liveGameKeys } from "@/lib/diff";
import { formatValidationErrors, type StagedGame } from "@/lib/moderation";
import { createSecretClient } from "@/lib/supabase/secret";

// ---------------------------------------------------------------------------------------------
// MODERATION RULES. A pending game that passes every rule below can be approved automatically
// (it then lands in Games > Pending, hidden). A game that breaks one stays in Moderation.
// To change the rules, edit the checks in checkRules() or the word lists below.
// Each failed check is shown on the game.
// ---------------------------------------------------------------------------------------------

export const RULE_DESCRIPTIONS = [
  "No validation errors from the import",
  "Has a game link (embed)",
  "Its category is mapped to one of ours",
  "Has a valid slug that no other game uses",
  "Is a new game (updates of games already on the site always need a manual look)",
  "No sexual, offensive, hateful or extreme words in the title, description, tags or category",
];

// ---------------------------------------------------------------------------------------------
// WORD LISTS. A word list only reads what is WRITTEN. It cannot see a picture or play a game, so
// it is a safety net, not a guarantee. A match never rejects a game: it only keeps it in
// Moderation for a manual look (and you still see the thumbnail before you press Publish).
//
//   words  = matched as whole words only ("sex" does not match "Essex").
//   inside = matched anywhere inside a word ("porn" also matches "pornhub").
//
// Add or remove words freely. Spellings like "s3x" or "sh1t" are caught too.
// ---------------------------------------------------------------------------------------------

type WordGroup = { label: string; words: string[]; inside?: string[] };

const GROUPS: WordGroup[] = [
  {
    label: "sexual content",
    words: [
      "sex",
      "sexy",
      "sexual",
      "sexually",
      "nude",
      "nudes",
      "nudity",
      "naked",
      "erotic",
      "fetish",
      "stripper",
      "striptease",
      "lingerie",
      "onlyfans",
      "escort",
      "milf",
      "boob",
      "boobs",
      "tits",
      "nipple",
      "nipples",
      "penis",
      "vagina",
      "dildo",
      "blowjob",
      "masturbate",
      "masturbation",
      "horny",
      "orgy",
      "slut",
      "whore",
      "prostitute",
      "cum",
      "anal",
      "18+",
      "adult",
      "adults only",
    ],
    inside: ["porn", "hentai", "nsfw", "xxx"],
  },
  {
    label: "offensive language",
    words: ["shit", "shitty", "bitch", "asshole", "bastard", "motherfucker"],
    inside: ["fuck", "cunt"],
  },
  {
    label: "hate speech",
    words: [
      "faggot",
      "fag",
      "fags",
      "retard",
      "retarded",
      "tranny",
      "chink",
      "spic",
      "kike",
      "gook",
      "wetback",
      "paki",
      "kkk",
      "nazi",
      "nazis",
      "heil",
      "white power",
    ],
    inside: ["nigg"],
  },
  {
    label: "violence or abuse",
    words: [
      "rape",
      "raped",
      "rapist",
      "molest",
      "pedophile",
      "paedophile",
      "pedo",
      "incest",
      "bestiality",
      "necrophilia",
      "gore",
      "beheading",
      "suicide",
    ],
  },
  {
    label: "drugs",
    words: ["cocaine", "heroin", "meth"],
  },
];

const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const COMPILED = GROUPS.map((group) => {
  const parts: string[] = [];
  if (group.words.length > 0) {
    parts.push(`(?<![a-z0-9])(?:${group.words.map(escape).join("|")})(?![a-z0-9])`);
  }
  if (group.inside?.length) {
    parts.push(`(?:${group.inside.map(escape).join("|")})`);
  }
  return { label: group.label, pattern: new RegExp(parts.join("|"), "i") };
});

// "s3x" -> "sex", "sh1t" -> "shit", "p0rn" -> "porn"
const LEET: Record<string, string> = {
  "@": "a",
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  $: "s",
};
const unleet = (text: string) => text.replace(/[@01345$]/g, (c) => LEET[c] ?? c);

// Never show the bad word itself on the page: "n****".
const mask = (word: string) => word.charAt(0) + "*".repeat(Math.max(word.length - 1, 1));

function searchText(game: StagedGame): string {
  return [
    game.title ?? "",
    game.description ?? "",
    game.slug ?? "",
    game.provider_category ?? "",
    ...game.tags,
  ]
    .join(" ")
    .toLowerCase();
}

function flaggedWordIn(game: StagedGame): string | null {
  const text = searchText(game);
  const variants = [text, unleet(text)];

  for (const { label, pattern } of COMPILED) {
    for (const variant of variants) {
      const match = pattern.exec(variant);
      if (match) return `possible ${label} (${mask(match[0])})`;
    }
  }
  return null;
}

// True when a sexual word is written in the title, description, tags or category.
// Moderation shows these games in their own "Sexual" tab.
export function isSexual(game: StagedGame): boolean {
  const group = COMPILED.find((g) => g.label === "sexual content");
  if (!group) return false;
  const text = searchText(game);
  return group.pattern.test(text) || group.pattern.test(unleet(text));
}

export type RuleContext = {
  usedSlugs: Set<string>;
  liveKeys: Set<string>;
};

export async function loadRuleContext(games: StagedGame[]): Promise<RuleContext> {
  const { data, error } = await createSecretClient().from("games").select("slug").limit(10000);
  if (error) throw new Error(`rule context failed: ${error.message}`);

  return {
    usedSlugs: new Set((data ?? []).map((row) => row.slug as string)),
    liveKeys: await liveGameKeys(games),
  };
}

// Returns the reasons why this game must be checked by hand. An empty list means it passes.
export function checkRules(game: StagedGame, ctx: RuleContext): string[] {
  const problems: string[] = [];

  if (formatValidationErrors(game.validation_errors).length > 0) {
    problems.push("has validation errors");
  }
  if (!game.embed_url || !game.embed_url.trim()) problems.push("no game link");
  if (!game.category_id) problems.push("category not mapped");

  if (!game.slug || !/^[a-z0-9-]+$/.test(game.slug)) {
    problems.push("bad or missing slug");
  } else if (ctx.usedSlugs.has(game.slug)) {
    problems.push("slug already used");
  }

  if (ctx.liveKeys.has(game.provider + ":" + game.provider_game_id)) {
    problems.push("update of a game already on the site");
  }

  const flagged = flaggedWordIn(game);
  if (flagged) problems.push(flagged);

  return problems;
}
