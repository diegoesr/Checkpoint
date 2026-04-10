"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type GuestNavItem = { href: string; label: string };

function IconMenu({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

type Props = { items: readonly GuestNavItem[] };

export function NavbarGuestMobileMenu({ items }: Props) {
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
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="guest-nav-menu"
        aria-label={open ? "Cerrar menú" : "Abrir menú de navegación"}
        className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-white/90 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#40bcf4]/50 active:scale-[0.97]"
      >
        {open ? <IconClose /> : <IconMenu />}
      </button>
      {open ? (
        <div
          id="guest-nav-menu"
          role="menu"
          aria-label="Navegación"
          className="absolute right-0 top-full z-[80] mt-2 w-[min(100vw-2rem,17rem)] rounded-xl border border-white/10 bg-[#0d1014]/98 py-2 shadow-2xl shadow-black/60 backdrop-blur-md"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block px-4 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-white/95 transition hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
