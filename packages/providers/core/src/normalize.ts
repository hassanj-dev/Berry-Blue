// Normalizes a provider category (lowercase, single spaces). category_mappings stores this same form.
export function normalizeProviderCategory(value: string | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, " ").trim().toLowerCase();
  return normalized ? normalized : undefined;
}
