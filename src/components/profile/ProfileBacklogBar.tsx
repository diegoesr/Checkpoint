"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { addGameToBacklogAction } from "@/app/profile/actions";
import { GameSearchModal, type GamePick } from "@/components/profile/GameSearchModal";

export function ProfileBacklogBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const onSelect = useCallback(
    async (game: GamePick) => {
      setPending(true);
      const res = await addGameToBacklogAction(game.id);
      setPending(false);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    },
    [router],
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-snug text-[#678] sm:max-w-md lg:max-w-lg">
          Añade juegos que quieras jugar más adelante. Búscalos y guárdalos en
          tu backlog.
        </p>
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg border border-emerald-600/60 bg-emerald-600 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-md transition duration-200 hover:scale-[1.02] hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-900/25 active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? "…" : "+ Añadir al backlog"}
          </button>
        </div>
      </div>
      <GameSearchModal
        open={open}
        title="Añadir al backlog"
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </>
  );
}
