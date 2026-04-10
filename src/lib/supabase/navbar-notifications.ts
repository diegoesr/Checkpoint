import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import type { FriendProfile } from "@/lib/supabase/friends";
import { createClient } from "@/lib/supabase/server";

export type NavbarNotification =
  | {
      id: string;
      kind: "review_like";
      at: string;
      actor: FriendProfile;
      gameName: string;
      rawgId: number;
    }
  | {
      id: string;
      kind: "new_follower";
      at: string;
      actor: FriendProfile;
    };

async function profilesByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, FriendProfile>> {
  const unique = [...new Set(ids)].filter(Boolean);
  const map = new Map<string, FriendProfile>();
  if (!unique.length) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", unique);
  if (!data) return map;
  for (const row of data) {
    map.set(row.id as string, {
      id: row.id as string,
      display_name: (row.display_name as string | null) ?? null,
      username: (row.username as string | null) ?? null,
      avatar_url: (row.avatar_url as string | null) ?? null,
    });
  }
  return map;
}

const RECENT_REVIEWS_CAP = 400;
const FETCH_LIMIT = 30;
const PANEL_LIMIT = 25;

export type NavbarNotificationsPayload = {
  items: NavbarNotification[];
  /** Marca de «vistas» en BD (para key estable del menú cliente). */
  lastSeenAt: string | null;
};

/**
 * Notificaciones recientes para el navbar: likes en tus reseñas y nuevos seguidores.
 */
export async function getNavbarNotifications(
  userId: string,
  client?: SupabaseClient,
): Promise<NavbarNotificationsPayload> {
  noStore();
  const supabase = client ?? (await createClient());

  const seenRes = await supabase
    .from("profiles")
    .select("notifications_last_seen_at")
    .eq("id", userId)
    .maybeSingle();

  const seenAtRaw =
    !seenRes.error && seenRes.data
      ? (seenRes.data as { notifications_last_seen_at?: string | null })
          .notifications_last_seen_at
      : null;
  const lastSeenAt: string | null =
    seenAtRaw != null && String(seenAtRaw).length > 0
      ? String(seenAtRaw)
      : null;
  const cutoffMs =
    lastSeenAt != null ? new Date(lastSeenAt).getTime() : null;

  const isNewNotification = (atIso: string) => {
    if (cutoffMs == null) return true;
    return new Date(atIso).getTime() > cutoffMs;
  };

  const [reviewsRes, followRes] = await Promise.all([
    supabase
      .from("game_reviews")
      .select("id, rawg_id, game_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(RECENT_REVIEWS_CAP),
    supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT),
  ]);

  const reviewById = new Map(
    (reviewsRes.data ?? []).map((r) => [
      r.id as string,
      {
        rawg_id: r.rawg_id as number,
        game_name: r.game_name as string,
      },
    ]),
  );
  const reviewIds = [...reviewById.keys()];

  let likeRows: Array<{
    id: string;
    created_at: string;
    user_id: string;
    review_id: string;
  }> = [];

  if (reviewIds.length > 0) {
    const likesRes = await supabase
      .from("review_likes")
      .select("id, created_at, user_id, review_id")
      .in("review_id", reviewIds)
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT);

    if (
      likesRes.error?.code === "42P01" ||
      likesRes.error?.message?.includes("relation")
    ) {
      /* migración 017 pendiente */
    } else if (likesRes.data) {
      likeRows = likesRes.data as typeof likeRows;
    }
  }

  type Raw =
    | {
        kind: "review_like";
        at: string;
        id: string;
        userId: string;
        review_id: string;
      }
    | {
        kind: "new_follower";
        at: string;
        id: string;
        userId: string;
      };

  const rawItems: Raw[] = [];

  for (const row of likeRows) {
    rawItems.push({
      kind: "review_like",
      at: row.created_at,
      id: `like-${row.id}`,
      userId: row.user_id,
      review_id: row.review_id,
    });
  }

  if (!followRes.error && followRes.data) {
    for (const row of followRes.data) {
      rawItems.push({
        kind: "new_follower",
        at: row.created_at as string,
        id: `follow-${row.follower_id}-${row.created_at}`,
        userId: row.follower_id as string,
      });
    }
  }

  const unread = rawItems.filter((t) => isNewNotification(t.at));
  unread.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  const top = unread.slice(0, PANEL_LIMIT);
  const actorIds = top.map((t) => t.userId);
  const profileMap = await profilesByIds(supabase, actorIds);

  const out: NavbarNotification[] = [];
  for (const t of top) {
    const actor = profileMap.get(t.userId);
    if (!actor) continue;

    if (t.kind === "review_like") {
      const rev = reviewById.get(t.review_id);
      if (!rev) continue;
      out.push({
        id: t.id,
        kind: "review_like",
        at: t.at,
        actor,
        gameName: rev.game_name,
        rawgId: rev.rawg_id,
      });
    } else {
      out.push({
        id: t.id,
        kind: "new_follower",
        at: t.at,
        actor,
      });
    }
  }

  return { items: out, lastSeenAt };
}
