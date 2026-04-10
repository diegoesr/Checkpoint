"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type RawgGamePick = {
  id: number;
  name: string;
  background_image: string | null;
  released?: string | null;
};

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSelect: (game: RawgGamePick) => void;
};

export function RawgSearchModal({ open, title, onClose, onSelect }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RawgGamePick[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    const t = query.trim();
    if (t.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/games/search?q=${encodeURIComponent(t)}`,
      );
      if (!res.ok) {
        setError("No se pudo buscar.");
        setResults([]);
        return;
      }
      const data = (await res.json()) as {
        results?: RawgGamePick[];
      };
      setResults(data.results ?? []);
    } catch {
      setError("Error de red.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => search(q), 280);
    return () => clearTimeout(t);
  }, [q, open, search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="rawg-search-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1f26] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="rawg-search-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar juego…"
          autoFocus
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {error ? (
          <p className="mt-2 text-sm text-red-400/90">{error}</p>
        ) : null}
        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {loading ? (
            <li className="py-6 text-center text-sm text-white/45">Buscando…</li>
          ) : (
            results.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(g);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-black/25 p-2 text-left transition hover:border-emerald-500/30 hover:bg-black/40"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
                    {g.background_image ? (
                      <Image
                        src={g.background_image}
                        alt=""
                        width={48}
                        height={48}
                        quality={85}
                        className="size-full object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                  <span className="text-sm font-medium text-white">{g.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        {!loading && q.length >= 2 && results.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">Sin resultados.</p>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-white/15 py-2.5 text-sm text-white/80 hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
