import { runImport, type ProviderAdapter } from "@berryblue/provider-core";
import { createSelfHostedAdapter } from "@berryblue/provider-self-hosted";
import { createSecretClient } from "./supabase";
import { createSupabaseStagingStore } from "./staging-store";

// Naya provider aaye to bas yahan ek line barhegi.
const adapters: Record<string, () => ProviderAdapter> = {
  "self-hosted": () => createSelfHostedAdapter(),
};

async function main() {
  const name = process.argv[2] ?? "self-hosted";
  const makeAdapter = adapters[name];

  if (!makeAdapter) {
    console.error(`Unknown provider "${name}". Available: ${Object.keys(adapters).join(", ")}`);
    process.exit(1);
  }

  const store = createSupabaseStagingStore(createSecretClient());
  const result = await runImport(makeAdapter(), store);

  console.log(`Import finished (batch ${result.batchId})`);
  console.table(result.stats);

  if (result.skipped.length > 0) {
    console.log("Skipped before staging:");
    console.table(result.skipped);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
