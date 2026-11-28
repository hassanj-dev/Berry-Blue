import { z } from "zod";

export const deviceSchema = z.enum(["mobile", "tablet", "desktop"]);

export const providerSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only")
  .min(2)
  .max(40);

// Poora URL (https://...) ya apni site ka raasta (/thumbs/x.svg).
export const urlOrPathSchema = z.union([
  z.url(),
  z.string().regex(/^\/\S*$/, "must be a URL or a path starting with /"),
]);

export const gameSchema = z.object({
  id: z.uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  title: z.string().min(1).max(100),
  description: z.string().max(2000).default(""),
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
  thumbFocusX: z.number().int().min(0).max(100).nullish(),
  thumbnailUrl: urlOrPathSchema,
  embedUrl: urlOrPathSchema,
  categorySlug: z.string().min(1),
  tags: z.array(z.string()).default([]),
  devices: z.array(deviceSchema).min(1),
  provider: providerSchema,
  // Postgres "+00:00" jaisa offset bhejta hai, sirf "Z" nahi.
  createdAt: z.iso.datetime({ offset: true }),
});

export type Game = z.infer<typeof gameSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type Provider = z.infer<typeof providerSchema>;
