import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function displayNameFromUser(user: User): string {
  const meta = user.user_metadata as { display_name?: string } | undefined;
  const fromMeta = meta?.display_name?.trim();
  if (fromMeta) return fromMeta;
  const email = user.email?.split("@")[0];
  return email || "Jugador";
}

function avatarFromUser(user: User): string | null {
  const meta = user.user_metadata as { avatar_url?: string } | undefined;
  const u = meta?.avatar_url?.trim();
  return u || null;
}

/** Mantiene fila en `profiles` alineada con auth (nombre y avatar del registro). */
export async function upsertProfileFromAuth(
  user: User,
  client?: SupabaseClient,
): Promise<void> {
  const supabase = client ?? (await createClient());
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayNameFromUser(user),
      avatar_url: avatarFromUser(user),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export function getDisplayNameForNavbar(user: User): string {
  return displayNameFromUser(user);
}

export function getAvatarUrlForNavbar(user: User): string | null {
  return avatarFromUser(user);
}
