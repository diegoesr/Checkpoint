/** Carrusel home: carátula + metadatos para la UI. */
export type HomeMarqueeGame = {
  id: number;
  src: string;
  name: string;
  href: string;
  rank: number;
  genresLabel: string;
};

const RAWG_BASE = "https://api.rawg.io/api";

/**
 * Petición genérica a RAWG. La clave solo existe en el servidor (.env.local).
 * Documentación: https://api.rawg.io/docs/
 */
async function rawgFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidateSeconds = 3600,
): Promise<T | null> {
  const key = process.env.RAWG_API_KEY;
  if (!key) return null;

  const url = new URL(`${RAWG_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== "") url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) return null;
  return (await res.json()) as T;
}

export type RawgSearchHit = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  metacritic: number | null;
  genres?: { id?: number; name: string; slug?: string }[];
};

export type TrendingGame = RawgSearchHit;

/** Búsquedas para priorizar títulos conocidos (además del feed de tendencia). */
const SPOTLIGHT_SEARCHES = [
  "Fortnite",
  "Crimson Desert",
  "Resident Evil Requiem",
  "Monster Hunter Wilds",
] as const;

/** Máximo de juegos en tendencia (home + /games). */
const TOP_GAMES_LIMIT = 10;

/**
 * Juegos en tendencia (RAWG: orden por recién añadidos/actualizados en su base)
 * + primer resultado de búsquedas destacadas (Fortnite, Crimson Desert, RE, etc.)
 * sin duplicar por id. Requiere RAWG_API_KEY.
 */
export async function getTrendingGamesForDiscovery(
  maxTotal = TOP_GAMES_LIMIT,
): Promise<TrendingGame[]> {
  const key = process.env.RAWG_API_KEY;
  if (!key) return [];

  const [trendingRes, ...spotlightRes] = await Promise.all([
    rawgFetch<{ results?: TrendingGame[] }>(
      "/games",
      {
        page_size: String(Math.min(maxTotal + 8, 40)),
        ordering: "-added",
      },
      900,
    ),
    ...SPOTLIGHT_SEARCHES.map((search) =>
      rawgFetch<{ results?: TrendingGame[] }>(
        "/games",
        { search, page_size: "1" },
        900,
      ),
    ),
  ]);

  const byId = new Map<number, TrendingGame>();

  for (const res of spotlightRes) {
    const g = res?.results?.[0];
    if (g?.id) byId.set(g.id, g);
  }

  for (const g of trendingRes?.results ?? []) {
    if (g?.id && !byId.has(g.id)) byId.set(g.id, g);
  }

  return Array.from(byId.values()).slice(0, maxTotal);
}

export function formatGenresLabel(genres: RawgSearchHit["genres"]): string {
  if (!genres?.length) return "Sin género";
  return genres
    .map((x) => x.name)
    .slice(0, 2)
    .join(" · ");
}

/**
 * Carrusel de la home: misma lista que tendencia; incluye rango (popularidad en la lista) y géneros RAWG.
 */
export async function getHomeMarqueeCovers(): Promise<HomeMarqueeGame[]> {
  const games = await getTrendingGamesForDiscovery();
  const withImage = games.filter((g) => g.background_image);
  return withImage.map((g, index) => ({
    id: g.id,
    src: g.background_image as string,
    name: g.name,
    href: `/games/${g.id}`,
    rank: index + 1,
    genresLabel: formatGenresLabel(g.genres),
  }));
}

/**
 * Búsqueda por texto (para /search, autocompletado en servidor, etc.).
 */
export async function searchGames(
  query: string,
  page = 1,
  pageSize = 15,
): Promise<{ results: RawgSearchHit[]; count: number } | null> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], count: 0 };

  const json = await rawgFetch<{
    results?: RawgSearchHit[];
    count?: number;
  }>(
    "/games",
    {
      search: trimmed,
      page: String(page),
      page_size: String(pageSize),
    },
    300,
  );

  if (!json) return null;

  return {
    results: json.results ?? [],
    count: json.count ?? 0,
  };
}

/**
 * Detalle de un juego por id RAWG (ficha, guardar en BD el id + datos locales).
 */
export async function getGameById(gameId: number) {
  return rawgFetch<{
    id: number;
    name: string;
    description_raw: string;
    background_image: string | null;
    released: string | null;
    metacritic: number | null;
    platforms: { platform: { name: string } }[];
    genres: { name: string }[];
  }>(`/games/${gameId}`, {}, 3600);
}
