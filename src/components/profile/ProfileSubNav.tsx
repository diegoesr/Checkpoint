"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/profile/backlog", label: "Backlog" },
  { href: "/profile/diary", label: "Diario" },
  { href: "/profile/reviews", label: "Reseñas" },
  { href: "/lists", label: "Listas" },
] as const;

export function ProfileSubNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#2f3642] py-2 md:py-0">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 py-0.5 md:justify-start md:gap-x-5 md:gap-y-2 md:py-3">
        {tabs.map((t) => {
          const active =
            t.href === "/lists"
              ? pathname === "/lists" ||
                Boolean(pathname?.startsWith("/lists/"))
              : pathname === t.href ||
                Boolean(pathname?.startsWith(`${t.href}/`));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                active
                  ? "whitespace-nowrap rounded-full bg-[#2f3947] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-inner shadow-black/20 transition sm:px-3.5 sm:py-2 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:pb-3 md:text-[11px] md:tracking-[0.16em] md:shadow-none md:border-b-2 md:border-emerald-500"
                  : "whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9ab] transition hover:bg-white/5 hover:text-white sm:px-3.5 sm:py-2 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:pb-3 md:text-[11px] md:tracking-[0.16em] md:hover:bg-transparent"
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
