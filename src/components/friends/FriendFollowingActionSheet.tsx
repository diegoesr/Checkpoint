"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { unfollowUserAction } from "@/app/friends/actions";
import { publicProfilePath } from "@/lib/public-profile";
import type { FriendProfile } from "@/lib/supabase/friends";

type Props = {
  friend: FriendProfile | null;
  onClose: () => void;
};

export function FriendFollowingActionSheet({ friend, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!friend) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [friend, onClose]);

  if (!mounted || !friend) return null;

  const active = friend;
  const label =
    active.display_name?.trim() ||
    (active.username ? `@${active.username}` : "Jugador");
  const profileHref = publicProfilePath(active);

  async function handleUnfollow() {
    const name = label.trim() || "este jugador";
    if (!window.confirm(`¿Dejar de seguir a ${name}?`)) return;
    setBusy(true);
    const res = await unfollowUserAction(active.id, pathname);
    setBusy(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/65 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="friend-sheet-title"
        className="w-full max-w-md rounded-t-2xl border border-[#2f3642] bg-[#1a1f26] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden" />
        <h2
          id="friend-sheet-title"
          className="text-center text-base font-semibold text-white sm:text-left"
        >
          {label}
        </h2>
        <p className="mt-1 text-center text-xs text-[#678] sm:text-left">
          Elige una acción
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={profileHref}
            onClick={onClose}
            className="touch-manipulation rounded-xl border border-[#40bcf4]/40 bg-[#40bcf4]/15 py-3.5 text-center text-sm font-semibold text-[#9fdcff] transition hover:bg-[#40bcf4]/25"
          >
            Ver perfil
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={handleUnfollow}
            className="touch-manipulation rounded-xl border border-red-400/35 bg-red-950/40 py-3.5 text-sm font-semibold text-red-200/95 transition hover:border-red-400/50 hover:bg-red-950/55 disabled:opacity-50"
          >
            {busy ? "Actualizando…" : "Dejar de seguir"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="touch-manipulation rounded-xl border border-white/10 py-3 text-sm font-medium text-[#9ab] transition hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
