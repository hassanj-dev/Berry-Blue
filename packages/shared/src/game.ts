import { z } from "zod";

export const deviceSchema = z.enum(["mobile", "tablet", "desktop"]);

export const providerSchema = z.enum([
  "self-hosted",
  "direct",
  "gamedistribution",
  "gamezop",
  "playgama",
]);

export const gameSchema = z.object({
  id: z.uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  title: z.string().min(1).max(100),
  description: z.string().max(2000).default(""),
  thumbnailUrl: z.url(),
  embedUrl: z.url(),
  categorySlug: z.string().min(1),
  tags: z.array(z.string()).default([]),
  devices: z.array(deviceSchema).min(1),
  provider: providerSchema,
  createdAt: z.iso.datetime(),
});

export type Game = z.infer<typeof gameSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type Provider = z.infer<typeof providerSchema>;
