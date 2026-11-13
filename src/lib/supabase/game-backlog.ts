import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type GameBacklogRow = {
  id: string;
  igdb_id: number;
  game_name: string;
  background_image: string | null;
  note: string | null;
  created_at: string;
};

export async function getGameBacklogForUser(
  userId: string,
  client?: SupabaseClient,
): Promise<GameBacklogRow[]> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("game_backlog")
    .select("id, igdb_id, game_name, background_image, note, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("relation") || error.code === "42P01") {
      return [];
    }
    return [];
  }
  return (data ?? []) as GameBacklogRow[];
}

export async function getBacklogEntryIdForGame(
  userId: string,
  igdbId: number,
  client?: SupabaseClient,
): Promise<string | null> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("game_backlog")
    .select("id")
    .eq("user_id", userId)
    .eq("igdb_id", igdbId)
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}
