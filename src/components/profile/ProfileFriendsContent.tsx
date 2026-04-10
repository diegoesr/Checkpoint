"use client";

import Link from "next/link";
import { useState } from "react";
import { AddFriendModal } from "@/components/friends/AddFriendModal";
import { publicProfilePath } from "@/lib/public-profile";
import type { FriendProfile } from "@/lib/supabase/friends";

function FriendRow({ p }: { p: FriendProfile }) {
  const label = p.display_name?.trim() || (p.username ? `@${p.username}` : "Jugador");
  const sub = p.username ? `@${p.username}` : null;
  return (
    <li>
      <Link
        href={publicProfilePath(p)}
        className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 transition hover:border-[#2f3642] hover:bg-[#1a1f26]"
      >
        {p.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatar_url}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover ring-1 ring-white/15"
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1f252d] text-sm font-semibold text-white/90 ring-1 ring-white/15">
            {label.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{label}</p>
          {sub ? (
            <p className="truncate text-xs text-[#678]">{sub}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-[#567]" aria-hidden>
          ›
        </span>
      </Link>
    </li>
  );
}

export function ProfileFriendsContent({
  following,
  followers,
}: {
  following: FriendProfile[];
  followers: FriendProfile[];
}) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Amigos
        </h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="touch-manipulation rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-600/30 sm:shrink-0"
        >
          + Agregar amigo
        </button>
      </div>

      <section className="border-t border-[#2f3642] pt-6">
        <h2 className="mb-3 flex items-baseline gap-2 text-sm font-semibold text-[#bcd]">
          Siguiendo
          <span className="text-xs font-normal tabular-nums text-[#678]">
            {following.length}
          </span>
        </h2>
        {following.length === 0 ? (
          <p className="text-sm text-[#678]">
            Aún no sigues a nadie. Usa «Agregar amigo» para buscar jugadores.
          </p>
        ) : (
          <ul className="divide-y divide-[#2f3642] rounded-lg border border-[#2f3642] bg-[#14181c]/80">
            {following.map((p) => (
              <FriendRow key={p.id} p={p} />
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-[#2f3642] pt-6">
        <h2 className="mb-3 flex items-baseline gap-2 text-sm font-semibold text-[#bcd]">
          Seguidores
          <span className="text-xs font-normal tabular-nums text-[#678]">
            {followers.length}
          </span>
        </h2>
        {followers.length === 0 ? (
          <p className="text-sm text-[#678]">Aún no tienes seguidores.</p>
        ) : (
          <ul className="divide-y divide-[#2f3642] rounded-lg border border-[#2f3642] bg-[#14181c]/80">
            {followers.map((p) => (
              <FriendRow key={p.id} p={p} />
            ))}
          </ul>
        )}
      </section>

      <AddFriendModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
