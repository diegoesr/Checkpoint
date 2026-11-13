"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserListWithFirstGameAction } from "@/app/lists/actions";
import type { GameSearchHit } from "@/lib/igdb";

export function NewListDraftEditor() {
  const router = useRouter();
  const [name, setName] = useState("Nueva lista");
  const [description, setDescription] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<GameSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingAdd, startAdd] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

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
      const data = (await res.json()) as { results?: GameSearchHit[] };
      setHits(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }

  function addFirstGame(igdbId: number) {
    startAdd(async () => {
      setMsg(null);
      const trimmedName = name.trim();
      if (trimmedName.length < 1 || trimmedName.length > 120) {
        setMsg("El título debe tener entre 1 y 120 caracteres.");
        return;
      }
      const descTrim = description.trim();
      if (descTrim.length > 500) {
        setMsg("La descripción admite como máximo 500 caracteres.");
        return;
      }
      const res = await createUserListWithFirstGameAction(
        igdbId,
        trimmedName,
        descTrim.length > 0 ? descTrim : null,
      );
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      router.replace(`/lists/${res.id}`);
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-[#2f3642] bg-[#1a1f26] p-4 sm:p-6">
        <p className="text-xs leading-relaxed text-[#678]">
          La lista no se guarda hasta que añadas al menos un juego. Si sales
          sin añadir ninguno, no aparecerá en tu perfil.
        </p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Título
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
                    onClick={() => addFirstGame(g.id)}
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
          <p className="mt-3 text-sm text-[#678]">
            Aún no hay juegos. El primero que añadas creará la lista con el
            título y la descripción de arriba.
          </p>
        </div>
      </section>
    </div>
  );
}
