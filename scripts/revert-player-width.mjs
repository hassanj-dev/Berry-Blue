// Run from the Portal root:  node scripts/revert-player-width.mjs
// Undoes patch-player-width.mjs (puts the player block back to a plain <div>).
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/web/components/game/GamePlayer.tsx";
const text = readFileSync(file, "utf8");
const patched = '<div className="lg:mx-auto lg:max-w-[calc(70dvh_*_16_/_9)]">';

if (!text.includes(patched)) {
  console.log("not patched, nothing to revert");
  process.exit(0);
}
writeFileSync(file, text.replace(patched, "<div>"));
console.log("reverted", file);
