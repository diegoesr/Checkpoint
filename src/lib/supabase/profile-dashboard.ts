import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import {
  getFollowersForUser,
  getFollowingForUser,
  type FriendProfile,
} from "@/lib/supabase/friends";
import type { GameBacklogRow } from "@/lib/supabase/game-backlog";
import { createClient } from "@/lib/supabase/server";

export type ProfileRecord = {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at?: string;
  /** PlayStation Network (ID en línea). */
  psn_id?: string | null;
  xbox_gamertag?: string | null;
  /** Steam: nombre o código de amigo. */
  steam_display?: string | null;
  nintendo_friend_code?: string | null;
  epic_display_name?: string | null;
  /** Battle.net BattleTag (ej. Jugador#1234). */
  battlenet_btag?: string | null;
};

export type ProfileLinkRecord = {
  id: string;
  label: string;
  url: string;
  sort_order: number;
};

export type FavoriteGameRecord = {
  slot: number;
  rawg_id: number;
  game_name: string;
  background_image: string | null;
  /** Reseña más reciente del mismo juego (rawg_id), si existe. */
  review_rating?: number | null;
  /** True si alguna reseña de este juego tiene «me gusta» (corazón). */
  review_liked?: boolean | null;
};

export type GameActivityRecord = {
  id: string;
  rawg_id: number;
  game_name: string;
  background_image: string | null;
  played_at: string;
  note: string | null;
  started_on?: string | null;
  playtime_hours?: number | null;
  platform?: string | null;
};

export type GameReviewRecord = {
  id: string;
  rawg_id: number;
  game_name: string;
  background_image: string | null;
  body: string | null;
  rating: number | null;
  created_at: string;
  started_on?: string | null;
  finished_on?: string | null;
  is_replay?: boolean | null;
  /** Autor marcó que le gustó el juego al publicar la reseña. */
  liked?: boolean | null;
  playtime_hours?: number | null;
  platform?: string | null;
  /** Likes que otros usuarios dieron a esta reseña (`review_likes`). */
  likeCount?: number;
  /** El visitante ya dio like (solo aplica si no eres el autor). */
  likedByViewer?: boolean;
};

export type ProfileDashboardStats = {
  /**
   * Juegos distintos (`rawg_id`) que el usuario ha registrado en la app:
   * actividad «jugando», reseñas, backlog o favoritos (histórico completo, sin límite de año).
   */
  gamesCount: number;
  /** Registros de `game_activity` con `played_at` en el año calendario actual. */
  thisYearGamesCount: number;
};

const RAWG_ID_PAGE_SIZE = 1000;

async function fetchAllRawgIdsForUser(
  supabase: SupabaseClient,
  table:
    | "game_activity"
    | "game_reviews"
    | "game_backlog"
    | "favorite_games",
  userId: string,
): Promise<number[]> {
  const ids: number[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("rawg_id")
      .eq("user_id", userId)
      .range(from, from + RAWG_ID_PAGE_SIZE - 1);
    if (error) {
      break;
    }
    const rows = data ?? [];
    for (const row of rows) {
      const n = Number((row as { rawg_id: unknown }).rawg_id);
      if (Number.isFinite(n)) ids.push(n);
    }
    if (rows.length < RAWG_ID_PAGE_SIZE) break;
    from += RAWG_ID_PAGE_SIZE;
  }
  return ids;
}

/** Cuenta juegos únicos en actividad, reseñas, backlog y favoritos (mismo criterio en todo el historial). */
async function countDistinctRegisteredGames(
  userId: string,
  supabase: SupabaseClient,
): Promise<number> {
  const [activityIds, reviewIds, backlogIds, favoriteIds] = await Promise.all([
    fetchAllRawgIdsForUser(supabase, "game_activity", userId),
    fetchAllRawgIdsForUser(supabase, "game_reviews", userId),
    fetchAllRawgIdsForUser(supabase, "game_backlog", userId),
    fetchAllRawgIdsForUser(supabase, "favorite_games", userId),
  ]);
  return new Set([
    ...activityIds,
    ...reviewIds,
    ...backlogIds,
    ...favoriteIds,
  ]).size;
}

/** Ítem para la rejilla tipo Letterboxd al pulsar «Juegos» / «Este año». */
export type ProfileStatGameGridItem = {
  rawg_id: number;
  game_name: string;
  background_image: string | null;
  rating: number | null;
  liked: boolean;
  is_favorite: boolean;
};

type PaginatedGameTable =
  | "game_activity"
  | "game_reviews"
  | "game_backlog"
  | "favorite_games";

async function paginateTable<T>(
  supabase: SupabaseClient,
  table: PaginatedGameTable,
  userId: string,
  columns: string,
  options?: {
    gte?: { column: string; value: string };
    order?: { column: string; ascending: boolean };
  },
): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  for (;;) {
    let q = supabase.from(table).select(columns).eq("user_id", userId);
    if (options?.gte) {
      q = q.gte(options.gte.column, options.gte.value);
    }
    if (options?.order) {
      q = q.order(options.order.column, {
        ascending: options.order.ascending,
      });
    }
    const { data, error } = await q.range(
      from,
      from + RAWG_ID_PAGE_SIZE - 1,
    );
    if (error) {
      break;
    }
    const rows = (data ?? []) as unknown as T[];
    out.push(...rows);
    if (rows.length < RAWG_ID_PAGE_SIZE) break;
    from += RAWG_ID_PAGE_SIZE;
  }
  return out;
}

async function buildLatestReviewMetaByRawg(
  userId: string,
  supabase: SupabaseClient,
): Promise<Map<number, { rating: number | null; liked: boolean }>> {
  type Row = {
    rawg_id: number;
    rating: number | null;
    liked: boolean | null;
    created_at: string;
  };
  const rows = await paginateTable<Row>(
    supabase,
    "game_reviews",
    userId,
    "rawg_id, rating, liked, created_at",
    { order: { column: "created_at", ascending: false } },
  );
  const map = new Map<number, { rating: number | null; liked: boolean }>();
  for (const r of rows) {
    if (map.has(r.rawg_id)) continue;
    const n = r.rating != null ? Number(r.rating) : null;
    map.set(r.rawg_id, {
      rating: n != null && Number.isFinite(n) && n > 0 ? n : null,
      liked: Boolean(r.liked),
    });
  }
  return map;
}

function mergeNameBg(
  cur: { name: string; bg: string | null },
  name: string | null | undefined,
  bg: string | null | undefined,
) {
  const t = name?.trim() ?? "";
  if (t && (cur.name.startsWith("Juego #") || t.length >= cur.name.length)) {
    cur.name = t;
  }
  if (bg && !cur.bg) cur.bg = bg;
}

/**
 * Juegos para la rejilla del contador del perfil (`all` = mismo criterio que el número «Juegos»;
 * `this_year` = juegos distintos con actividad registrada en el año calendario actual).
 */
export async function getProfileStatGameGridItems(
  userId: string,
  kind: "all" | "this_year",
  client?: SupabaseClient,
): Promise<ProfileStatGameGridItem[]> {
  const supabase = client ?? (await createClient());
  const yearStart = `${new Date().getFullYear()}-01-01T00:00:00.000Z`;
  const reviewMeta = await buildLatestReviewMetaByRawg(userId, supabase);

  type SimpleRow = {
    rawg_id: number;
    game_name: string | null;
    background_image: string | null;
  };

  if (kind === "this_year") {
    type ActRow = SimpleRow & { played_at: string };
    const actRows = await paginateTable<ActRow>(
      supabase,
      "game_activity",
      userId,
      "rawg_id, game_name, background_image, played_at",
      {
        gte: { column: "played_at", value: yearStart },
        order: { column: "played_at", ascending: false },
      },
    );
    const ordered: number[] = [];
    const byId = new Map<number, { name: string; bg: string | null }>();
    const seen = new Set<number>();
    for (const r of actRows) {
      if (seen.has(r.rawg_id)) continue;
      seen.add(r.rawg_id);
      ordered.push(r.rawg_id);
      const name = r.game_name?.trim() || `Juego #${r.rawg_id}`;
      byId.set(r.rawg_id, {
        name,
        bg: r.background_image ?? null,
      });
    }
    const favRows = await paginateTable<{ rawg_id: number }>(
      supabase,
      "favorite_games",
      userId,
      "rawg_id",
      { order: { column: "slot", ascending: true } },
    );
    const favSet = new Set(favRows.map((x) => x.rawg_id));
    return ordered.map((rawg_id) => {
      const v = byId.get(rawg_id)!;
      const m = reviewMeta.get(rawg_id);
      return {
        rawg_id,
        game_name: v.name,
        background_image: v.bg,
        rating: m?.rating ?? null,
        liked: m?.liked ?? false,
        is_favorite: favSet.has(rawg_id),
      };
    });
  }

  const merge = new Map<
    number,
    { name: string; bg: string | null; is_favorite: boolean }
  >();

  function ensure(id: number) {
    if (!merge.has(id)) {
      merge.set(id, {
        name: `Juego #${id}`,
        bg: null,
        is_favorite: false,
      });
    }
    return merge.get(id)!;
  }

  const activityRows = await paginateTable<SimpleRow>(
    supabase,
    "game_activity",
    userId,
    "rawg_id, game_name, background_image",
    { order: { column: "played_at", ascending: false } },
  );
  for (const r of activityRows) {
    mergeNameBg(ensure(r.rawg_id), r.game_name, r.background_image);
  }

  const backlogRows = await paginateTable<SimpleRow>(
    supabase,
    "game_backlog",
    userId,
    "rawg_id, game_name, background_image",
    { order: { column: "created_at", ascending: false } },
  );
  for (const r of backlogRows) {
    mergeNameBg(ensure(r.rawg_id), r.game_name, r.background_image);
  }

  const reviewRows = await paginateTable<SimpleRow>(
    supabase,
    "game_reviews",
    userId,
    "rawg_id, game_name, background_image",
    { order: { column: "created_at", ascending: false } },
  );
  for (const r of reviewRows) {
    mergeNameBg(ensure(r.rawg_id), r.game_name, r.background_image);
  }

  const favoriteRows = await paginateTable<SimpleRow>(
    supabase,
    "favorite_games",
    userId,
    "rawg_id, game_name, background_image",
    { order: { column: "slot", ascending: true } },
  );
  for (const r of favoriteRows) {
    const cur = ensure(r.rawg_id);
    cur.is_favorite = true;
    mergeNameBg(cur, r.game_name, r.background_image);
  }

  const list: ProfileStatGameGridItem[] = [...merge.entries()].map(
    ([rawg_id, v]) => {
      const m = reviewMeta.get(rawg_id);
      return {
        rawg_id,
        game_name: v.name,
        background_image: v.bg,
        rating: m?.rating ?? null,
        liked: m?.liked ?? false,
        is_favorite: v.is_favorite,
      };
    },
  );
  list.sort((a, b) =>
    a.game_name.localeCompare(b.game_name, "es", { sensitivity: "base" }),
  );
  return list;
}

/** Máximo de juegos distintos en la franja «Jugando» del perfil. */
export const PROFILE_PLAYING_SECTION_MAX_GAMES = 5;

/**
 * Actividad reciente acotada a juegos únicos (`rawg_id`), como en la sección de perfil.
 */
export function limitPlayingActivityForProfileSection(
  activity: GameActivityRecord[],
): GameActivityRecord[] {
  const seen = new Set<number>();
  const out: GameActivityRecord[] = [];
  for (const row of activity) {
    if (seen.has(row.rawg_id)) continue;
    seen.add(row.rawg_id);
    out.push(row);
    if (out.length >= PROFILE_PLAYING_SECTION_MAX_GAMES) break;
  }
  return out;
}

export type ProfileDashboard = {
  profile: ProfileRecord | null;
  links: ProfileLinkRecord[];
  favorites: FavoriteGameRecord[];
  activity: GameActivityRecord[];
  reviews: GameReviewRecord[];
  following: FriendProfile[];
  followers: FriendProfile[];
  stats: ProfileDashboardStats;
  /** Hasta 5 entradas recientes para la franja del perfil (estilo watchlist). */
  backlogPreview: GameBacklogRow[];
  backlogTotal: number;
};

export async function getProfileDashboard(
  userId: string,
  client?: SupabaseClient,
): Promise<ProfileDashboard> {
  noStore();
  const supabase = client ?? (await createClient());

  const yearStart = `${new Date().getFullYear()}-01-01T00:00:00.000Z`;

  const [
    profileRes,
    linksRes,
    favRes,
    actRes,
    revRes,
    following,
    followers,
    registeredGamesDistinctCount,
    thisYearActRes,
    backlogPreviewRes,
    backlogCountRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("profile_links")
      .select("id, label, url, sort_order")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("favorite_games")
      .select("slot, rawg_id, game_name, background_image")
      .eq("user_id", userId)
      .order("slot", { ascending: true }),
    supabase
      .from("game_activity")
      .select(
        "id, rawg_id, game_name, background_image, played_at, note, started_on, playtime_hours, platform",
      )
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(120),
    supabase
      .from("game_reviews")
      .select(
        "id, rawg_id, game_name, background_image, body, rating, created_at, started_on, finished_on, is_replay, liked, playtime_hours, platform",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(60),
    getFollowingForUser(userId, supabase),
    getFollowersForUser(userId, supabase),
    countDistinctRegisteredGames(userId, supabase),
    supabase
      .from("game_activity")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("played_at", yearStart),
    supabase
      .from("game_backlog")
      .select("id, rawg_id, game_name, background_image, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("game_backlog")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const profile = profileRes.data as ProfileRecord | null;
  const links = (linksRes.data ?? []) as ProfileLinkRecord[];
  const favoritesRaw = (favRes.data ?? []) as FavoriteGameRecord[];
  const activity = (actRes.data ?? []) as GameActivityRecord[];
  const reviews = (revRes.data ?? []) as GameReviewRecord[];

  const ratingByRawgId = new Map<number, number>();
  const likedByRawgId = new Map<number, boolean>();
  for (const rev of reviews) {
    if (rev.liked) {
      likedByRawgId.set(rev.rawg_id, true);
    }
    if (rev.rating == null) continue;
    const n = Number(rev.rating);
    if (!Number.isFinite(n) || n <= 0) continue;
    if (!ratingByRawgId.has(rev.rawg_id)) {
      ratingByRawgId.set(rev.rawg_id, n);
    }
  }

  const favorites: FavoriteGameRecord[] = favoritesRaw.map((f) => ({
    ...f,
    review_rating: ratingByRawgId.get(f.rawg_id) ?? null,
    review_liked: likedByRawgId.get(f.rawg_id) ?? false,
  }));

  const stats: ProfileDashboardStats = {
    gamesCount: registeredGamesDistinctCount,
    thisYearGamesCount: thisYearActRes.count ?? 0,
  };

  let backlogPreview: GameBacklogRow[] = [];
  let backlogTotal = 0;
  if (
    backlogPreviewRes.error?.message?.includes("relation") ||
    backlogPreviewRes.error?.code === "42P01"
  ) {
    /* migración game_backlog pendiente */
  } else if (backlogPreviewRes.data) {
    backlogPreview = backlogPreviewRes.data as GameBacklogRow[];
  }
  if (
    !backlogCountRes.error &&
    backlogCountRes.count != null
  ) {
    backlogTotal = backlogCountRes.count;
  }

  return {
    profile,
    links,
    favorites,
    activity,
    reviews,
    following,
    followers,
    stats,
    backlogPreview,
    backlogTotal,
  };
}

export const GAME_REVIEWS_PAGE_SIZE = 30;

export type GameReviewsPageResult = {
  reviews: GameReviewRecord[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Reseñas de un usuario con paginación (perfil propio o público).
 */
export async function getGameReviewsPaged(
  userId: string,
  page: number,
  client?: SupabaseClient,
): Promise<GameReviewsPageResult> {
  noStore();
  const supabase = client ?? (await createClient());
  const pageSize = GAME_REVIEWS_PAGE_SIZE;
  const requested =
    Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  const { count } = await supabase
    .from("game_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage =
    total === 0 ? 1 : Math.min(requested, totalPages);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data } = await supabase
    .from("game_reviews")
    .select(
      "id, rawg_id, game_name, background_image, body, rating, created_at, started_on, finished_on, is_replay, liked, playtime_hours, platform",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  const reviews = (data ?? []) as GameReviewRecord[];

  return {
    reviews,
    total,
    page: safePage,
    pageSize,
  };
}
