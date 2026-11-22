import en from "./messages/en.json";

type Messages = typeof en;

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;

export function t(key: MessageKey, values?: Record<string, string | number>): string {
  const found = key
    .split(".")
    .reduce<unknown>((obj, part) => (obj as Record<string, unknown> | undefined)?.[part], en);

  if (typeof found !== "string") return key;
  if (!values) return found;

  return found.replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name] ?? `{${name}}`));
}
