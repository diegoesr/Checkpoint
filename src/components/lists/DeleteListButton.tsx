"use client";

import { useTransition } from "react";
import { deleteUserListAction } from "@/app/lists/actions";

export function DeleteListButton({ listId }: { listId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Eliminar esta lista y todos sus juegos?")) return;
        start(async () => {
          await deleteUserListAction(listId);
        });
      }}
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-50"
    >
      {pending ? "Eliminando…" : "Eliminar lista"}
    </button>
  );
}
