import { readFile } from "node:fs/promises";
import type { ProviderAdapter } from "@berryblue/provider-core";

// Hamare apne games ki feed (JSON). Feed ki shakal hamari apni hai, isay badalna aasan hai.
type SelfHostedItem = {
  id?: unknown;
  name?: string;
  summary?: string;
  thumbnail?: string;
  url?: string;
  category?: string;
  tags?: string[];
  devices?: string[];
};

const DEFAULT_FEED = new URL("../feed/games.json", import.meta.url);

export function createSelfHostedAdapter(feed: URL | string = DEFAULT_FEED): ProviderAdapter {
  return {
    provider: "self-hosted",

    async fetchCatalog() {
      const data: unknown = JSON.parse(await readFile(feed, "utf8"));
      if (!Array.isArray(data)) throw new Error("self-hosted feed must be a JSON array");
      return data;
    },

    toInternal(raw) {
      const item = raw as SelfHostedItem | null;
      if (!item || typeof item !== "object" || typeof item.id !== "string") {
        throw new Error("feed item has no string id");
      }

      return {
        providerGameId: item.id,
        slug: item.id, // self-hosted games ki id hi unka slug hai
        title: item.name,
        description: item.summary,
        thumbnailUrl: item.thumbnail,
        embedUrl: item.url,
        providerCategory: item.category,
        tags: item.tags,
        devices: item.devices,
      };
    },
  };
}
