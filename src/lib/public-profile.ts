import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isProfileSlugUuid(slug: string): boolean {
  return UUID_RE.test(slug.trim());
}

/** Ruta al perfil público de un jugador (username si existe; si no, id). */
export function publicProfilePath(p: {
  id: string;
  username: string | null;
}): string {
  const u = p.username?.trim();
  if (u) return `/u/${encodeURIComponent(u)}`;
  return `/u/${p.id}`;
}

/**
 * Resuelve `slug` de URL (uuid o nombre de usuario) al id de `profiles`.
 */
export async function resolveProfileIdFromSlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<string | null> {
  const raw = decodeURIComponent(slug).trim();
  if (!raw) return null;

  if (isProfileSlugUuid(raw)) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", raw)
      .maybeSingle();
    if (error || !data) return null;
    return data.id as string;
  }

  const lower = raw.toLowerCase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", lower)
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}
