// Run from the Portal root:  node scripts/patch-worker-auto.mjs
// Makes the worker call the admin app's auto approve right after an import. Safe to run twice.
import { readFileSync, writeFileSync } from "node:fs";

const file = "apps/worker/src/import.ts";
let text = readFileSync(file, "utf8");
const crlf = text.includes("\r\n");
const fix = (s) => (crlf ? s.replace(/\r?\n/g, "\r\n") : s);

if (text.includes("triggerAutoApprove")) {
  console.log("already patched");
  process.exit(0);
}

const edits = [
  [
    'import { createSupabaseStagingStore } from "./staging-store";',
    'import { triggerAutoApprove } from "./auto-approve";\nimport { createSupabaseStagingStore } from "./staging-store";',
  ],
  [
    "  if (result.skipped.length > 0) {",
    "  // Games that pass the moderation rules go to Games > Pending by themselves.\n  await triggerAutoApprove();\n\n  if (result.skipped.length > 0) {",
  ],
];

for (const [from] of edits) {
  const count = text.split(from).length - 1;
  if (count !== 1) {
    console.error(
      `Expected 1 match in ${file}, found ${count} for:\n${from}\nNothing was changed. Send me the file.`,
    );
    process.exit(1);
  }
}
for (const [from, to] of edits) text = text.replace(from, () => fix(to));

writeFileSync(file, text);
console.log("patched", file);
