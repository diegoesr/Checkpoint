export const GAME_PLATFORMS = [
  { id: "pc", label: "PC" },
  { id: "ps5", label: "PlayStation 5" },
  { id: "ps4", label: "PlayStation 4" },
  { id: "xbox_series", label: "Xbox Series X|S" },
  { id: "xbox_one", label: "Xbox One" },
  { id: "switch", label: "Nintendo Switch" },
  { id: "nintendo_other", label: "Nintendo (otra consola)" },
  { id: "mobile", label: "Móvil / tablet" },
  { id: "other", label: "Otra" },
] as const;

export type GamePlatformId = (typeof GAME_PLATFORMS)[number]["id"];

export function isValidGamePlatformId(s: string): s is GamePlatformId {
  return GAME_PLATFORMS.some((p) => p.id === s);
}

export function gamePlatformLabel(
  id: string | null | undefined,
): string | null {
  if (id == null || id === "") return null;
  const p = GAME_PLATFORMS.find((x) => x.id === id);
  return p?.label ?? null;
}
