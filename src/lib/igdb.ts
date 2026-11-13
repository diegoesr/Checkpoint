/**
 * Cliente de IGDB (https://api-docs.igdb.com). Solo servidor: las credenciales
 * de Twitch nunca llegan al navegador.
 *
 * Variables de entorno (.env.local):
 *   IGDB_CLIENT_ID      → Client ID de tu app en https://dev.twitch.tv/console
 *   IGDB_CLIENT_SECRET  → Client Secret de esa misma app
 *
 * IGDB solo acepta POST con consultas "Apicalypse". Las respuestas se cachean con
 * `unstable_cache` (el Data Cache de fetch no está pensado para POST).
 */
import { unstable_cache } from "next/cache";

const IGDB_BASE = "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_TIMEOUT_MS = 6000;
/** IGDB permite 4 peticiones/s y 8 abiertas a la vez; nos quedamos en 4 simultáneas. */
const MAX_CONCURRENT = 4;
const TOP_GAMES_LIMIT = 10;

// ---------------------------------------------------------------------------
// Tipos públicos (normalizados para la UI)
// ---------------------------------------------------------------------------

export type GameGenre = { id?: number; name: string };

export type GameSearchHit = {
  id: number;
  name: string;
  slug: string | null;
  /** Carátula vertical (portada oficial). Es la que se guarda en BD. */
  background_image: string | null;
  /** Imagen horizontal (artwork o captura) para cabeceras y tarjetas anchas. */
  hero_image: string | null;
  /** Fecha de lanzamiento YYYY-MM-DD. */
  released: string | null;
  /** Nota media de la crítica (0–100), si existe. */
  rating: number | null;
  genres?: GameGenre[];
};

export type TrendingGame = GameSearchHit;

export type GameDetail = GameSearchHit & {
  description: string | null;
  platforms: string[];
  /** Ficha pública en igdb.com. */
  url: string | null;
};

/** Carrusel home: carátula + metadatos para la UI. */
export type HomeMarqueeGame = {
  id: number;
  src: string;
  name: string;
  href: string;
  rank: number;
  genresLabel: string;
};

// ---------------------------------------------------------------------------
// Configuración, token y límite de concurrencia
// ---------------------------------------------------------------------------

export function isIgdbConfigured(): boolean {
  return Boolean(process.env.IGDB_CLIENT_ID && process.env.IGDB_CLIENT_SECRET);
}

let tokenCache: { value: string; expiresAt: number } | null = null;
let tokenPromise: Promise<string> | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;
  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    const url = new URL(TWITCH_TOKEN_URL);
    url.searchParams.set("client_id", process.env.IGDB_CLIENT_ID ?? "");
    url.searchParams.set("client_secret", process.env.IGDB_CLIENT_SECRET ?? "");
    url.searchParams.set("grant_type", "client_credentials");

    const res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(IGDB_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Twitch OAuth ${res.status}`);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    // Renovar un minuto antes de que caduque (dura ~60 días).
    tokenCache = {
      value: json.access_token,
      expiresAt: Date.now() + (json.expires_in - 60) * 1000,
    };
    return json.access_token;
  })().finally(() => {
    tokenPromise = null;
  });

  return tokenPromise;
}

let active = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  active++;
  try {
    return await task();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

/**
 * Petición a IGDB. Lanza error si falla (así `unstable_cache` no guarda fallos);
 * las funciones públicas lo capturan y devuelven datos vacíos.
 */
async function igdbQuery<T>(endpoint: string, body: string, retry = true): Promise<T> {
  const token = await getAccessToken();
  const res = await withSlot(() =>
    fetch(`${IGDB_BASE}/${endpoint}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID ?? "",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body,
      signal: AbortSignal.timeout(IGDB_TIMEOUT_MS),
    }),
  );

  if (res.status === 401 && retry) {
    // Token revocado o caducado antes de tiempo: pedir otro una vez.
    tokenCache = null;
    return igdbQuery<T>(endpoint, body, false);
  }
  if (!res.ok) throw new Error(`IGDB ${endpoint} ${res.status}`);
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Normalización
// ---------------------------------------------------------------------------

type IgdbImage = { image_id?: string };

type IgdbGame = {
  id: number;
  name: string;
  slug?: string;
  url?: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  aggregated_rating?: number;
  total_rating?: number;
  cover?: IgdbImage;
  artworks?: IgdbImage[];
  screenshots?: IgdbImage[];
  genres?: { id: number; name: string }[];
  platforms?: { name: string }[];
};

/** https://api-docs.igdb.com/#images */
export function igdbImageUrl(imageId: string, size: string): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

const LIST_FIELDS =
  "fields name,slug,first_release_date,aggregated_rating,total_rating,cover.image_id,artworks.image_id,screenshots.image_id,genres.name;";

function toHit(g: IgdbGame): GameSearchHit {
  const coverId = g.cover?.image_id;
  const heroId = g.artworks?.[0]?.image_id ?? g.screenshots?.[0]?.image_id;
  const rating = g.aggregated_rating ?? g.total_rating;
  return {
    id: g.id,
    name: g.name,
    slug: g.slug ?? null,
    background_image: coverId ? igdbImageUrl(coverId, "cover_big_2x") : null,
    hero_image: heroId
      ? igdbImageUrl(heroId, "1080p")
      : coverId
        ? igdbImageUrl(coverId, "cover_big_2x")
        : null,
    released: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
    rating: rating != null ? Math.round(rating) : null,
    genres: g.genres?.map((x) => ({ id: x.id, name: x.name })),
  };
}

/** Escapa una cadena para usarla entre comillas en Apicalypse. */
function apicalypseString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// ---------------------------------------------------------------------------
// Consultas cacheadas
// ---------------------------------------------------------------------------

const fetchTrending = unstable_cache(
  async (limit: number): Promise<TrendingGame[]> => {
    // Popularidad "visitas en IGDB" (popularity_type = 1).
    const prims = await igdbQuery<{ game_id: number; value: number }[]>(
      "popularity_primitives",
      `fields game_id,value; where popularity_type = 1; sort value desc; limit ${limit * 2};`,
    );
    const ids = [...new Set(prims.map((p) => p.game_id))];

    let games: IgdbGame[] = [];
    if (ids.length > 0) {
      games = await igdbQuery<IgdbGame[]>(
        "games",
        `${LIST_FIELDS} where id = (${ids.join(",")}) & cover != null; limit ${ids.length};`,
      );
      const order = new Map(ids.map((id, i) => [id, i]));
      games.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }

    if (games.length === 0) {
      // Respaldo: lanzamientos de los últimos 6 meses con más valoraciones.
      const now = Math.floor(Date.now() / 1000);
      const sixMonthsAgo = now - 182 * 24 * 3600;
      games = await igdbQuery<IgdbGame[]>(
        "games",
        `${LIST_FIELDS} where first_release_date > ${sixMonthsAgo} & first_release_date < ${now} & cover != null & version_parent = null; sort total_rating_count desc; limit ${limit};`,
      );
    }

    return games.slice(0, limit).map(toHit);
  },
  ["igdb-trending-v1"],
  { revalidate: 900 },
);

const fetchSearch = unstable_cache(
  async (query: string, offset: number, limit: number): Promise<GameSearchHit[]> => {
    const games = await igdbQuery<IgdbGame[]>(
      "games",
      `search ${apicalypseString(query)}; ${LIST_FIELDS} where version_parent = null; limit ${limit}; offset ${offset};`,
    );
    return games.map(toHit);
  },
  ["igdb-search-v1"],
  { revalidate: 300 },
);

const fetchGame = unstable_cache(
  async (gameId: number): Promise<GameDetail | null> => {
    const [g] = await igdbQuery<IgdbGame[]>(
      "games",
      `fields name,slug,url,summary,storyline,first_release_date,aggregated_rating,total_rating,cover.image_id,artworks.image_id,screenshots.image_id,genres.name,platforms.name; where id = ${gameId}; limit 1;`,
    );
    if (!g) return null;
    return {
      ...toHit(g),
      description: g.summary ?? g.storyline ?? null,
      platforms: g.platforms?.map((p) => p.name).filter(Boolean) ?? [],
      url: g.url ?? null,
    };
  },
  ["igdb-game-v1"],
  { revalidate: 3600 },
);

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/** Juegos en tendencia según IGDB (home + /games). */
export async function getTrendingGamesForDiscovery(
  maxTotal = TOP_GAMES_LIMIT,
): Promise<TrendingGame[]> {
  if (!isIgdbConfigured()) return [];
  try {
    return await fetchTrending(maxTotal);
  } catch (err) {
    console.error("[igdb] tendencia:", err);
    return [];
  }
}

export function formatGenresLabel(genres: GameSearchHit["genres"]): string {
  if (!genres?.length) return "Sin género";
  return genres
    .map((x) => x.name)
    .slice(0, 2)
    .join(" · ");
}

/** Carrusel de la home: misma lista que tendencia, con rango y géneros. */
export async function getHomeMarqueeCovers(): Promise<HomeMarqueeGame[]> {
  const games = await getTrendingGamesForDiscovery();
  return games
    .filter((g) => g.hero_image)
    .map((g, index) => ({
      id: g.id,
      src: g.hero_image as string,
      name: g.name,
      href: `/games/${g.id}`,
      rank: index + 1,
      genresLabel: formatGenresLabel(g.genres),
    }));
}

/**
 * Búsqueda por texto (para /search, modales y listas).
 * IGDB no da el total de coincidencias, así que `count` = resultados devueltos.
 */
export async function searchGames(
  query: string,
  page = 1,
  pageSize = 15,
): Promise<{ results: GameSearchHit[]; count: number } | null> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], count: 0 };
  if (!isIgdbConfigured()) return null;

  try {
    const results = await fetchSearch(trimmed, (page - 1) * pageSize, pageSize);
    return { results, count: results.length };
  } catch (err) {
    console.error("[igdb] búsqueda:", err);
    return null;
  }
}

/** Ficha de un juego por id de IGDB. */
export async function getGameById(gameId: number): Promise<GameDetail | null> {
  if (!isIgdbConfigured() || !Number.isInteger(gameId) || gameId <= 0) return null;
  try {
    return await fetchGame(gameId);
  } catch (err) {
    console.error(`[igdb] juego ${gameId}:`, err);
    return null;
  }
}
