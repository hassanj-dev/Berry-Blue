import { deviceSchema, type Device } from "@berryblue/shared";
import { z } from "zod";

export const SORTS = ["trending", "new", "popular"] as const;
export type SortName = (typeof SORTS)[number];

export const DEVICES = deviceSchema.options;

export const PAGE_SIZE = 12;

export type GamesFilters = {
  category?: string | undefined;
  device?: Device | undefined;
  tag?: string | undefined;
};

// The URL is not trusted: a wrong value becomes the default (or no filter).
const slugParam = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .max(60)
  .optional()
  .catch(undefined);

const querySchema = z.object({
  sort: z.enum(SORTS).catch("popular"),
  page: z.coerce.number().int().min(1).catch(1),
  category: slugParam,
  tag: slugParam,
  device: deviceSchema.optional().catch(undefined),
});

export function parseGamesQuery(params: Record<string, string | string[] | undefined>) {
  return querySchema.parse({
    sort: params.sort,
    page: params.page,
    category: params.category,
    tag: params.tag,
    device: params.device,
  });
}

// Every link on /games is built here, so sort, filters and page always travel together.
export function gamesHref(state: GamesFilters & { sort: SortName; page?: number }) {
  const params = new URLSearchParams();
  params.set("sort", state.sort);
  if (state.category) params.set("category", state.category);
  if (state.device) params.set("device", state.device);
  if (state.tag) params.set("tag", state.tag);
  if (state.page && state.page > 1) params.set("page", String(state.page));
  return "/games?" + params.toString();
}
