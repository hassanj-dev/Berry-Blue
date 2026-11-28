// Run from the Portal root:  node scripts/patch-card-sizes.mjs
// The card is portrait (4:5) and the image is cover-fitted, so a 16:9 image is drawn about
// 2.2x wider than the card. `sizes` must describe that drawn width, or Next.js serves a
// small file that the browser stretches (blurry). Safe to run twice.
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/web/components/game/GameCard.tsx";
const text = readFileSync(file, "utf8");

const oldSizes = 'sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, 78vw"';
const newSizes = 'sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 62vw, 175vw"';

if (text.includes(newSizes)) {
  console.log("already patched");
  process.exit(0);
}
if (!text.includes(oldSizes)) {
  console.error("Could not find the sizes line in " + file + ". Send me the file.");
  process.exit(1);
}
writeFileSync(file, text.replace(oldSizes, newSizes));
console.log("patched", file);
