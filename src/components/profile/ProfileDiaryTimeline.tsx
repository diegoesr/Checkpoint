import Image from "next/image";
import Link from "next/link";
import { HalfStarRatingDisplay } from "@/components/profile/HalfStarRatingDisplay";
import {
  formatDiaryDayHeading,
  formatShortDate,
} from "@/lib/profile-display";
import { publicProfilePath } from "@/lib/public-profile";
import type { DiaryEntry } from "@/lib/supabase/profile-diary";
import {
  RAWG_COVER_QUALITY,
  RAWG_COVER_SIZES_POSTER_COMPACT,
} from "@/lib/rawg-image";

function localYmd(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupByDay(entries: DiaryEntry[]): Map<string, DiaryEntry[]> {
  const map = new Map<string, DiaryEntry[]>();
  for (const e of entries) {
    const key = localYmd(e.at);
    const list = map.get(key) ?? [];
    list.push(e);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
  }
  return map;
}

function excerpt(text: string | null | undefined, max = 220): string {
  if (!text?.trim()) return "";
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function kindLabel(kind: DiaryEntry["kind"]): string {
  switch (kind) {
    case "activity":
      return "Actividad";
    case "review":
      return "Reseña";
    case "backlog":
      return "Backlog";
    case "follow_user":
      return "Siguiendo";
    case "new_follower":
      return "Nuevo seguidor";
    case "review_liked":
      return "Like en reseña";
    default:
      return "";
  }
}

export function ProfileDiaryTimeline({ entries }: { entries: DiaryEntry[] }) {
  if (!entries.length) {
    return (
      <p className="text-sm text-[#678]">
        Aún no hay entradas en tu diario. Registra actividad, escribe reseñas,
        añade juegos a tu backlog o conecta con otros jugadores.
      </p>
    );
  }

  const byDay = groupByDay(entries);
  const days = [...byDay.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-10">
      {days.map((day) => (
        <section key={day}>
          <h2 className="mb-4 border-b border-[#2f3642] pb-2 text-sm font-semibold capitalize tracking-wide text-[#bcd]">
            {formatDiaryDayHeading(day)}
          </h2>
          <ul className="space-y-0 divide-y divide-[#2f3642]">
            {byDay.get(day)!.map((e) => {
              const isSocial =
                e.kind === "follow_user" || e.kind === "new_follower";
              const friendLabel =
                e.friend?.display_name?.trim() ||
                e.friend?.username ||
                "Jugador";

              const dayOfMonth = new Date(e.at).getDate();

              return (
              <li
                key={e.id}
                className="flex gap-2 py-5 first:pt-0 sm:items-center sm:gap-4"
              >
                {!isSocial ? (
                  <span
                    className="w-7 shrink-0 self-start pt-0.5 text-right text-xl font-bold tabular-nums leading-none text-[#bcd] sm:w-8 sm:pt-1 sm:text-2xl md:hidden"
                    aria-hidden
                  >
                    {dayOfMonth}
                  </span>
                ) : null}
                {isSocial ? (
                  <div className="relative size-[3.25rem] shrink-0 overflow-hidden rounded-full bg-[#1f252d] shadow-md ring-2 ring-cyan-500/45 ring-offset-2 ring-offset-[#14181c] sm:size-16">
                    {e.friend?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL externa (proveedor OAuth)
                      <img
                        src={e.friend.avatar_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-base font-bold tabular-nums text-cyan-200/90 sm:text-lg">
                        {friendLabel.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-[5.5rem] w-11 shrink-0 overflow-hidden rounded bg-[#1f252d] ring-1 ring-[#2f3642] sm:h-24 sm:w-14">
                    {e.backgroundImage ? (
                      <Image
                        src={e.backgroundImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes={RAWG_COVER_SIZES_POSTER_COMPACT}
                        quality={RAWG_COVER_QUALITY}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-[#567]">
                        —
                      </div>
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#678]">
                    {kindLabel(e.kind)}
                    <span className="mx-1.5 text-[#456]">·</span>
                    <time dateTime={e.at}>{formatShortDate(e.at)}</time>
                  </p>
                  {e.kind === "follow_user" ? (
                    <p className="mt-1 text-sm text-[#bcd]">
                      Empezaste a seguir a{" "}
                      {e.friend ? (
                        <Link
                          href={publicProfilePath(e.friend)}
                          className="font-semibold text-emerald-400/90 hover:underline"
                        >
                          {e.friend.display_name ?? e.friend.username ?? "un jugador"}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[#bcd]">
                          un jugador
                        </span>
                      )}
                      .
                    </p>
                  ) : null}
                  {e.kind === "new_follower" ? (
                    <p className="mt-1 text-sm text-[#bcd]">
                      {e.friend ? (
                        <Link
                          href={publicProfilePath(e.friend)}
                          className="font-semibold text-emerald-400/90 hover:underline"
                        >
                          {e.friend.display_name ?? e.friend.username ?? "Alguien"}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[#bcd]">Alguien</span>
                      )}{" "}
                      empezó a seguirte.
                    </p>
                  ) : null}
                  {e.kind === "review_liked" ? (
                    <p className="mt-1 text-sm text-[#bcd]">
                      {e.friend ? (
                        <Link
                          href={publicProfilePath(e.friend)}
                          className="font-semibold text-emerald-400/90 hover:underline"
                        >
                          {e.friend.display_name ??
                            e.friend.username ??
                            "Alguien"}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[#bcd]">Alguien</span>
                      )}{" "}
                      le gustó tu reseña de{" "}
                      {e.rawgId != null ? (
                        <Link
                          href={`/games/${e.rawgId}`}
                          className="font-semibold text-white hover:underline"
                        >
                          {e.gameName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-white">
                          {e.gameName}
                        </span>
                      )}
                      .
                    </p>
                  ) : null}
                  {e.kind === "activity" ? (
                    <>
                      <p className="mt-1 text-base font-semibold text-white">
                        {e.gameName}
                      </p>
                      <p className="mt-1 text-sm text-[#9ab]">
                        Registró que está jugando
                        {e.activityHoursLabel ? (
                          <> · {e.activityHoursLabel}</>
                        ) : null}
                        {e.activityPlatformLabel ? (
                          <> · {e.activityPlatformLabel}</>
                        ) : null}
                        .
                      </p>
                    </>
                  ) : null}
                  {e.kind === "backlog" ? (
                    <>
                      <p className="mt-1 text-base font-semibold text-white">
                        {e.rawgId != null ? (
                          <Link
                            href={`/games/${e.rawgId}`}
                            className="text-white hover:text-emerald-400/90 hover:underline"
                          >
                            {e.gameName}
                          </Link>
                        ) : (
                          e.gameName
                        )}
                      </p>
                      <p className="mt-1 text-sm text-[#9ab]">
                        Añadido al backlog (pendiente de jugar).
                      </p>
                    </>
                  ) : null}
                  {e.kind === "review" ? (
                    <>
                      <p className="mt-1 text-base font-semibold text-white">
                        {e.gameName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#9ab]">
                        <HalfStarRatingDisplay value={e.reviewRating ?? null} />
                        {e.liked ? (
                          <span className="text-orange-400/90" aria-hidden>
                            ♥
                          </span>
                        ) : null}
                        {e.isReplay ? <span>Rejugada</span> : null}
                      </div>
                      {e.reviewBody && e.reviewBody.trim() ? (
                        <p className="mt-2 text-sm leading-relaxed text-[#bcd]">
                          {excerpt(e.reviewBody)}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
