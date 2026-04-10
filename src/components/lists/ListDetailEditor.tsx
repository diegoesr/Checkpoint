"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addGameToUserListAction,
  removeGameFromUserListAction,
  updateUserListAction,
} from "@/app/lists/actions";
import { SortableListEntriesGrid } from "@/components/lists/SortableListEntriesGrid";
import type {
  UserListEntryRecord,
  UserListRecord,
} from "@/lib/supabase/user-lists";
import type { RawgSearchHit } from "@/lib/rawg";

type Props = {
  list: UserListRecord;
  entries: UserListEntryRecord[];
};

type SearchState = { ok: false; error: string } | null;

export function ListDetailEditor({ list, entries }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<RawgSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingAdd, startAdd] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [metaState, metaAction, metaPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const r = await updateUserListAction(list.id, _prev, formData);
      return r ?? null;
    },
    null as SearchState,
  );

  async function runSearch() {
    const t = q.trim();
    if (t.length < 2) {
      setHits([]);
      return;
    }
    setSearching(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/games/search?q=${encodeURIComponent(t)}`,
      );
      if (!res.ok) {
        setHits([]);
        return;
      }
      const data = (await res.json()) as { results?: RawgSearchHit[] };
      setHits(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }

  function addGame(rawgId: number) {
    startAdd(async () => {
      setMsg(null);
      const res = await addGameToUserListAction(list.id, rawgId);
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      router.refresh();
    });
  }

  async function removeEntry(entryId: string) {
    setMsg(null);
    const res = await removeGameFromUserListAction(list.id, entryId);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <form action={metaAction} className="space-y-8">
      <section className="rounded-lg border border-[#2f3642] bg-[#1a1f26] p-4 sm:p-6">
       
       

        <div className="mt-6 space-y-3">
          {metaState?.ok === false ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {metaState.error}
            </p>
          ) : null}
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Título
            </span>
            <input
              name="name"
              required
              defaultValue={list.name}
              maxLength={120}
              className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Descripción
            </span>
            <textarea
              name="description"
              rows={3}
              defaultValue={list.description ?? ""}
              maxLength={500}
              className="mt-1.5 w-full resize-none rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="mt-8 border-t border-[#2f3642] pt-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
            Añadir juegos
          </h3>
         
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                setQ(v);
                if (v.trim().length < 2) {
                  setHits([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runSearch();
                }
              }}
              placeholder="Buscar juego…"
              className="min-w-0 flex-1 rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
            />
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={searching}
              className="shrink-0 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {searching ? "Buscando…" : "Buscar"}
            </button>
          </div>
          {msg ? (
            <p className="mt-2 text-sm text-amber-200/90">{msg}</p>
          ) : null}
          {hits.length > 0 ? (
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-[#2f3642] bg-[#14181c] p-2">
              {hits.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-white/5"
                >
                  <span className="min-w-0 truncate text-sm text-[#e6edf3]">
                    {g.name}
                  </span>
                  <button
                    type="button"
                    disabled={pendingAdd}
                    onClick={() => addGame(g.id)}
                    className="shrink-0 rounded bg-emerald-600/90 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Añadir
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-8 border-t border-[#2f3642] pt-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
            Juegos en la lista
          </h3>
          <p className="mt-1 text-xs text-[#678]">
            Arrastra la portada para reordenar. 
          </p>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-[#678]">
              Aún no hay juegos. Usa el buscador de arriba.
            </p>
          ) : (
            <div className="mt-4">
              <SortableListEntriesGrid
                listId={list.id}
                entries={entries}
                onRemove={(id) => void removeEntry(id)}
                onReorderError={(m) => setMsg(m)}
              />
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-[#2f3642] pt-8">
          <button
            type="submit"
            disabled={metaPending}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {metaPending ? "Guardando…" : "Guardar cambios"}
          </button>
          
        </div>
      </section>
    </form>
  );
}
