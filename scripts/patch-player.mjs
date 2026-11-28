// Run from the Portal root:  node scripts/patch-player.mjs
// Game page poster: show the whole image (no cropping), fill the empty sides with a blurred copy.
// Safe to run twice.
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/web/components/game/GamePlayer.tsx";
let text = readFileSync(file, "utf8");
const eol = text.includes("\r\n") ? "\r\n" : "\n";

if (text.includes("blur-2xl")) {
  console.log("already patched");
  process.exit(0);
}

const blurred = [
  "<Image",
  "              src={thumbnailUrl}",
  '              alt=""',
  '              aria-hidden="true"',
  "              fill",
  '              sizes="64px"',
  '              className="card-thumb scale-125 object-cover opacity-70 blur-2xl"',
  "            />",
  "            <Image",
].join(eol);

const edits = [
  ["<Image", blurred],
  ['className="card-thumb object-cover"', 'className="card-thumb object-contain"'],
];

for (const [from, to] of edits) {
  if (!text.includes(from)) {
    console.error(`NOT FOUND in ${file}:\n  ${from}`);
    process.exit(1);
  }
  text = text.replace(from, to);
}

writeFileSync(file, text);
console.log("patched", file);
