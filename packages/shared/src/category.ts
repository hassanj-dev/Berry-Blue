import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(60),
});

export type Category = z.infer<typeof categorySchema>;
