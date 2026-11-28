// Run from the Portal root:  node scripts/patch-player-169.mjs
// 1. Removes the 70dvh height cap, so the player box is exactly 16:9 (no side bars, no crop).
// 2. Poster `sizes` matched to the real box width (it said 1152px, but the box is ~1440px),
//    so Next.js serves the big file instead of a small one that gets stretched.
// Safe to run twice.
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/web/components/game/GamePlayer.tsx";
let text = readFileSync(file, "utf8");

const edits = [
  ['"rounded-2xl lg:max-h-[70dvh]"', '"rounded-2xl"'],
  ['sizes="(min-width: 1152px) 1152px, 100vw"', 'sizes="(min-width: 1536px) 1600px, 100vw"'],
];

let changed = 0;
for (const [from, to] of edits) {
  if (text.includes(from)) {
    text = text.replace(from, to);
    changed++;
  } else if (!text.includes(to)) {
    console.error(`Could not find: ${from}\nSend me ${file}.`);
    process.exit(1);
  }
}

if (changed === 0) {
  console.log("already patched");
} else {
  writeFileSync(file, text);
  console.log(`patched ${file} (${changed} edit${changed > 1 ? "s" : ""})`);
}
