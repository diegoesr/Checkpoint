import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type FriendProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export async function getFollowingForUser(
  userId: string,
  client?: SupabaseClient,
): Promise<FriendProfile[]> {
  const supabase = client ?? (await createClient());
  const { data: rows, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error || !rows?.length) {
    return [];
  }

  const ids = rows.map((r) => r.following_id as string);
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", ids);

  if (pErr || !profiles?.length) return [];

  const order = new Map(ids.map((id, i) => [id, i]));
  return [...profiles].sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}

/** Usuarios que siguen a `userId`. */
export async function getFollowersForUser(
  userId: string,
  client?: SupabaseClient,
): Promise<FriendProfile[]> {
  const supabase = client ?? (await createClient());
  const { data: rows, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);

  if (error || !rows?.length) return [];

  const ids = rows.map((r) => r.follower_id as string);
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", ids);

  if (pErr || !profiles?.length) return [];

  const order = new Map(ids.map((id, i) => [id, i]));
  return [...profiles].sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}
