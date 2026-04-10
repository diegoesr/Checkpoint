"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export async function searchProfilesToFollow(
  query: string,
): Promise<{ ok: true; rows: ProfileRow[] } | { ok: false; error: string }> {
  let trimmed = query.trim().replace(/[%_]/g, "");
  if (trimmed.startsWith("@")) trimmed = trimmed.slice(1);
  if (trimmed.length < 2) {
    return { ok: true, rows: [] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const pattern = `%${trimmed}%`;
  const select = "id, display_name, username, avatar_url";
  const base = () =>
    supabase.from("profiles").select(select).neq("id", user.id).limit(12);

  const [{ data: byName, error: errName }, { data: byUser, error: errUser }] =
    await Promise.all([
      base().ilike("display_name", pattern),
      base().ilike("username", pattern),
    ]);

  if (errName && errUser) {
    return { ok: false, error: errName.message || errUser.message };
  }

  const byId = new Map<string, ProfileRow>();
  for (const r of byName ?? []) {
    byId.set(r.id, {
      id: r.id,
      display_name: r.display_name,
      username: r.username ?? null,
      avatar_url: r.avatar_url,
    });
  }
  for (const r of byUser ?? []) {
    byId.set(r.id, {
      id: r.id,
      display_name: r.display_name,
      username: r.username ?? null,
      avatar_url: r.avatar_url,
    });
  }
  const rows = [...byId.values()].slice(0, 12);

  const { data: existing } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingSet = new Set(
    (existing ?? []).map((r) => r.following_id as string),
  );

  const filtered = (rows ?? []).filter((r) => !followingSet.has(r.id));
  return { ok: true, rows: filtered };
}

export async function followUserAction(
  targetUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };
  if (user.id === targetUserId) return { ok: false, error: "No puedes seguirte a ti mismo" };

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya sigues a este usuario" };
    }
    if (error.code === "42P01" || error.message.includes("relation")) {
      return {
        ok: false,
        error:
          "Falta crear tablas en Supabase. Ejecuta supabase/migrations/001_profiles_follows.sql",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
