import { deviceSchema, urlOrPathSchema } from "@berryblue/shared";
import { z } from "zod";
import type { GameDraft } from "./types";

// Wohi rules jo live catalog (gameSchema) ke hain, magar id/category/createdAt ke bagair.
const validGameSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only")
    .max(100),
  title: z.string().trim().min(1).max(100),
  description: z.string().max(2000).default(""),
  thumbnailUrl: urlOrPathSchema,
  embedUrl: urlOrPathSchema,
  tags: z.array(z.string().min(1)).default([]),
  devices: z.array(deviceSchema).min(1),
});

export type ValidGame = z.output<typeof validGameSchema>;
export type ValidationIssue = { path: string; message: string };

export type ValidationResult =
  { ok: true; data: ValidGame } | { ok: false; errors: ValidationIssue[] };

export function validateDraft(draft: GameDraft): ValidationResult {
  const result = validGameSchema.safeParse(draft);

  if (result.success) return { ok: true, data: result.data };

  return {
    ok: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}
