"use client";

import { useState } from "react";
import { AddFriendModal } from "@/components/friends/AddFriendModal";
import type { FriendProfile } from "@/lib/supabase/friends";

type Props = {
  initialFriends: FriendProfile[];
};

export function NavbarFriendsSection({ initialFriends }: Props) {
  const [open, setOpen] = useState(false);
  const n = initialFriends.length;

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-3 border-l border-white/15 pl-2 sm:gap-5 sm:pl-3 md:gap-6 md:pl-4">
      <span
        className="inline-flex items-baseline gap-1.5 whitespace-nowrap"
        title={
          n === 0
            ? undefined
            : `${n} ${n === 1 ? "persona a la que sigues" : "personas a las que sigues"}`
        }
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50 sm:text-[10px]">
          Amigos
        </span>
        <span
          className={
            n === 0
              ? "text-[11px] font-bold tabular-nums text-white/35 sm:text-xs"
              : "text-[11px] font-bold tabular-nums text-cyan-300/95 sm:text-xs"
          }
        >
          {n > 99 ? "99+" : n}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 cursor-pointer rounded-md border border-[#2f3642] bg-[#1a1f26]/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#c8d0d9] transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-[#40bcf4]/70 hover:bg-[#1f252d] hover:text-white hover:shadow-[0_0_12px_rgba(64,188,244,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40bcf4]/50 active:scale-[0.98] sm:px-2 sm:py-1 sm:text-[10px]"
      >
        + Amigo
      </button>

      <AddFriendModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
