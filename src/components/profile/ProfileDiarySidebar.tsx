import Link from "next/link";
import type { DiaryEntry } from "@/lib/supabase/profile-diary";

const MONTHS_ES_SHORT = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
] as const;

const PREVIEW_LIMIT = 28;

type MonthGroup = {
  key: string;
  label: string;
  items: DiaryEntry[];
};

function isGameDiaryEntry(e: DiaryEntry): boolean {
  return (
    Boolean(e.gameName) &&
    (e.kind === "activity" ||
      e.kind === "review" ||
      e.kind === "backlog" ||
      e.kind === "review_liked")
  );
}

function ymKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function dayOfMonth(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, "0");
}

function monthLabelFromKey(key: string): string {
  const part = key.split("-")[1];
  const idx = part ? Number.parseInt(part, 10) - 1 : -1;
  if (idx < 0 || idx > 11) return "?";
  return MONTHS_ES_SHORT[idx] ?? "?";
}

function groupSidebarEntries(entries: DiaryEntry[]): MonthGroup[] {
  const gameEntries = entries.filter(isGameDiaryEntry);
  const limited = gameEntries.slice(0, PREVIEW_LIMIT);
  const map = new Map<string, DiaryEntry[]>();
  for (const e of limited) {
    const key = ymKey(e.at);
    const list = map.get(key) ?? [];
    list.push(e);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
  }
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  return keys.map((key) => ({
    key,
    label: monthLabelFromKey(key),
    items: map.get(key)!,
  }));
}

function DiaryMonthIcon({ label }: { label: string }) {
  return (
    <div
      className="w-[2.375rem] shrink-0 overflow-hidden rounded-md border border-[#2f3642] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-hidden
    >
      {/* Franja superior (espiral / anillas), más oscura que el cuerpo */}
      <div className="relative flex h-[1.125rem] items-end justify-center gap-[5px] bg-[#0a0d11] px-1 pb-1 pt-0.5">
        <span className="size-[6px] shrink-0 rounded-full border border-[#1f252d] bg-[#14181c] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
        <span className="size-[6px] shrink-0 rounded-full border border-[#1f252d] bg-[#14181c] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
        <span className="size-[6px] shrink-0 rounded-full border border-[#1f252d] bg-[#14181c] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
      </div>
      {/* Cuerpo: azul grisáceo apagado; mes en un tono más oscuro (bajo contraste) */}
      <div className="flex min-h-[2.5rem] items-center justify-center bg-[#3a4654] px-0.5 py-1.5">
        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.08em] text-[#c8d4de]">
          {label}
        </span>
      </div>
    </div>
  );
}

type Props = {
  entries: DiaryEntry[];
  /** Total de entradas del diario (incl. sociales), igual que en /profile/diary. */
  totalCount: number;
  viewAllHref: string | null;
};

export function ProfileDiarySidebar({
  entries,
  totalCount,
  viewAllHref,
}: Props) {
  const groups = groupSidebarEntries(entries);
  const allGameCount = entries.filter(isGameDiaryEntry).length;
  const truncated = viewAllHref != null && allGameCount > PREVIEW_LIMIT;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-[#2f3642] pb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Diario
        </h2>
        <span className="text-xs font-semibold tabular-nums text-[#9ab]">
          {totalCount}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="text-xs leading-relaxed text-[#678]">
          {totalCount > 0 ? (
            <>
              Aquí solo se listan juegos (actividad, reseñas, backlog).{" "}
              {viewAllHref != null ? (
                <Link
                  href={viewAllHref}
                  className="text-[#40bcf4] transition hover:text-[#5ccfff]"
                >
                  Ver diario completo
                </Link>
              ) : null}
            </>
          ) : viewAllHref != null ? (
            <>
              Sin entradas aún.{" "}
              <Link
                href="/games"
                className="text-[#40bcf4] transition hover:text-[#5ccfff]"
              >
                Explorar juegos
              </Link>
            </>
          ) : (
            "Sin actividad reciente en el diario."
          )}
        </p>
      ) : (
        <div className="divide-y divide-[#2f3642]">
          {groups.map((g) => (
            <div
              key={g.key}
              className="flex items-start gap-3 py-3 first:pt-0"
            >
              <DiaryMonthIcon label={g.label} />
              <ul className="min-w-0 flex-1 space-y-1.5">
                {g.items.map((e) => (
                  <li
                    key={e.id}
                    className="flex gap-2 text-[13px] leading-snug"
                  >
                    <span className="w-6 shrink-0 tabular-nums text-[#9ab]">
                      {dayOfMonth(e.at)}
                    </span>
                    <div className="min-w-0 flex-1">
                      {e.igdbId != null ? (
                        <Link
                          href={`/games/${e.igdbId}`}
                          className="text-[#40bcf4] transition hover:text-[#5ccfff]"
                        >
                          <span className="line-clamp-2">{e.gameName}</span>
                        </Link>
                      ) : (
                        <span className="text-[#bcd] line-clamp-2">
                          {e.gameName}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {truncated && viewAllHref != null ? (
        <p className="mt-3 text-center">
          <Link
            href={viewAllHref}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#678] transition hover:text-[#40bcf4]"
          >
            Ver diario completo
          </Link>
        </p>
      ) : null}
    </section>
  );
}
