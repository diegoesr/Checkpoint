"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileAddChoiceSheet } from "@/components/landing/MobileAddChoiceSheet";

type Item = {
  href: string;
  label: string;
  variant?: "fab";
  match: (pathname: string | null) => boolean;
};

const items: Item[] = [
  {
    href: "/profile/friends",
    label: "Amigos",
    match: (p) => p === "/profile/friends",
  },
  {
    href: "/profile/reviews",
    label: "Reseñas",
    match: (p) =>
      p === "/profile/reviews" ||
      Boolean(p?.startsWith("/profile/reviews/")),
  },
  {
    href: "/profile/registrar",
    label: "Agregar",
    variant: "fab",
    match: (p) => p === "/profile/registrar",
  },
  {
    href: "/news",
    label: "Noticias",
    match: (p) => p === "/news",
  },
  {
    href: "/profile",
    label: "Perfil",
    match: (p) =>
      p === "/profile" ||
      (Boolean(p?.startsWith("/profile/")) &&
        !p?.startsWith("/profile/registrar") &&
        !p?.startsWith("/profile/reviews") &&
        !p?.startsWith("/profile/friends")) ||
      Boolean(p?.startsWith("/u/")),
  },
];

function IconFriends({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M14 14.5a4 4 0 0 1 7 2.5v1" />
    </svg>
  );
}

function IconReviews({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2.5 14.65 9.22 21.9 9.22 16.12 13.78 18.78 20.5 12 15.95 5.22 20.5 7.88 13.78 2.1 9.22 9.35 9.22 12 2.5" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  return (
    <nav
      data-mobile-bottom-nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#1a1f26]/95 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Navegación principal móvil"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between gap-1 px-1 pt-1.5">
        {items.map((item) => {
          if (item.variant === "fab") {
            const active =
              item.match(pathname) || addSheetOpen;
            return (
              <Fragment key="fab-add">
                <button
                  type="button"
                  onClick={() => setAddSheetOpen(true)}
                  className="flex flex-1 flex-col items-center gap-0.5 pb-1"
                  aria-expanded={addSheetOpen}
                  aria-haspopup="dialog"
                  aria-label="Agregar reseña o actividad"
                >
                  <span
                    className={
                      active
                        ? "flex size-11 items-center justify-center rounded-full bg-[#00e054] text-black shadow-[0_0_20px_rgba(0,224,84,0.35)] ring-2 ring-[#00e054]/50"
                        : "flex size-11 items-center justify-center rounded-full bg-[#00e054]/90 text-black shadow-md transition active:scale-95"
                    }
                    aria-hidden
                  >
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.25}
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="sr-only">{item.label}</span>
                </button>
              </Fragment>
            );
          }

          const active = item.match(pathname);
          const iconClass =
            active
              ? "text-[#40bcf4]"
              : "text-[#7a8a9e] transition-colors hover:text-[#bcd]";

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 pb-1.5 pt-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
            >
              {item.href === "/profile/friends" ? (
                <IconFriends className={iconClass} />
              ) : item.href === "/profile/reviews" ? (
                <IconReviews className={iconClass} />
              ) : item.href === "/news" ? (
                <IconBolt className={iconClass} />
              ) : (
                <IconUser className={iconClass} />
              )}
              <span className={active ? "text-[#40bcf4]" : "text-[#7a8a9e]"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {addSheetOpen ? (
        <MobileAddChoiceSheet
          onClose={() => setAddSheetOpen(false)}
          onPickReview={() => {
            setAddSheetOpen(false);
            router.push("/profile/registrar?accion=reseña");
          }}
          onPickActivity={() => {
            setAddSheetOpen(false);
            router.push("/profile/registrar?accion=actividad");
          }}
        />
      ) : null}
    </nav>
  );
}
