"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";

function UserAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initial = name.slice(0, 1).toUpperCase() || "?";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white/25"
      />
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#15282c] text-sm font-semibold text-white ring-2 ring-[#006BB4]/40">
      {initial}
    </div>
  );
}

type Props = {
  displayName: string;
  avatarUrl: string | null;
};

export function NavbarProfileArea({ displayName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menú de cuenta: ${displayName}`}
        className="flex max-w-60 cursor-pointer items-center justify-center gap-2 rounded-full px-0 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#40bcf4]/50 active:scale-[0.98] max-md:size-11 max-md:active:scale-[0.97] md:max-w-64 md:rounded-md md:px-1.5 md:py-1 md:hover:bg-white/5 lg:max-w-72"
      >
        <UserAvatar name={displayName} avatarUrl={avatarUrl} />
        <span className="hidden min-w-0 truncate text-left text-[12px] font-medium text-white md:inline md:text-[13px]">
          {displayName}
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Cuenta"
          className="absolute right-0 top-full z-[80] mt-2 w-[min(100vw-2rem,15rem)] rounded-xl border border-white/10 bg-[#0d1014]/98 py-1 shadow-2xl shadow-black/60 backdrop-blur-md md:w-56"
        >
          <p className="truncate border-b border-white/10 px-3 py-2 text-[11px] font-medium text-white/80">
            {displayName}
          </p>
          <Link
            href="/profile"
            role="menuitem"
            className="block px-3 py-2.5 text-sm text-white/95 transition hover:bg-white/5 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Mi perfil
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full cursor-pointer px-3 py-2.5 text-left text-sm font-medium text-red-300/95 transition hover:bg-red-500/10 hover:text-red-200"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
