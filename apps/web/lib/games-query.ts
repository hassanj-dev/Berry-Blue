import { z } from "zod";

export const SORTS = ["trending", "new", "popular"] as const;
export type SortName = (typeof SORTS)[number];

export const PAGE_SIZE = 12;

// URL se aane wali values par bharosa nahi: ghalat ho to default ban jati hain.
const querySchema = z.object({
  sort: z.enum(SORTS).catch("popular"),
  page: z.coerce.number().int().min(1).catch(1),
});

export function parseGamesQuery(params: Record<string, string | string[] | undefined>) {
  return querySchema.parse({ sort: params.sort, page: params.page });
}
