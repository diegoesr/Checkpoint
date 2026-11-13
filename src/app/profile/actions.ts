"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidGamePlatformId } from "@/lib/game-platforms";
import { getGameById } from "@/lib/igdb";
import {
  getProfileStatGameGridItems,
  PROFILE_PLAYING_SECTION_MAX_GAMES,
  type ProfileStatGameGridItem,
} from "@/lib/supabase/profile-dashboard";
import { createClient } from "@/lib/supabase/server";

function revalidateProfile(publicSlug?: string | null) {
  revalidatePath("/profile");
  revalidatePath("/profile/diary");
  revalidatePath("/profile/reviews");
  revalidatePath("/profile/backlog");
  revalidatePath("/profile/edit");
  revalidatePath("/", "layout");
  const slug = publicSlug?.trim();
  if (slug) {
    revalidatePath(`/u/${slug}`);
    revalidatePath(`/u/${slug}/reviews`);
  }
}

async function revalidatePathsForReviewOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
) {
  revalidateProfile();
  revalidatePath(`/u/${ownerId}`);
  revalidatePath(`/u/${ownerId}/reviews`);
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", ownerId)
    .maybeSingle();
  const u = (data?.username as string | null)?.trim().toLowerCase();
  if (u) {
    revalidatePath(`/u/${u}`);
    revalidatePath(`/u/${u}/reviews`);
  }
}

export async function toggleReviewLikeAction(
  reviewId: string,
): Promise<
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: review, error: revErr } = await supabase
    .from("game_reviews")
    .select("id, user_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (revErr || !review) {
    return { ok: false, error: "Reseña no encontrada." };
  }
  const ownerId = review.user_id as string;
  if (ownerId === user.id) {
    return { ok: false, error: "No puedes dar like a tu propia reseña." };
  }

  const { data: existing } = await supabase
    .from("review_likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error: delErr } = await supabase
      .from("review_likes")
      .delete()
      .eq("id", existing.id as string);
    if (delErr) {
      if (delErr.message.includes("relation") || delErr.code === "42P01") {
        return {
          ok: false,
          error:
            "Ejecuta la migración 017_review_likes.sql en Supabase (review_likes).",
        };
      }
      return { ok: false, error: delErr.message };
    }
  } else {
    const { error: insErr } = await supabase.from("review_likes").insert({
      review_id: reviewId,
      user_id: user.id,
    });
    if (insErr) {
      if (insErr.message.includes("relation") || insErr.code === "42P01") {
        return {
          ok: false,
          error:
            "Ejecuta la migración 017_review_likes.sql en Supabase (review_likes).",
        };
      }
      return { ok: false, error: insErr.message };
    }
  }

  const { count } = await supabase
    .from("review_likes")
    .select("id", { count: "exact", head: true })
    .eq("review_id", reviewId);

  await revalidatePathsForReviewOwner(supabase, ownerId);

  return {
    ok: true,
    liked: !existing,
    likeCount: count ?? 0,
  };
}

/** Al cerrar el panel de notificaciones del navbar: oculta hasta eventos futuros. */
export async function markNotificationsSeenAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update({
      notifications_last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (
      error.code === "42703" ||
      error.message.includes("notifications_last_seen")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 018_profiles_notifications_last_seen.sql en Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

function sanitizePlatformField(raw: unknown): string | null {
  const s = String(raw ?? "").trim().slice(0, 80);
  return s === "" ? null : s;
}

export async function updateProfileSettingsAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const display_name = String(formData.get("display_name") ?? "").trim();
  const usernameRaw = String(formData.get("username") ?? "").trim();
  const username =
    usernameRaw === ""
      ? null
      : usernameRaw.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const avatar_url =
    String(formData.get("avatar_url") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();
  const psn_id = sanitizePlatformField(formData.get("psn_id"));
  const xbox_gamertag = sanitizePlatformField(formData.get("xbox_gamertag"));
  const steam_display = sanitizePlatformField(formData.get("steam_display"));
  const nintendo_friend_code = sanitizePlatformField(
    formData.get("nintendo_friend_code"),
  );
  const epic_display_name = sanitizePlatformField(
    formData.get("epic_display_name"),
  );
  const battlenet_btag = sanitizePlatformField(formData.get("battlenet_btag"));

  if (usernameRaw && username !== usernameRaw.toLowerCase()) {
    return {
      ok: false,
      error: "Usuario: solo letras, números, guiones y guión bajo (3–24).",
    };
  }
  if (username && (username.length < 3 || username.length > 24)) {
    return { ok: false, error: "El usuario debe tener entre 3 y 24 caracteres." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      username,
      bio,
      avatar_url,
      psn_id,
      xbox_gamertag,
      steam_display,
      nintendo_friend_code,
      epic_display_name,
      battlenet_btag,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ese nombre de usuario ya está en uso." };
    }
    if (error.message.includes("column") || error.code === "42703") {
      return {
        ok: false,
        error:
          "Falta ejecutar migraciones en Supabase: 002 (perfil), 013 (IDs de consolas) y/o 014 (Battle.net).",
      };
    }
    return { ok: false, error: error.message };
  }

  await supabase.auth.updateUser({
    data: {
      display_name: display_name || undefined,
      avatar_url: avatar_url ?? undefined,
    },
  });

  if (email && email !== user.email) {
    const { error: eErr } = await supabase.auth.updateUser({ email });
    if (eErr) return { ok: false, error: eErr.message };
  }

  revalidateProfile(username ?? undefined);
  redirect("/profile");
}

export type LinkInput = { label: string; url: string };

export async function saveProfileLinksAction(
  links: LinkInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const cleaned = links
    .map((l, i) => ({
      label: l.label.trim(),
      url: l.url.trim(),
      sort_order: i,
    }))
    .filter((l) => l.label && l.url);

  const { error: delErr } = await supabase
    .from("profile_links")
    .delete()
    .eq("user_id", user.id);
  if (delErr && !delErr.message.includes("relation")) {
    return { ok: false, error: delErr.message };
  }

  if (cleaned.length === 0) {
    revalidateProfile();
    return { ok: true };
  }

  const { error: insErr } = await supabase.from("profile_links").insert(
    cleaned.map((l) => ({
      user_id: user.id,
      label: l.label,
      url: l.url.startsWith("http") ? l.url : `https://${l.url}`,
      sort_order: l.sort_order,
    })),
  );

  if (insErr) {
    if (insErr.message.includes("relation")) {
      return {
        ok: false,
        error: "Ejecuta la migración 002 en Supabase (tabla profile_links).",
      };
    }
    return { ok: false, error: insErr.message };
  }

  revalidateProfile();
  return { ok: true };
}

export async function setFavoriteSlotAction(
  slot: number,
  igdbId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (slot < 1 || slot > 4) return { ok: false, error: "Slot inválido" };
  const game = await getGameById(igdbId);
  if (!game) return { ok: false, error: "No se encontró el juego en IGDB." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase.from("favorite_games").upsert(
    {
      user_id: user.id,
      slot,
      igdb_id: game.id,
      game_name: game.name,
      background_image: game.background_image,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slot" },
  );

  if (error) {
    return {
      ok: false,
      error: error.message.includes("relation")
        ? "Ejecuta la migración 002 (favorite_games)."
        : error.message,
    };
  }

  revalidateProfile();
  return { ok: true };
}

export async function clearFavoriteSlotAction(
  slot: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  await supabase
    .from("favorite_games")
    .delete()
    .eq("user_id", user.id)
    .eq("slot", slot);

  revalidateProfile();
  return { ok: true };
}

export type AddGameActivityPayload = {
  igdbId: number;
  note?: string | null;
  /** Fecha en que empezó a jugar (YYYY-MM-DD), opcional. */
  startedOn?: string | null;
  /** Horas acumuladas hasta ahora (opcional). */
  playtimeHours?: number | null;
  platform?: string | null;
};

export async function addGameActivityAction(
  payload: AddGameActivityPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const {
    igdbId,
    note,
    startedOn,
    playtimeHours: playtimeRaw,
    platform: platformRaw,
  } = payload;

  let hours: number | null = null;
  if (playtimeRaw != null) {
    const h = Number(playtimeRaw);
    if (!Number.isFinite(h) || h < 0 || h > 999_999.99) {
      return {
        ok: false,
        error: "Las horas deben ser un número entre 0 y 999999,99.",
      };
    }
    hours = Math.round(h * 100) / 100;
  }

  let platform: string | null = null;
  if (platformRaw != null && String(platformRaw).trim() !== "") {
    const p = String(platformRaw).trim();
    if (!isValidGamePlatformId(p)) {
      return { ok: false, error: "Plataforma no válida." };
    }
    platform = p;
  }

  const started =
    startedOn && String(startedOn).trim().length >= 8
      ? String(startedOn).trim().slice(0, 10)
      : null;

  const game = await getGameById(igdbId);
  if (!game) return { ok: false, error: "Juego no encontrado." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: existingPlaying } = await supabase
    .from("game_activity")
    .select("igdb_id")
    .eq("user_id", user.id);
  const distinctGames = new Set(
    (existingPlaying ?? []).map((r) => Number(r.igdb_id)),
  );
  if (
    distinctGames.size >= PROFILE_PLAYING_SECTION_MAX_GAMES &&
    !distinctGames.has(game.id)
  ) {
    return {
      ok: false,
      error: `Solo puedes tener hasta ${PROFILE_PLAYING_SECTION_MAX_GAMES} juegos en Jugando. Quita uno desde el perfil antes de añadir otro distinto.`,
    };
  }

  const row: Record<string, unknown> = {
    user_id: user.id,
    igdb_id: game.id,
    game_name: game.name,
    background_image: game.background_image,
    played_at: new Date().toISOString(),
    note: note?.trim() || null,
    started_on: started,
    playtime_hours: hours,
    platform,
  };

  const { error } = await supabase.from("game_activity").insert(row);

  if (error) {
    if (
      error.message.includes("started_on") ||
      error.message.includes("playtime_hours") ||
      error.message.includes("platform") ||
      error.message.includes("game_activity_platform") ||
      error.message.includes("game_activity_playtime")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 009_game_activity_started_platform.sql en Supabase (actividad: inicio, horas, plataforma).",
      };
    }
    return {
      ok: false,
      error: error.message.includes("relation")
        ? "Ejecuta la migración 002 (game_activity)."
        : error.message,
    };
  }

  revalidateProfile();
  return { ok: true };
}

export type UpdateGameActivityPayload = {
  id: string;
  startedOn: string | null;
  playtimeHours: number | null;
  platform: string | null;
  note: string | null;
};

export async function updateGameActivityAction(
  payload: UpdateGameActivityPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  let hours: number | null = null;
  if (payload.playtimeHours != null) {
    const h = Number(payload.playtimeHours);
    if (!Number.isFinite(h) || h < 0 || h > 999_999.99) {
      return {
        ok: false,
        error: "Las horas deben ser un número entre 0 y 999999,99.",
      };
    }
    hours = Math.round(h * 100) / 100;
  }

  let platform: string | null = null;
  if (payload.platform != null && payload.platform.trim() !== "") {
    const p = payload.platform.trim();
    if (!isValidGamePlatformId(p)) {
      return { ok: false, error: "Plataforma no válida." };
    }
    platform = p;
  }

  const started =
    payload.startedOn && payload.startedOn.trim().length >= 8
      ? payload.startedOn.trim().slice(0, 10)
      : null;

  const { error } = await supabase
    .from("game_activity")
    .update({
      started_on: started,
      playtime_hours: hours,
      platform,
      note: payload.note?.trim() || null,
    })
    .eq("id", payload.id)
    .eq("user_id", user.id);

  if (error) {
    if (
      error.code === "42501" ||
      error.message.toLowerCase().includes("policy") ||
      error.message.toLowerCase().includes("permission denied")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 010_game_activity_update_policy.sql en Supabase (editar actividad).",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidateProfile();
  return { ok: true };
}

export async function deleteGameActivityAction(
  activityId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("game_activity")
    .delete()
    .eq("id", activityId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateProfile();
  return { ok: true };
}

export type AddGameReviewPayload = {
  igdbId: number;
  body: string;
  rating: number;
  startedOn: string | null;
  finishedOn: string | null;
  isReplay: boolean;
  liked: boolean;
  /** Horas jugadas (opcional). */
  playtimeHours?: number | null;
  /** Plataforma (opcional), slug en `game-platforms`. */
  platform?: string | null;
};

export async function addGameReviewAction(
  payload: AddGameReviewPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const {
    igdbId,
    body,
    rating,
    startedOn,
    finishedOn,
    isReplay,
    liked,
    playtimeHours,
    platform: platformRaw,
  } = payload;

  const r = Number(rating);
  const validHalf =
    Number.isFinite(r) &&
    r >= 0.5 &&
    r <= 5 &&
    Math.round(r * 2) === r * 2;
  if (!validHalf) {
    return {
      ok: false,
      error:
        "Elige una valoración de 0.5 a 5 estrellas (medias permitidas).",
    };
  }

  let hours: number | null = null;
  if (playtimeHours != null) {
    const h = Number(playtimeHours);
    if (!Number.isFinite(h) || h < 0 || h > 999_999.99) {
      return {
        ok: false,
        error: "Las horas deben ser un número entre 0 y 999999,99.",
      };
    }
    hours = Math.round(h * 100) / 100;
  }

  let platform: string | null = null;
  if (platformRaw != null && String(platformRaw).trim() !== "") {
    const p = String(platformRaw).trim();
    if (!isValidGamePlatformId(p)) {
      return { ok: false, error: "Plataforma no válida." };
    }
    platform = p;
  }

  const game = await getGameById(igdbId);
  if (!game) return { ok: false, error: "Juego no encontrado." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const text = body.trim();
  const row: Record<string, unknown> = {
    user_id: user.id,
    igdb_id: game.id,
    game_name: game.name,
    background_image: game.background_image,
    body: text.length > 0 ? text : "",
    rating: r,
    started_on: startedOn && startedOn.length >= 8 ? startedOn : null,
    finished_on: finishedOn && finishedOn.length >= 8 ? finishedOn : null,
    is_replay: isReplay,
    liked,
    playtime_hours: hours,
    platform,
  };

  const { error } = await supabase.from("game_reviews").insert(row);

  if (error) {
    if (
      error.message.includes("game_reviews_rating_half_steps") ||
      error.message.includes("numeric")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 006_game_reviews_half_stars.sql en Supabase (medias estrellas).",
      };
    }
    if (
      error.message.includes("playtime_hours") ||
      error.message.includes("playtime")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 007_game_reviews_playtime.sql en Supabase (horas jugadas).",
      };
    }
    if (
      error.message.includes("platform") ||
      error.message.includes("game_reviews_platform")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 008_game_reviews_platform.sql en Supabase (plataforma).",
      };
    }
    if (
      error.message.includes("column") ||
      error.code === "42703" ||
      error.message.includes("started_on")
    ) {
      return {
        ok: false,
        error:
          "Ejecuta la migración 005_game_reviews_dates.sql en Supabase (fechas y rejugada).",
      };
    }
    return {
      ok: false,
      error: error.message.includes("relation")
        ? "Ejecuta la migración 002 (game_reviews)."
        : error.message,
    };
  }

  revalidateProfile();
  return { ok: true };
}

export async function addGameToBacklogAction(
  igdbId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const game = await getGameById(igdbId);
  if (!game) return { ok: false, error: "Juego no encontrado." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase.from("game_backlog").insert({
    user_id: user.id,
    igdb_id: game.id,
    game_name: game.name,
    background_image: game.background_image ?? null,
    note: null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Este juego ya está en tu backlog." };
    }
    if (error.message.includes("relation") || error.code === "42P01") {
      return {
        ok: false,
        error:
          "Ejecuta en Supabase las migraciones 011 y 012 (tabla game_backlog).",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidateProfile();
  revalidatePath(`/games/${game.id}`);
  return { ok: true };
}

export async function removeGameFromBacklogByIgdbIdAction(
  igdbId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("game_backlog")
    .delete()
    .eq("user_id", user.id)
    .eq("igdb_id", igdbId);

  if (error) {
    if (error.message.includes("relation") || error.code === "42P01") {
      return {
        ok: false,
        error:
          "Ejecuta en Supabase las migraciones 011 y 012 (tabla game_backlog).",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidateProfile();
  revalidatePath(`/games/${igdbId}`);
  return { ok: true };
}

export async function removeGameFromBacklogEntryAction(
  entryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: row, error: selErr } = await supabase
    .from("game_backlog")
    .select("igdb_id")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr || !row) {
    return { ok: false, error: "Entrada no encontrada." };
  }

  const igdbId = row.igdb_id as number;

  const { error } = await supabase
    .from("game_backlog")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateProfile();
  revalidatePath(`/games/${igdbId}`);
  return { ok: true };
}

export async function getProfileStatGamesGridAction(
  profileUserId: string,
  kind: "all" | "this_year",
): Promise<
  | { ok: true; items: ProfileStatGameGridItem[] }
  | { ok: false; error: string }
> {
  const trimmed = profileUserId?.trim();
  if (!trimmed) return { ok: false, error: "Perfil no válido." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };
  const items = await getProfileStatGameGridItems(trimmed, kind, supabase);
  return { ok: true, items };
}
