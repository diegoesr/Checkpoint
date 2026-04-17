"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGameById } from "@/lib/rawg";
import { createClient } from "@/lib/supabase/server";

function revalidateLists(listId?: string) {
  revalidatePath("/lists");
  if (listId) revalidatePath(`/lists/${listId}`);
}

async function touchListUpdated(supabase: Awaited<ReturnType<typeof createClient>>, listId: string) {
  await supabase
    .from("user_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);
}

/**
 * Crea la lista y la primera entrada en una sola operación.
 * No se usa fila vacía: la lista solo existe cuando hay al menos un juego.
 */
export async function createUserListWithFirstGameAction(
  rawgId: number,
  name: string,
  description: string | null,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 120) {
    return { ok: false, error: "El título debe tener entre 1 y 120 caracteres." };
  }
  if (description && description.length > 500) {
    return { ok: false, error: "La descripción admite como máximo 500 caracteres." };
  }

  const game = await getGameById(rawgId);
  if (!game) return { ok: false, error: "Juego no encontrado en RAWG." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const now = new Date().toISOString();
  const { data: row, error: insertErr } = await supabase
    .from("user_lists")
    .insert({
      user_id: user.id,
      name: trimmedName,
      description: description && description.trim().length > 0 ? description.trim() : null,
      updated_at: now,
    })
    .select("id")
    .single();

  if (insertErr) {
    if (insertErr.message.includes("relation") || insertErr.code === "42P01") {
      return {
        ok: false,
        error:
          "Ejecuta en Supabase la migración 004 (user_lists) y la 015 (entradas y descripción).",
      };
    }
    return { ok: false, error: insertErr.message };
  }

  const listId = row?.id as string;

  const { error: entryErr } = await supabase.from("user_list_entries").insert({
    list_id: listId,
    rawg_id: game.id,
    game_name: game.name,
    background_image: game.background_image ?? null,
    position: 1,
  });

  if (entryErr) {
    await supabase.from("user_lists").delete().eq("id", listId).eq("user_id", user.id);
    if (entryErr.code === "23505") {
      return { ok: false, error: "Ese juego ya está en la lista." };
    }
    if (entryErr.message.includes("relation") || entryErr.code === "42P01") {
      return {
        ok: false,
        error: "Ejecuta la migración 015 en Supabase (user_list_entries).",
      };
    }
    return { ok: false, error: entryErr.message };
  }

  revalidateLists(listId);
  return { ok: true, id: listId };
}

export async function updateUserListAction(
  listId: string,
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: false; error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (name.length < 1 || name.length > 120) {
    return { ok: false, error: "El título debe tener entre 1 y 120 caracteres." };
  }
  if (description && description.length > 500) {
    return { ok: false, error: "La descripción admite como máximo 500 caracteres." };
  }

  const { error } = await supabase
    .from("user_lists")
    .update({
      name,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) {
    if (error.message.includes("column") || error.code === "42703") {
      return {
        ok: false,
        error: "Ejecuta la migración 015 en Supabase (descripción en listas).",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidateLists(listId);
  redirect("/lists");
}

export async function deleteUserListAction(listId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/lists");

  await supabase.from("user_lists").delete().eq("id", listId).eq("user_id", user.id);

  revalidateLists();
  redirect("/lists");
}

export async function addGameToUserListAction(
  listId: string,
  rawgId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const game = await getGameById(rawgId);
  if (!game) return { ok: false, error: "Juego no encontrado en RAWG." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: list } = await supabase
    .from("user_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!list) return { ok: false, error: "Lista no encontrada." };

  const { count } = await supabase
    .from("user_list_entries")
    .select("id", { count: "exact", head: true })
    .eq("list_id", listId);

  const position = (count ?? 0) + 1;

  const { error } = await supabase.from("user_list_entries").insert({
    list_id: listId,
    rawg_id: game.id,
    game_name: game.name,
    background_image: game.background_image ?? null,
    position,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ese juego ya está en la lista." };
    }
    if (error.message.includes("relation") || error.code === "42P01") {
      return {
        ok: false,
        error: "Ejecuta la migración 015 en Supabase (user_list_entries).",
      };
    }
    return { ok: false, error: error.message };
  }

  await touchListUpdated(supabase, listId);
  revalidateLists(listId);
  return { ok: true };
}

export async function removeGameFromUserListAction(
  listId: string,
  entryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("user_list_entries")
    .delete()
    .eq("id", entryId)
    .eq("list_id", listId);

  if (error) return { ok: false, error: error.message };

  const { data: remaining } = await supabase
    .from("user_list_entries")
    .select("id")
    .eq("list_id", listId)
    .order("position", { ascending: true });

  const rows = remaining ?? [];
  for (let i = 0; i < rows.length; i++) {
    await supabase
      .from("user_list_entries")
      .update({ position: i + 1 })
      .eq("id", rows[i].id as string);
  }

  await touchListUpdated(supabase, listId);
  revalidateLists(listId);
  return { ok: true };
}

export async function reorderUserListEntriesAction(
  listId: string,
  orderedEntryIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: list } = await supabase
    .from("user_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!list) return { ok: false, error: "Lista no encontrada." };

  if (orderedEntryIds.length === 0) return { ok: true };

  const seen = new Set<string>();
  for (const id of orderedEntryIds) {
    if (seen.has(id)) return { ok: false, error: "Orden inválido (IDs duplicados)." };
    seen.add(id);
  }

  const { data: rows, error: fetchErr } = await supabase
    .from("user_list_entries")
    .select("id")
    .eq("list_id", listId);

  if (fetchErr) return { ok: false, error: fetchErr.message };

  const existing = new Set((rows ?? []).map((r) => r.id as string));
  if (existing.size !== orderedEntryIds.length) {
    return { ok: false, error: "La lista ha cambiado. Recarga la página." };
  }
  for (const id of orderedEntryIds) {
    if (!existing.has(id)) {
      return { ok: false, error: "Entrada inválida." };
    }
  }

  for (let i = 0; i < orderedEntryIds.length; i++) {
    const { error } = await supabase
      .from("user_list_entries")
      .update({ position: i + 1 })
      .eq("id", orderedEntryIds[i])
      .eq("list_id", listId);
    if (error) return { ok: false, error: error.message };
  }

  await touchListUpdated(supabase, listId);
  revalidateLists(listId);
  return { ok: true };
}
