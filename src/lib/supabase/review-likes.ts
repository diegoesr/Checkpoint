import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import type { GameReviewRecord } from "@/lib/supabase/profile-dashboard";
import { createClient } from "@/lib/supabase/server";

export type ReviewLikeMeta = {
  likeCount: number;
  likedByViewer: boolean;
};

/**
 * Agrega conteo de likes y si el visitante ya dio like (por review id).
 */
export async function getReviewLikesMeta(
  reviewIds: string[],
  viewerId: string | null,
  client?: SupabaseClient,
): Promise<Map<string, ReviewLikeMeta>> {
  noStore();
  const map = new Map<string, ReviewLikeMeta>();
  for (const id of reviewIds) {
    map.set(id, { likeCount: 0, likedByViewer: false });
  }
  if (!reviewIds.length) return map;

  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("review_likes")
    .select("review_id, user_id")
    .in("review_id", reviewIds);

  if (
    error?.message?.includes("relation") ||
    error?.code === "42P01"
  ) {
    return map;
  }
  if (!data) return map;

  for (const row of data) {
    const rid = row.review_id as string;
    const m = map.get(rid);
    if (!m) continue;
    m.likeCount += 1;
    if (viewerId && row.user_id === viewerId) {
      m.likedByViewer = true;
    }
  }
  return map;
}

export function attachReviewLikeMeta(
  reviews: GameReviewRecord[],
  meta: Map<string, ReviewLikeMeta>,
): GameReviewRecord[] {
  return reviews.map((r) => {
    const m = meta.get(r.id);
    if (!m) return r;
    return {
      ...r,
      likeCount: m.likeCount,
      likedByViewer: m.likedByViewer,
    };
  });
}
