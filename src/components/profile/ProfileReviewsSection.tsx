import Image from "next/image";
import Link from "next/link";
import { HalfStarRatingDisplay } from "@/components/profile/HalfStarRatingDisplay";
import { gamePlatformLabel } from "@/lib/game-platforms";
import {
  formatDiaryDayHeading,
  formatPlaytimeHours,
  formatShortDate,
} from "@/lib/profile-display";
import type { GameReviewRecord } from "@/lib/supabase/profile-dashboard";
import {
  GAME_COVER_QUALITY,
  GAME_COVER_SIZES_POSTER_COMPACT,
  GAME_COVER_SIZES_REVIEW_ROW,
} from "@/lib/game-image";
import { ReviewLikeButton } from "@/components/profile/ReviewLikeButton";

const MOBILE_ACTIVITY_GRID_SIZES = "(max-width: 768px) 23vw, 120px";

function localYmd(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupReviewsByDay(
  list: GameReviewRecord[],
): Map<string, GameReviewRecord[]> {
  const map = new Map<string, GameReviewRecord[]>();
  for (const r of list) {
    const key = localYmd(r.created_at);
    const g = map.get(key) ?? [];
    g.push(r);
    map.set(key, g);
  }
  for (const g of map.values()) {
    g.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return map;
}

function ReviewTextBadge({ className }: { className?: string }) {
  return (
    <span
      className={className}
      title="Reseña escrita"
      aria-label="Incluye texto de reseña"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5 shrink-0 text-[#678]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    </span>
  );
}

type Props = {
  reviews: GameReviewRecord[];
  emptyMessage: string;
  /** Título de la sección. */
  heading?: string;
  /** Enlace «Ver todas» (p. ej. /profile/reviews o /u/slug/reviews). */
  viewAllHref?: string | null;
  /** Si true, no se muestra el h2 de la sección en móvil (p. ej. la página ya tiene h1 estilo diario). */
  hideHeadingOnMobile?: boolean;
  /** Dueño de las reseñas listadas. */
  reviewOwnerUserId: string;
  /** Usuario con sesión (mismas páginas exigen login). */
  viewerUserId: string;
};

export function ProfileReviewsSection({
  reviews,
  emptyMessage,
  heading = "Reseñas recientes",
  viewAllHref,
  hideHeadingOnMobile = false,
  reviewOwnerUserId,
  viewerUserId,
}: Props) {
  const mobilePreview = reviews.slice(0, 4);
  const byDayMobile =
    !viewAllHref && reviews.length > 0
      ? groupReviewsByDay(reviews)
      : null;
  const mobileDayKeys = byDayMobile
    ? [...byDayMobile.keys()].sort((a, b) => b.localeCompare(a))
    : [];

  return (
    <section>
      <div
        className={`mb-4 flex flex-wrap items-baseline justify-between gap-3 gap-y-2 max-md:justify-center ${hideHeadingOnMobile ? "max-md:hidden" : ""}`}
      >
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#678] md:text-[11px] md:tracking-[0.2em]">
          {heading}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-[#40bcf4] transition hover:text-[#5ccfff] md:inline-block"
          >
            Ver todas
          </Link>
        ) : null}
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-[#678]">{emptyMessage}</p>
      ) : (
        <>
          {viewAllHref ? (
            <div className="md:hidden">
              <ul className="grid grid-cols-4 gap-1">
                {mobilePreview.map((r) => (
                  <li key={r.id} className="flex flex-col items-center">
                    <Link
                      href={`/games/${r.igdb_id}`}
                      className="block w-full"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm bg-[#1f252d] ring-1 ring-[#2f3642]">
                        {r.background_image ? (
                          <Image
                            src={r.background_image}
                            alt=""
                            fill
                            quality={GAME_COVER_QUALITY}
                            className="object-cover"
                            sizes={MOBILE_ACTIVITY_GRID_SIZES}
                          />
                        ) : null}
                      </div>
                    </Link>
                    <div className="mt-1 flex min-h-[1rem] flex-wrap items-center justify-center gap-0.5">
                      <HalfStarRatingDisplay
                        value={r.rating}
                        size="sm"
                      />
                      {r.body?.trim() ? (
                        <ReviewTextBadge className="inline-flex" />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={viewAllHref}
                className="mt-1 flex w-full items-center justify-center gap-1 border-t border-[#2f3642] py-3.5 text-[13px] font-medium text-[#9ab] transition hover:text-white"
              >
                Más actividad
                <span className="text-lg leading-none text-[#678]" aria-hidden>
                  ›
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-10 md:hidden">
              {mobileDayKeys.map((day) => (
                <section key={day}>
                  <h2 className="mb-4 border-b border-[#2f3642] pb-2 text-sm font-semibold capitalize tracking-wide text-[#bcd]">
                    {formatDiaryDayHeading(day)}
                  </h2>
                  <ul className="space-y-0 divide-y divide-[#2f3642]">
                    {byDayMobile!.get(day)!.map((r) => {
                      const dayOfMonth = new Date(r.created_at).getDate();
                      const hLabel = formatPlaytimeHours(r.playtime_hours);
                      const pl = gamePlatformLabel(r.platform);
                      const n = r.likeCount ?? 0;
                      const isOwner = reviewOwnerUserId === viewerUserId;
                      return (
                        <li
                          key={r.id}
                          className="flex gap-2 py-5 first:pt-0 sm:items-center sm:gap-4"
                        >
                          <span
                            className="w-7 shrink-0 self-start pt-0.5 text-right text-xl font-bold tabular-nums leading-none text-[#bcd] sm:w-8 sm:pt-1 sm:text-2xl"
                            aria-hidden
                          >
                            {dayOfMonth}
                          </span>
                          <Link
                            href={`/games/${r.igdb_id}`}
                            className="relative block h-[5.5rem] w-11 shrink-0 overflow-hidden rounded bg-[#1f252d] ring-1 ring-[#2f3642] sm:h-24 sm:w-14"
                          >
                            {r.background_image ? (
                              <Image
                                src={r.background_image}
                                alt=""
                                fill
                                quality={GAME_COVER_QUALITY}
                                className="object-cover"
                                sizes={GAME_COVER_SIZES_POSTER_COMPACT}
                              />
                            ) : (
                              <span className="flex size-full items-center justify-center text-[10px] text-[#567]">
                                —
                              </span>
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#678]">
                              Reseña
                              <span className="mx-1.5 text-[#456]">·</span>
                              <time dateTime={r.created_at}>
                                {formatShortDate(r.created_at)}
                              </time>
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              <Link
                                href={`/games/${r.igdb_id}`}
                                className="text-white hover:text-emerald-400/90 hover:underline"
                              >
                                {r.game_name}
                              </Link>
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#9ab]">
                              <HalfStarRatingDisplay value={r.rating} />
                              {r.liked ? (
                                <span className="text-orange-400/90" aria-hidden>
                                  ♥
                                </span>
                              ) : null}
                              {r.is_replay ? <span>Rejugada</span> : null}
                            </div>
                            {r.started_on ||
                            r.finished_on ||
                            hLabel ||
                            pl ? (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9ab]">
                                {r.started_on ? (
                                  <span>
                                    Empezó{" "}
                                    {formatShortDate(
                                      `${r.started_on}T12:00:00`,
                                    )}
                                  </span>
                                ) : null}
                                {r.finished_on ? (
                                  <span>
                                    {r.started_on ? (
                                      <span className="text-[#567]">· </span>
                                    ) : null}
                                    Terminó{" "}
                                    {formatShortDate(
                                      `${r.finished_on}T12:00:00`,
                                    )}
                                  </span>
                                ) : null}
                                {hLabel ? (
                                  <>
                                    <span className="text-[#567]">·</span>
                                    <span>{hLabel}</span>
                                  </>
                                ) : null}
                                {pl ? (
                                  <>
                                    <span className="text-[#567]">·</span>
                                    <span>{pl}</span>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                            {r.body?.trim() ? (
                              <p className="mt-2 text-sm leading-relaxed text-[#bcd]">
                                {r.body}
                              </p>
                            ) : null}
                            {isOwner && n === 0 ? null : (
                              <div className="mt-3">
                                <ReviewLikeButton
                                  reviewId={r.id}
                                  initialLiked={Boolean(r.likedByViewer)}
                                  initialCount={n}
                                  readOnly={isOwner}
                                />
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <ul className="hidden divide-y divide-[#2f3642] md:block">
          {reviews.map((r) => (
            <li key={r.id} className="flex gap-4 py-6 first:pt-0">
              <div className="relative h-28 w-[4.5rem] shrink-0 overflow-hidden rounded bg-[#1f252d] ring-1 ring-[#2f3642] sm:h-32 sm:w-20">
                {r.background_image ? (
                  <Image
                    src={r.background_image}
                    alt=""
                    fill
                    quality={GAME_COVER_QUALITY}
                    className="object-cover"
                    sizes={GAME_COVER_SIZES_REVIEW_ROW}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-white sm:text-lg">
                  {r.game_name}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9ab]">
                  <HalfStarRatingDisplay value={r.rating} />
                  {r.liked ? (
                    <>
                      <span className="text-[#567]">·</span>
                      <span className="text-orange-400/90" aria-hidden>
                        ♥
                      </span>
                    </>
                  ) : null}
                  {r.is_replay ? (
                    <>
                      <span className="text-[#567]">·</span>
                      <span>Rejugada</span>
                    </>
                  ) : null}
                  <span className="text-[#567]">·</span>
                  <time dateTime={r.created_at}>
                    {formatShortDate(r.created_at)}
                  </time>
                  {r.started_on ? (
                    <>
                      <span className="text-[#567]">·</span>
                      <span>
                        Empezó{" "}
                        {formatShortDate(`${r.started_on}T12:00:00`)}
                      </span>
                    </>
                  ) : null}
                  {r.finished_on ? (
                    <>
                      <span className="text-[#567]">·</span>
                      <span>
                        Terminó{" "}
                        {formatShortDate(`${r.finished_on}T12:00:00`)}
                      </span>
                    </>
                  ) : null}
                  {(() => {
                    const hLabel = formatPlaytimeHours(r.playtime_hours);
                    return hLabel ? (
                      <>
                        <span className="text-[#567]">·</span>
                        <span>{hLabel}</span>
                      </>
                    ) : null;
                  })()}
                  {(() => {
                    const pl = gamePlatformLabel(r.platform);
                    return pl ? (
                      <>
                        <span className="text-[#567]">·</span>
                        <span>{pl}</span>
                      </>
                    ) : null;
                  })()}
                </div>
                {r.body && r.body.trim() ? (
                  <p className="mt-2 text-sm leading-relaxed text-[#bcd]">
                    {r.body}
                  </p>
                ) : null}
                {(() => {
                  const n = r.likeCount ?? 0;
                  const isOwner = reviewOwnerUserId === viewerUserId;
                  if (isOwner && n === 0) return null;
                  return (
                    <div className="mt-3">
                      <ReviewLikeButton
                        reviewId={r.id}
                        initialLiked={Boolean(r.likedByViewer)}
                        initialCount={n}
                        readOnly={isOwner}
                      />
                    </div>
                  );
                })()}
              </div>
            </li>
          ))}
        </ul>
        </>
      )}
    </section>
  );
}
