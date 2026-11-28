// Run from the Portal root:  node scripts/patch-player-size.mjs [width]
// Caps the player (box + buttons) at `width` px on desktop, left aligned. The box stays
// 16:9, so a 16:9 image shows in full: no bars, no crop. Default width is 1100.
//   node scripts/patch-player-size.mjs 1000   smaller
//   node scripts/patch-player-size.mjs 1200   bigger
// Running it again with another number just changes the number.
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/web/components/game/GamePlayer.tsx";
const width = Number(process.argv[2] ?? 1100);
if (!Number.isInteger(width) || width < 400 || width > 2000) {
  console.error("Width must be a whole number of pixels between 400 and 2000, e.g. 1100.");
  process.exit(1);
}

let text = readFileSync(file, "utf8");
const cls = `lg:max-w-[${width}px]`;

const existing = /<div className="lg:max-w-\[\d+px\]">/;
if (existing.test(text)) {
  text = text.replace(existing, `<div className="${cls}">`);
} else {
  const bare = /<div>(\s*)\{notice\}/;
  if (!bare.test(text)) {
    console.error(`Could not find the player's outer <div> in ${file}. Send me the file.`);
    process.exit(1);
  }
  text = text.replace(bare, `<div className="${cls}">$1{notice}`);
}
writeFileSync(file, text);
console.log(`player capped at ${width}px:`, file);
