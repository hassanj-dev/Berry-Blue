import { runImport, type ProviderAdapter } from "@berryblue/provider-core";
import { createSelfHostedAdapter } from "@berryblue/provider-self-hosted";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSecretClient } from "./supabase";
import { createSupabaseStagingStore } from "./staging-store";

// When a new provider is added, only one line is added here.
const adapters: Record<string, () => ProviderAdapter> = {
  "self-hosted": () => createSelfHostedAdapter(),
};

async function assertProviderActive(supabase: SupabaseClient, provider: string) {
  const { data, error } = await supabase
    .from("providers")
    .select("status")
    .eq("provider", provider)
    .maybeSingle();

  if (error) throw new Error(`Could not check provider "${provider}": ${error.message}`);
  if (!data) throw new Error(`Provider "${provider}" is not registered in the providers table.`);
  if (data.status !== "active") {
    throw new Error(
      `Provider "${provider}" is ${data.status}. Imports are blocked until it is reconnected.`,
    );
  }
}

async function main() {
  const name = process.argv[2] ?? "self-hosted";
  const makeAdapter = adapters[name];

  if (!makeAdapter) {
    console.error(`Unknown provider "${name}". Available: ${Object.keys(adapters).join(", ")}`);
    process.exit(1);
  }

  const supabase = createSecretClient();
  await assertProviderActive(supabase, name);

  const store = createSupabaseStagingStore(supabase);
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
