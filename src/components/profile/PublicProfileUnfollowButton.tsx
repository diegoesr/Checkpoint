"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { unfollowUserAction } from "@/app/friends/actions";

type Props = {
  targetUserId: string;
  /** Nombre visible para el mensaje de confirmación. */
  displayLabel: string;
  /** Fila compacta en listas (p. ej. amigos en escritorio). */
  compact?: boolean;
  /** `usePathname()` del cliente para revalidar la página actual. */
  revalidatePagePath?: string | null;
};

export function PublicProfileUnfollowButton({
  targetUserId,
  displayLabel,
  compact = false,
  revalidatePagePath,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onUnfollow() {
    const name = displayLabel.trim() || "este jugador";
    if (!window.confirm(`¿Dejar de seguir a ${name}?`)) return;
    setBusy(true);
    const res = await unfollowUserAction(targetUserId, revalidatePagePath);
    setBusy(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  const cls = compact
    ? "touch-manipulation rounded-lg border border-red-400/35 bg-red-950/35 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-200/95 transition hover:border-red-400/55 hover:bg-red-950/55 disabled:opacity-50 sm:text-[11px]"
    : "touch-manipulation rounded-lg border border-red-400/35 bg-red-950/35 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-red-200/95 transition hover:border-red-400/55 hover:bg-red-950/55 disabled:opacity-50 sm:text-xs";

  return (
    <button type="button" disabled={busy} onClick={onUnfollow} className={cls}>
      {busy ? (compact ? "…" : "Actualizando…") : "Dejar de seguir"}
    </button>
  );
}
