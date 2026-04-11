"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  followUserAction,
  searchProfilesToFollow,
  type ProfileRow,
} from "@/app/friends/actions";

function FriendAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initial = name.slice(0, 1).toUpperCase() || "?";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs externas arbitrarias (Google, etc.)
      <img
        src={avatarUrl}
        alt=""
        className="size-7 rounded-full object-cover ring-2 ring-white/20 sm:size-8"
      />
    );
  }
  return (
    <div
      className="flex size-7 items-center justify-center rounded-full bg-[#15282c] text-[10px] font-semibold text-white ring-2 ring-[#006BB4]/35 sm:size-8 sm:text-[11px]"
      title={name}
    >
      {initial}
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Tras seguir con éxito (p. ej. `router.refresh`). */
  onFollowed?: () => void;
};

export function AddFriendModal({ open, onClose, onFollowed }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [followPending, setFollowPending] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearchError(null);
    }
  }, [open]);

  const runSearch = useCallback((q: string) => {
    startTransition(async () => {
      setSearchError(null);
      const res = await searchProfilesToFollow(q);
      if (!res.ok) {
        setResults([]);
        setSearchError(res.error);
        return;
      }
      setResults(res.rows);
    });
  }, []);

  async function handleFollow(id: string) {
    setFollowPending(id);
    const res = await followUserAction(id, pathname);
    setFollowPending(null);
    if (!res.ok) {
      setSearchError(res.error);
      return;
    }
    onClose();
    setQuery("");
    setResults([]);
    onFollowed?.();
    router.refresh();
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/75 p-4 sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-friend-title"
        className="my-auto w-full max-w-md rounded-2xl border border-violet-500/30 bg-slate-950 p-6 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-friend-title" className="text-xl font-semibold text-white">
          Buscar y seguir
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Igual que en Instagram: al seguir a alguien le llega una notificación y puede
          devolverte el seguimiento desde el panel de notificaciones o tu perfil.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="search"
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch(query);
              }
            }}
            placeholder="Nombre visible o @usuario (mín. 2 letras)"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-600/50 bg-[#0d0f18] px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => runSearch(query)}
            className="min-h-11 shrink-0 rounded-xl border border-white/20 bg-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50 sm:w-auto"
          >
            {pending ? "Buscando…" : "Buscar"}
          </button>
        </div>
        {searchError ? (
          <p className="mt-4 text-sm text-red-400/90">{searchError}</p>
        ) : null}
        <ul className="mt-5 max-h-60 space-y-2 overflow-y-auto pr-1">
          {results.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FriendAvatar
                  name={
                    row.display_name?.trim() ||
                    (row.username ? `@${row.username}` : "?")
                  }
                  avatarUrl={row.avatar_url}
                />
                <span className="truncate text-sm text-white">
                  {row.display_name?.trim() ||
                    (row.username ? `@${row.username}` : "Sin nombre")}
                </span>
              </div>
              <button
                type="button"
                disabled={followPending === row.id}
                onClick={() => handleFollow(row.id)}
                className="shrink-0 rounded-lg bg-cyan-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {followPending === row.id ? "…" : "Seguir"}
              </button>
            </li>
          ))}
        </ul>
        {results.length === 0 && !pending && query.length >= 2 ? (
          <p className="mt-4 text-sm text-slate-500">Sin resultados.</p>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/20 py-3 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          Cerrar
        </button>
      </div>
    </div>,
    document.body,
  );
}
