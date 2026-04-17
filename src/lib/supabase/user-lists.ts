import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UserListRecord = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type UserListEntryRecord = {
  id: string;
  list_id: string;
  rawg_id: number;
  game_name: string;
  background_image: string | null;
  position: number;
  created_at: string;
};

export type UserListWithPreview = UserListRecord & {
  game_count: number;
  /** Hasta 5 carátulas para el collage. */
  preview_images: string[];
};

export type UserListDetail = {
  list: UserListRecord;
  entries: UserListEntryRecord[];
};

export async function getUserListsWithPreviews(
  userId: string,
  client?: SupabaseClient,
): Promise<UserListWithPreview[]> {
  noStore();
  const supabase = client ?? (await createClient());

  const { data: lists, error: lErr } = await supabase
    .from("user_lists")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (lErr || !lists?.length) return [];

  const typedLists = lists as UserListRecord[];
  const listIds = typedLists.map((l) => l.id);

  const { data: entries, error: eErr } = await supabase
    .from("user_list_entries")
    .select("list_id, background_image, position")
    .in("list_id", listIds)
    .order("list_id", { ascending: true })
    .order("position", { ascending: true });

  if (eErr) return typedLists.map((l) => ({ ...l, game_count: 0, preview_images: [] }));

  const byList = new Map<string, { images: string[]; count: number }>();
  for (const lid of listIds) {
    byList.set(lid, { images: [], count: 0 });
  }
  for (const row of entries ?? []) {
    const lid = row.list_id as string;
    const bucket = byList.get(lid);
    if (!bucket) continue;
    bucket.count += 1;
    const url = row.background_image as string | null;
    if (url && bucket.images.length < 5) bucket.images.push(url);
  }

  const withPreviews = typedLists.map((l) => {
    const b = byList.get(l.id) ?? { images: [], count: 0 };
    return { ...l, game_count: b.count, preview_images: b.images };
  });

  /** No mostrar listas sin juegos (p. ej. borradores abandonados o vacías). */
  return withPreviews.filter((l) => l.game_count > 0);
}

/** Lista + entradas por id (lectura; RLS permite select a usuarios autenticados). */
export async function getUserListDetailById(
  listId: string,
  client?: SupabaseClient,
): Promise<UserListDetail | null> {
  noStore();
  const supabase = client ?? (await createClient());

  const { data: list, error: lErr } = await supabase
    .from("user_lists")
    .select("*")
    .eq("id", listId)
    .maybeSingle();

  if (lErr || !list) return null;

  const { data: entries, error: eErr } = await supabase
    .from("user_list_entries")
    .select("*")
    .eq("list_id", listId)
    .order("position", { ascending: true });

  if (eErr) return { list: list as UserListRecord, entries: [] };

  return {
    list: list as UserListRecord,
    entries: (entries ?? []) as UserListEntryRecord[],
  };
}
