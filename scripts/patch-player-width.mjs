// Run from the Portal root:  node scripts/patch-player-width.mjs
// Makes the whole player block exactly 16:9 on desktop (centred), so the poster fills it
// with no side bars and no cropping. Safe to run twice.
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/web/components/game/GamePlayer.tsx";
let text = readFileSync(file, "utf8");

if (text.includes("calc(70dvh")) {
  console.log("already patched");
  process.exit(0);
}

const count = text.split("<div>").length - 1;
if (count !== 1) {
  console.error(`Expected exactly one bare <div> in ${file}, found ${count}. Send me the file.`);
  process.exit(1);
}

text = text.replace("<div>", '<div className="lg:mx-auto lg:max-w-[calc(70dvh_*_16_/_9)]">');
writeFileSync(file, text);
console.log("patched", file);
