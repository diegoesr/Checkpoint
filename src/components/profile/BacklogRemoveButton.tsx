"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeGameFromBacklogEntryAction } from "@/app/profile/actions";

type Props = { entryId: string };

export function BacklogRemoveButton({ entryId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await removeGameFromBacklogEntryAction(entryId);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.refresh();
          });
        }}
        className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9ab] transition hover:border-red-400/35 hover:bg-red-950/30 hover:text-red-200 disabled:opacity-40"
      >
        {pending ? "…" : "Quitar"}
      </button>
      {error ? (
        <span className="max-w-[12rem] text-[10px] text-red-400/90">
          {error}
        </span>
      ) : null}
    </div>
  );
}
