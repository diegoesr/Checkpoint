import Link from "next/link";
import { HalfStarRatingDisplay } from "@/components/profile/HalfStarRatingDisplay";
import {
  formatRelativeTimeShort,
  formatShortDate,
} from "@/lib/profile-display";
import { publicProfilePath } from "@/lib/public-profile";
import type { DiaryEntry } from "@/lib/supabase/profile-diary";

const FEED_PREVIEW = 5;

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function friendLabel(f: DiaryEntry["friend"]): string {
  if (!f) return "un jugador";
  return f.display_name?.trim() || f.username || "Jugador";
}

type Props = {
  entries: DiaryEntry[];
  /** Enlace al diario completo; si es null se oculta «Todo». */
  diaryHref: string | null;
};

export function ProfileActivityFeed({ entries, diaryHref }: Props) {
  const shown = entries.slice(0, FEED_PREVIEW);
  const rel = (iso: string) => formatRelativeTimeShort(iso);

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 border-b border-[#2f3642] pb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Actividad
        </h2>
        {diaryHref != null ? (
          <Link
            href={diaryHref}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ab] transition hover:text-[#40bcf4]"
          >
            <BoltIcon className="size-3.5 shrink-0 opacity-90" />
            Todo
          </Link>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-[#678]">
          Aún no hay actividad en el diario.
        </p>
      ) : (
        <ul className="relative mt-4 list-none space-y-0 p-0 pl-1">
          <div
            className="absolute bottom-2 left-[7px] top-2 w-px bg-[#2f3642]"
            aria-hidden
          />
          {shown.map((e) => (
            <li key={e.id} className="relative pb-5 pl-6 last:pb-1">
              <span
                className="absolute left-[5px] top-[0.35rem] z-1 size-2 rounded-full bg-[#567] ring-2 ring-[#14181c]"
                aria-hidden
              />
              <div className="min-w-0 text-sm leading-relaxed">
                {e.kind === "follow_user" ? (
                  <p className="text-[#678]">
                    <span>Sigues a </span>
                    {e.friend ? (
                      <Link
                        href={publicProfilePath(e.friend)}
                        className="font-bold text-white transition hover:text-[#40bcf4]"
                      >
                        {friendLabel(e.friend)}
                      </Link>
                    ) : (
                      <span className="font-bold text-white">
                        {friendLabel(e.friend)}
                      </span>
                    )}
                    <span className="tabular-nums"> {rel(e.at)}</span>
                  </p>
                ) : null}

                {e.kind === "new_follower" ? (
                  <p className="text-[#678]">
                    <span>Nuevo seguidor: </span>
                    {e.friend ? (
                      <Link
                        href={publicProfilePath(e.friend)}
                        className="font-bold text-white transition hover:text-[#40bcf4]"
                      >
                        {friendLabel(e.friend)}
                      </Link>
                    ) : (
                      <span className="font-bold text-white">Alguien</span>
                    )}
                    <span className="tabular-nums"> {rel(e.at)}</span>
                  </p>
                ) : null}

                {e.kind === "review_liked" && e.gameName ? (
                  <p className="text-[#678]">
                    {e.friend ? (
                      <Link
                        href={publicProfilePath(e.friend)}
                        className="font-bold text-white transition hover:text-[#40bcf4]"
                      >
                        {friendLabel(e.friend)}
                      </Link>
                    ) : (
                      <span className="font-bold text-white">Alguien</span>
                    )}
                    <span> le gustó tu reseña de </span>
                    {e.rawgId != null ? (
                      <Link
                        href={`/games/${e.rawgId}`}
                        className="font-bold text-white transition hover:text-[#40bcf4]"
                      >
                        <span className="break-words">{e.gameName}</span>
                      </Link>
                    ) : (
                      <span className="break-words font-bold text-white">
                        {e.gameName}
                      </span>
                    )}
                    <span className="tabular-nums"> {rel(e.at)}</span>
                  </p>
                ) : null}

                {(e.kind === "activity" ||
                  e.kind === "review" ||
                  e.kind === "backlog") &&
                e.gameName ? (
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                    <span className="text-[#678]">
                      {e.kind === "activity"
                        ? "Registraste que juegas"
                        : e.kind === "backlog"
                          ? "Añadiste al backlog"
                          : (() => {
                              const r =
                                e.reviewRating != null &&
                                Number(e.reviewRating) > 0;
                              if (r) return "Calificaste";
                              if (e.liked) return "Te gustó";
                              return "Reseñaste";
                            })()}
                    </span>
                    {e.rawgId != null ? (
                      <Link
                        href={`/games/${e.rawgId}`}
                        className="min-w-0 font-bold text-white transition hover:text-[#40bcf4]"
                      >
                        <span className="break-words">{e.gameName}</span>
                      </Link>
                    ) : (
                      <span className="min-w-0 break-words font-bold text-white">
                        {e.gameName}
                      </span>
                    )}
                    {e.kind === "review" &&
                    e.reviewRating != null &&
                    Number(e.reviewRating) > 0 ? (
                      <span className="inline-flex items-baseline gap-1">
                        <HalfStarRatingDisplay
                          value={e.reviewRating}
                          size="sm"
                        />
                        {e.liked ? (
                          <span
                            className="text-orange-400/90"
                            aria-label="Me gusta"
                          >
                            ♥
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                    <span className="tabular-nums text-[#678]">
                      {rel(e.at)}
                    </span>
                  </div>
                ) : null}

                {e.kind === "activity" &&
                (e.activityHoursLabel || e.activityPlatformLabel) ? (
                  <p className="mt-1 text-xs text-[#678]">
                    {e.activityHoursLabel ? (
                      <span>{e.activityHoursLabel}</span>
                    ) : null}
                    {e.activityHoursLabel && e.activityPlatformLabel ? (
                      <span> · </span>
                    ) : null}
                    {e.activityPlatformLabel ? (
                      <span>{e.activityPlatformLabel}</span>
                    ) : null}
                  </p>
                ) : null}

                {e.kind === "review" &&
                e.reviewBody != null &&
                e.reviewBody.trim() ? (
                  <p className="mt-1 line-clamp-2 text-xs text-[#9ab]">
                    {e.reviewBody.trim()}
                  </p>
                ) : null}

                {e.kind !== "follow_user" &&
                e.kind !== "new_follower" &&
                e.kind !== "review_liked" &&
                Date.now() - new Date(e.at).getTime() >
                  14 * 24 * 60 * 60 * 1000 ? (
                  <p className="mt-1 text-xs text-[#567]">
                    el {formatShortDate(e.at)}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {entries.length > FEED_PREVIEW && diaryHref != null ? (
        <p className="mt-2 text-center">
          <Link
            href={diaryHref}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#678] transition hover:text-[#40bcf4]"
          >
            Ver toda la actividad
          </Link>
        </p>
      ) : null}
    </section>
  );
}
