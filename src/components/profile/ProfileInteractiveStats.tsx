"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getProfileStatGamesGridAction } from "@/app/profile/actions";
import { HalfStarRatingDisplay } from "@/components/profile/HalfStarRatingDisplay";
import type { ProfileStatGameGridItem } from "@/lib/supabase/profile-dashboard";
import { RAWG_COVER_QUALITY } from "@/lib/rawg-image";

type Stat = { label: string; value: number };

/** Ancho de carátula solicitado a Next/Image según viewport. */
const GRID_SIZES =
  "(max-width: 767px) 22vw, (max-width: 1023px) 14vw, 112px";

const OPENABLE = new Set(["Juegos", "Este año"]);

export function ProfileInteractiveStats({
  stats,
  profileUserId,
  displayHandle,
}: {
  stats: readonly Stat[];
  profileUserId: string;
  displayHandle: string | null;
}) {
  const [sheet, setSheet] = useState<"all" | "this_year" | null>(null);
  const [items, setItems] = useState<ProfileStatGameGridItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    async (kind: "all" | "this_year") => {
      setLoading(true);
      setErr(null);
      const r = await getProfileStatGamesGridAction(profileUserId, kind);
      setLoading(false);
      if (r.ok) setItems(r.items);
      else {
        setErr(r.error);
        setItems([]);
      }
    },
    [profileUserId],
  );

  useEffect(() => {
    if (sheet == null) return;
    setItems(null);
    void load(sheet);
  }, [sheet, load]);

  useEffect(() => {
    if (sheet == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  function open(kind: "all" | "this_year") {
    setSheet(kind);
  }

  function close() {
    setSheet(null);
    setItems(null);
    setErr(null);
  }

  const title =
    sheet === "all"
      ? "Juegos"
      : sheet === "this_year"
        ? "Este año"
        : "";

  return (
    <>
      <div className="grid grid-cols-2 gap-2 border-t border-[#2f3642] pt-5 sm:gap-2.5 sm:pt-6 lg:hidden">
        {stats.map((s) => (
          <StatCell
            key={s.label}
            stat={s}
            interactive={OPENABLE.has(s.label)}
            onOpenGames={
              s.label === "Juegos"
                ? () => open("all")
                : s.label === "Este año"
                  ? () => open("this_year")
                  : undefined
            }
          />
        ))}
      </div>

      <div className="hidden items-start justify-end gap-0 font-sans lg:flex">
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-start">
            {i > 0 ? (
              <div
                className="mx-2 h-11 w-px shrink-0 self-center bg-[#2f3642]"
                aria-hidden
              />
            ) : null}
            <StatCell
              stat={s}
              interactive={OPENABLE.has(s.label)}
              layout="desktop"
              onOpenGames={
                s.label === "Juegos"
                  ? () => open("all")
                  : s.label === "Este año"
                    ? () => open("this_year")
                    : undefined
              }
            />
          </div>
        ))}
      </div>

      {sheet != null ? (
        <div
          className="fixed inset-0 z-[220] flex flex-col bg-[#14181c]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stat-grid-title"
        >
          <header className="shrink-0 border-b border-[#2f3642]">
            <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-2 py-3 sm:px-4 lg:px-8 xl:px-10">
              <button
                type="button"
                onClick={close}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#bcd] transition hover:bg-white/5 hover:text-white"
                aria-label="Cerrar"
              >
                <svg
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h1
                  id="stat-grid-title"
                  className="truncate text-base font-bold text-white sm:text-lg lg:text-xl"
                >
                  {title}
                </h1>
                {displayHandle ? (
                  <p className="truncate text-xs text-[#678] lg:text-[13px]">
                    @{displayHandle}
                  </p>
                ) : null}
              </div>
              <div className="w-10 shrink-0" aria-hidden />
            </div>
            <div className="mx-auto hidden max-w-[1800px] border-t border-[#1f252d] px-8 py-2.5 lg:flex xl:px-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#678]">
                {sheet === "all"
                  ? "Todos los juegos"
                  : "Actividad registrada este año"}
              </p>
            </div>
          </header>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 lg:px-8 lg:pt-4 xl:px-10"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {loading || items == null ? (
              <p className="py-16 text-center text-sm text-[#9ab]">
                {loading ? "Cargando…" : ""}
              </p>
            ) : err ? (
              <p className="px-4 py-8 text-center text-sm text-red-300">
                {err}
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-16 text-center text-sm text-[#678]">
                {sheet === "this_year"
                  ? "Aún no hay actividad registrada este año."
                  : "Aún no hay juegos en tu historial."}
              </p>
            ) : (
              <div className="mx-auto w-full max-w-[1800px]">
                <ul
                  className="
                    grid grid-cols-4 gap-1 gap-y-1.5
                    sm:grid-cols-5 sm:gap-1
                    md:grid-cols-6
                    lg:grid-cols-none lg:gap-x-1 lg:gap-y-2
                    lg:[grid-template-columns:repeat(auto-fill,minmax(7rem,1fr))]
                    xl:[grid-template-columns:repeat(auto-fill,minmax(7.25rem,1fr))]
                    2xl:[grid-template-columns:repeat(auto-fill,minmax(7.5rem,1fr))]
                  "
                >
                  {items.map((g) => (
                    <li key={`${sheet}-${g.rawg_id}`} className="min-w-0">
                      <Link
                        href={`/games/${g.rawg_id}`}
                        className="group/card block min-w-0"
                        onClick={close}
                      >
                        <div className="relative aspect-2/3 w-full overflow-hidden rounded-sm bg-[#1f252d] ring-1 ring-black/50 transition duration-200 group-hover/card:z-[1] group-hover/card:ring-2 group-hover/card:ring-[#40bcf4]/50 group-hover/card:brightness-[1.08] lg:rounded-[3px]">
                          {g.background_image ? (
                            <Image
                              src={g.background_image}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-200 group-hover/card:scale-[1.03]"
                              sizes={GRID_SIZES}
                              quality={RAWG_COVER_QUALITY}
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center px-0.5 text-center text-[8px] leading-tight text-[#567] lg:text-[9px]">
                              {g.game_name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex min-h-4 flex-wrap items-center justify-center gap-0.5 px-0.5 pb-0.5 lg:mt-1.5 lg:min-h-[1.125rem]">
                          {g.rating != null && g.rating > 0 ? (
                            <span className="origin-center scale-90 lg:scale-95">
                              <HalfStarRatingDisplay
                                value={g.rating}
                                size="sm"
                              />
                            </span>
                          ) : (
                            <span className="text-[8px] text-[#567] lg:text-[9px]">
                              —
                            </span>
                          )}
                          {g.liked ? (
                            <span
                              className="text-[10px] leading-none text-orange-400/90 lg:text-[11px]"
                              title="Te gustó al reseñar"
                              aria-hidden
                            >
                              ♥
                            </span>
                          ) : null}
                          {g.is_favorite ? (
                            <span
                              className="text-[9px] leading-none text-amber-400/90 lg:text-[10px]"
                              title="En favoritos"
                              aria-hidden
                            >
                              ★
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function StatCell({
  stat,
  interactive,
  layout = "mobile",
  onOpenGames,
}: {
  stat: Stat;
  interactive: boolean;
  layout?: "mobile" | "desktop";
  onOpenGames?: () => void;
}) {
  if (interactive && onOpenGames) {
    if (layout === "desktop") {
      return (
        <button
          type="button"
          onClick={onOpenGames}
          className="group flex min-w-[3.5rem] flex-col items-end rounded-lg px-2 py-1.5 text-right transition-colors duration-200 hover:bg-white/[0.07] hover:ring-1 hover:ring-[#40bcf4]/30 sm:min-w-[4rem] sm:px-2.5 sm:py-2"
        >
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-white transition-colors duration-200 group-hover:text-[#5ccfff] xl:text-4xl">
            {stat.value}
          </span>
          <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#678] transition-colors duration-200 group-hover:text-[#9ab]">
            {stat.label}
          </span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onOpenGames}
        className="group flex min-h-[4.25rem] flex-col items-center justify-center rounded-xl bg-[#1a1f26] px-2 py-3 text-center ring-1 ring-[#2f3642] transition-all duration-200 hover:bg-[#222830] hover:ring-[#40bcf4]/45 sm:min-h-[4.5rem] sm:px-3 sm:py-3.5"
      >
        <span className="text-[1.625rem] font-bold tabular-nums leading-none tracking-tight text-white transition-colors duration-200 group-hover:text-[#5ccfff] sm:text-[1.75rem]">
          {stat.value}
        </span>
        <span className="mt-2 max-w-[11rem] text-[9px] font-semibold uppercase leading-tight tracking-[0.15em] text-[#8b9cad] transition-colors duration-200 group-hover:text-[#bcd] sm:max-w-none sm:text-[10px] sm:tracking-[0.16em]">
          {stat.label}
        </span>
      </button>
    );
  }

  if (layout === "desktop") {
    return (
      <div className="group flex min-w-[3.5rem] flex-col items-end rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.06] sm:min-w-[4rem] sm:px-2.5 sm:py-2">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-white transition-colors duration-200 group-hover:text-[#bcd] xl:text-4xl">
          {stat.value}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#678] transition-colors duration-200 group-hover:text-[#9ab]">
          {stat.label}
        </p>
      </div>
    );
  }

  return (
    <div className="group flex min-h-[4.25rem] flex-col items-center justify-center rounded-xl bg-[#1a1f26] px-2 py-3 text-center ring-1 ring-[#2f3642] transition-all duration-200 hover:bg-[#222830] hover:ring-[#3d4a58] sm:min-h-[4.5rem] sm:px-3 sm:py-3.5">
      <p className="text-[1.625rem] font-bold tabular-nums leading-none tracking-tight text-white transition-colors duration-200 group-hover:text-[#bcd] sm:text-[1.75rem]">
        {stat.value}
      </p>
      <p className="mt-2 max-w-[11rem] text-[9px] font-semibold uppercase leading-tight tracking-[0.15em] text-[#8b9cad] transition-colors duration-200 group-hover:text-[#9ab] sm:max-w-none sm:text-[10px] sm:tracking-[0.16em]">
        {stat.label}
      </p>
    </div>
  );
}
