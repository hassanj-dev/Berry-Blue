import { z } from "zod";

const publicEnvSchema = z.object({
  url: z.url(),
  publishableKey: z.string().min(1),
});

// NEXT_PUBLIC_ variables must be written out by name, otherwise Next.js does not inline them.
export function getPublicEnv() {
  return publicEnvSchema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
