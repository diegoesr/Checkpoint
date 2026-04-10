import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { gamePlatformLabel } from "@/lib/game-platforms";
import { formatPlaytimeHours } from "@/lib/profile-display";
import type { FriendProfile } from "@/lib/supabase/friends";
import type { ProfileDashboard } from "@/lib/supabase/profile-dashboard";
import { createClient } from "@/lib/supabase/server";

export type DiaryKind =
  | "activity"
  | "review"
  | "backlog"
  | "follow_user"
  | "new_follower"
  | "review_liked";

export type DiaryEntry = {
  id: string;
  kind: DiaryKind;
  at: string;
  gameName?: string;
  rawgId?: number;
  backgroundImage?: string | null;
  reviewRating?: number | null;
  reviewBody?: string | null;
  liked?: boolean;
  isReplay?: boolean;
  activityHoursLabel?: string | null;
  activityPlatformLabel?: string | null;
  friend?: FriendProfile;
};

export type ProfileDiaryExtras = {
  backlog: Array<{
    id: string;
    rawg_id: number;
    game_name: string;
    background_image: string | null;
    created_at: string;
  }>;
  followingStarted: Array<{ following_id: string; created_at: string }>;
  followersGained: Array<{ follower_id: string; created_at: string }>;
  /** Likes recibidos en tus reseñas (para actividad / diario). */
  reviewLikesReceived: Array<{
    like_id: string;
    created_at: string;
    liker_id: string;
    review_id: string;
    rawg_id: number;
    game_name: string;
    background_image: string | null;
  }>;
};

async function profilesMapForIds(
  userIds: string[],
  client?: SupabaseClient,
): Promise<Map<string, FriendProfile>> {
  const unique = [...new Set(userIds)].filter(Boolean);
  const map = new Map<string, FriendProfile>();
  if (!unique.length) return map;

  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", unique);

  if (error || !data) return map;
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

export async function getProfileDiaryExtras(
  userId: string,
  client?: SupabaseClient,
): Promise<ProfileDiaryExtras> {
  noStore();
  const supabase = client ?? (await createClient());

  const empty: ProfileDiaryExtras = {
    backlog: [],
    followingStarted: [],
    followersGained: [],
    reviewLikesReceived: [],
  };

  const [backlogRes, foutRes, finRes, myReviewsRes] = await Promise.all([
    supabase
      .from("game_backlog")
      .select("id, rawg_id, game_name, background_image, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("follows")
      .select("following_id, created_at")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("game_reviews")
      .select("id, rawg_id, game_name, background_image")
      .eq("user_id", userId),
  ]);

  if (backlogRes.error?.message?.includes("relation")) {
    /* migraciones 011 + 012 (tabla game_backlog) pendientes */
  } else if (backlogRes.data) {
    empty.backlog = backlogRes.data as ProfileDiaryExtras["backlog"];
  }

  if (!foutRes.error && foutRes.data) {
    empty.followingStarted = foutRes.data as ProfileDiaryExtras["followingStarted"];
  }
  if (!finRes.error && finRes.data) {
    empty.followersGained = finRes.data as ProfileDiaryExtras["followersGained"];
  }

  const reviewRows =
    (myReviewsRes.data ?? []) as Array<{
      id: string;
      rawg_id: number;
      game_name: string;
      background_image: string | null;
    }>;
  const reviewIds = reviewRows.map((r) => r.id);
  if (!myReviewsRes.error && reviewIds.length > 0) {
    const likesRes = await supabase
      .from("review_likes")
      .select("id, created_at, user_id, review_id")
      .in("review_id", reviewIds)
      .order("created_at", { ascending: false })
      .limit(200);

    if (
      likesRes.error?.message?.includes("relation") ||
      likesRes.error?.code === "42P01"
    ) {
      /* migración 017_review_likes pendiente */
    } else if (likesRes.data) {
      const byReview = new Map(reviewRows.map((r) => [r.id, r]));
      for (const row of likesRes.data) {
        const rev = byReview.get(row.review_id as string);
        if (!rev) continue;
        empty.reviewLikesReceived.push({
          like_id: row.id as string,
          created_at: row.created_at as string,
          liker_id: row.user_id as string,
          review_id: row.review_id as string,
          rawg_id: rev.rawg_id,
          game_name: rev.game_name,
          background_image: rev.background_image,
        });
      }
    }
  }

  return empty;
}

export function buildDiaryEntries(
  dash: ProfileDashboard,
  extras: ProfileDiaryExtras,
): DiaryEntry[] {
  const entries: DiaryEntry[] = [];

  for (const a of dash.activity) {
    entries.push({
      id: `activity-${a.id}`,
      kind: "activity",
      at: a.played_at,
      rawgId: a.rawg_id,
      gameName: a.game_name,
      backgroundImage: a.background_image,
      activityHoursLabel: formatPlaytimeHours(a.playtime_hours),
      activityPlatformLabel: gamePlatformLabel(a.platform) ?? undefined,
    });
  }

  for (const r of dash.reviews) {
    entries.push({
      id: `review-${r.id}`,
      kind: "review",
      at: r.created_at,
      rawgId: r.rawg_id,
      gameName: r.game_name,
      backgroundImage: r.background_image,
      reviewRating: r.rating,
      reviewBody: r.body,
      liked: Boolean(r.liked),
      isReplay: Boolean(r.is_replay),
    });
  }

  for (const w of extras.backlog) {
    entries.push({
      id: `backlog-${w.id}`,
      kind: "backlog",
      at: w.created_at,
      gameName: w.game_name,
      rawgId: w.rawg_id,
      backgroundImage: w.background_image,
    });
  }

  return entries;
}

export async function hydrateDiaryFollowEntries(
  entries: DiaryEntry[],
  extras: ProfileDiaryExtras,
  client?: SupabaseClient,
): Promise<DiaryEntry[]> {
  const followIds = [
    ...extras.followingStarted.map((x) => x.following_id),
    ...extras.followersGained.map((x) => x.follower_id),
  ];
  const likerIds = extras.reviewLikesReceived.map((x) => x.liker_id);
  const profileMap = await profilesMapForIds(
    [...followIds, ...likerIds],
    client,
  );

  const followEntries: DiaryEntry[] = [];

  for (const row of extras.followingStarted) {
    followEntries.push({
      id: `follow-${row.following_id}-${row.created_at}`,
      kind: "follow_user",
      at: row.created_at,
      friend: profileMap.get(row.following_id),
    });
  }

  for (const row of extras.followersGained) {
    followEntries.push({
      id: `follower-${row.follower_id}-${row.created_at}`,
      kind: "new_follower",
      at: row.created_at,
      friend: profileMap.get(row.follower_id),
    });
  }

  for (const row of extras.reviewLikesReceived) {
    followEntries.push({
      id: `review-like-${row.like_id}`,
      kind: "review_liked",
      at: row.created_at,
      gameName: row.game_name,
      rawgId: row.rawg_id,
      backgroundImage: row.background_image,
      friend: profileMap.get(row.liker_id),
    });
  }

  const merged = [...entries, ...followEntries];
  merged.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  return merged;
}

export async function getProfileDiaryTimeline(
  userId: string,
  dash: ProfileDashboard,
  client?: SupabaseClient,
): Promise<DiaryEntry[]> {
  const extras = await getProfileDiaryExtras(userId, client);
  const base = buildDiaryEntries(dash, extras);
  return hydrateDiaryFollowEntries(base, extras, client);
}
