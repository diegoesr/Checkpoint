"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { followUserAction } from "@/app/friends/actions";
import { markNotificationsSeenAction } from "@/app/profile/actions";
import { formatRelativeTimeShort } from "@/lib/profile-display";
import { publicProfilePath } from "@/lib/public-profile";
import type { NavbarNotification } from "@/lib/supabase/navbar-notifications";

type Props = {
  initialItems: NavbarNotification[];
};

/** Campana en silueta (relleno), sin trazo perimetral. */
function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function actorLabel(a: NavbarNotification["actor"]): string {
  return a.display_name?.trim() || a.username || "Jugador";
}

export function NavbarNotificationsMenu({ initialItems }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [followingBackId, setFollowingBackId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  /** Oculta el badge al cerrar antes de que termine el servidor + refresh. */
  const [badgeSuppressed, setBadgeSuppressed] = useState(false);
  const prevCountRef = useRef(initialItems.length);
  const wrapRef = useRef<HTMLDivElement>(null);

  const n = initialItems.length;

  useEffect(() => {
    const prev = prevCountRef.current;
    if (n > prev) {
      setBadgeSuppressed(false);
    }
    prevCountRef.current = n;
  }, [n]);

  const runMarkSeenAndRefresh = useCallback(
    (optimisticBadge: boolean) => {
      if (optimisticBadge) setBadgeSuppressed(true);
      void (async () => {
        const res = await markNotificationsSeenAction();
        if (!res.ok) {
          setBadgeSuppressed(false);
          return;
        }
        router.refresh();
      })();
    },
    [router],
  );

  const closeAndMarkSeen = useCallback(() => {
    const hadUnread = n > 0;
    setOpen((wasOpen) => {
      if (wasOpen) {
        queueMicrotask(() => runMarkSeenAndRefresh(hadUnread));
      }
      return false;
    });
  }, [n, runMarkSeenAndRefresh]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeAndMarkSeen();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndMarkSeen();
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeAndMarkSeen]);

  const showBadge = !badgeSuppressed && n > 0;
  const badge =
    showBadge && n > 99 ? "99+" : showBadge ? String(n) : null;

  return (
    <div ref={wrapRef} className="relative shrink-0 overflow-visible">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => {
            if (prev) {
              queueMicrotask(() => runMarkSeenAndRefresh(n > 0));
              return false;
            }
            return true;
          });
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          n === 0 || badgeSuppressed
            ? "Notificaciones"
            : `Notificaciones, ${n} ${n === 1 ? "nueva" : "nuevas"}`
        }
        className="relative flex size-11 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-0 text-[#c8d0d9] shadow-none outline-none ring-0 transition-[color,background-color,transform] duration-200 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40bcf4]/40 focus-visible:ring-offset-0 active:scale-[0.97] md:size-10"
      >
        <BellIcon className="size-5" />
        {badge ? (
          <span className="pointer-events-none absolute right-0.5 top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="z-[100] rounded-xl border border-white/10 bg-[#0d1014]/98 py-2 shadow-2xl shadow-black/60 backdrop-blur-md
            max-md:fixed max-md:left-1/2 max-md:right-auto max-md:top-[max(4.25rem,calc(env(safe-area-inset-top,0px)+3.75rem))] max-md:mt-0 max-md:w-[min(22rem,calc(100vw-1.5rem))] max-md:-translate-x-1/2
            md:absolute md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,22rem)]"
          role="menu"
          aria-label="Notificaciones"
        >
          <div className="border-b border-white/10 px-3 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Notificaciones
            </p>
          </div>

          {initialItems.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-white/55">
                No hay notificaciones nuevas.
              </p>
              <p className="mt-2 text-xs text-white/40">
                Cuando alguien te dé like en una reseña o te siga, verás las
                novedades aquí hasta que cierres el panel.
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(70vh,22rem)] overflow-y-auto py-1">
              {initialItems.map((item) => {
                const href = publicProfilePath(item.actor);
                const rel = formatRelativeTimeShort(item.at);
                return (
                  <li key={item.id} role="none">
                    {item.kind === "review_like" ? (
                      <div
                        role="menuitem"
                        className="border-b border-white/5 px-3 py-2.5 last:border-b-0"
                      >
                        <p className="text-[13px] leading-snug text-white/90">
                          <Link
                            href={href}
                            className="font-semibold text-[#40bcf4] hover:text-[#5ccfff]"
                            onClick={closeAndMarkSeen}
                          >
                            {actorLabel(item.actor)}
                          </Link>
                          <span className="text-white/60">
                            {" "}
                            le gustó tu reseña de{" "}
                          </span>
                          <Link
                            href={`/games/${item.igdbId}`}
                            className="font-medium text-emerald-400/90 hover:underline"
                            onClick={closeAndMarkSeen}
                          >
                            {item.gameName}
                          </Link>
                        </p>
                        <p className="mt-1 text-[11px] tabular-nums text-white/35">
                          {rel}
                        </p>
                      </div>
                    ) : (
                      <div
                        role="menuitem"
                        className="border-b border-white/5 px-3 py-2.5 last:border-b-0"
                      >
                        <p className="text-[13px] leading-snug text-white/90">
                          <Link
                            href={href}
                            className="font-semibold text-[#40bcf4] hover:text-[#5ccfff]"
                            onClick={closeAndMarkSeen}
                          >
                            {actorLabel(item.actor)}
                          </Link>
                          <span className="text-white/60"> te siguió</span>
                        </p>
                        <p className="mt-1 text-[11px] tabular-nums text-white/35">
                          {rel}
                        </p>
                        {item.canFollowBack ? (
                          <button
                            type="button"
                            disabled={followingBackId === item.actor.id}
                            className="mt-2.5 w-full touch-manipulation rounded-lg border border-emerald-500/40 bg-emerald-600/20 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-100 transition hover:bg-emerald-600/35 disabled:opacity-50"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFollowingBackId(item.actor.id);
                              const res = await followUserAction(
                                item.actor.id,
                                pathname,
                              );
                              setFollowingBackId(null);
                              if (!res.ok) {
                                alert(res.error);
                                return;
                              }
                              router.refresh();
                            }}
                          >
                            {followingBackId === item.actor.id
                              ? "Siguiendo…"
                              : "Seguir también"}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-white/10 px-3 py-2">
            <Link
              href="/profile/diary"
              className="block text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#678] transition hover:text-[#40bcf4]"
              onClick={closeAndMarkSeen}
            >
              Ver actividad en el diario
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
