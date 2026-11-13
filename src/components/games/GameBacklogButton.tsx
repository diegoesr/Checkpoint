"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  addGameToBacklogAction,
  removeGameFromBacklogByIgdbIdAction,
} from "@/app/profile/actions";

type Props = {
  igdbId: number;
  initialInBacklog: boolean;
};

export function GameBacklogButton({ igdbId, initialInBacklog }: Props) {
  const router = useRouter();
  const [inBacklog, setInBacklog] = useState(initialInBacklog);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setInBacklog(initialInBacklog);
  }, [initialInBacklog]);

  function toggle() {
    setError(null);
    startTransition(async () => {
      if (inBacklog) {
        const res = await removeGameFromBacklogByIgdbIdAction(igdbId);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setInBacklog(false);
      } else {
        const res = await addGameToBacklogAction(igdbId);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setInBacklog(true);
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className={
          inBacklog
            ? "inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-400/55 hover:bg-amber-950/60 disabled:opacity-50 sm:w-auto"
            : "inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-emerald-500/45 bg-emerald-900/35 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-800/40 disabled:opacity-50 sm:w-auto"
        }
      >
        {pending
          ? "…"
          : inBacklog
            ? "Quitar del backlog"
            : "Añadir al backlog"}
      </button>
      <p className="max-w-md text-xs text-white/45">
        Tu backlog son los juegos que quieres jugar más adelante (pendientes).
      </p>
      {error ? (
        <p className="text-sm text-red-400/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
