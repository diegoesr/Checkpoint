import Image from "next/image";
import Link from "next/link";
import type { UserListWithPreview } from "@/lib/supabase/user-lists";
import { RAWG_COVER_QUALITY } from "@/lib/rawg-image";

const PREVIEW_LISTS = 4;
const STACK_SLOTS = 5;

/** Altura de la franja de portadas (2:3); cabe en ~280px de columna con solape. */
const STACK_H = "h-[8.75rem]";
/** Ancho de cada portada ≈ altura × 2/3 */
const POSTER_W = "w-[5.833rem]";
/** Solapamiento ~50 % para la pila sin desbordar el aside */
const OVERLAP = "-ml-[2.92rem]";

type Props = {
  lists: UserListWithPreview[];
  totalCount: number;
  viewAllHref: string | null;
};

function ListPosterStack({
  images,
  /** Primera lista del aside: prioriza descarga (el resto sigue en lazy). */
  preloadCovers = false,
}: {
  images: string[];
  preloadCovers?: boolean;
}) {
  const urls: (string | null)[] = [];
  for (let i = 0; i < STACK_SLOTS; i++) {
    urls.push(images[i] ?? null);
  }

  return (
    <div
      className={`flex ${STACK_H} w-full max-w-full overflow-hidden rounded-sm`}
    >
      {urls.map((url, i) => (
        <div
          key={i}
          className={`relative ${STACK_H} ${POSTER_W} shrink-0 overflow-hidden rounded-sm bg-[#1f252d] shadow-[2px_0_10px_rgba(0,0,0,0.45)] ring-1 ring-[#2f3642] ${
            i === 0 ? "ml-0" : OVERLAP
          }`}
          style={{ zIndex: STACK_SLOTS - i }}
        >
          {url ? (
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
              quality={RAWG_COVER_QUALITY}
              priority={preloadCovers && i < 3}
            />
          ) : (
            <span className="sr-only">Sin carátula</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function ProfileListsSidebar({
  lists,
  totalCount,
  viewAllHref,
}: Props) {
  const shown = lists.slice(0, PREVIEW_LISTS);
  const truncated = viewAllHref != null && totalCount > PREVIEW_LISTS;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-2 border-b border-[#2f3642] pb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Listas recientes
        </h2>
        <span className="text-xs font-semibold tabular-nums text-[#9ab]">
          {totalCount}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-[#678]">
          {viewAllHref != null ? (
            <>
              Sin listas aún.{" "}
              <Link
                href="/lists/new"
                className="text-[#40bcf4] transition hover:text-[#5ccfff]"
              >
                Crear lista
              </Link>
            </>
          ) : (
            "Sin listas públicas."
          )}
        </p>
      ) : (
        <ul className="list-none space-y-7 p-0">
          {shown.map((list, index) => (
            <li key={list.id}>
              <Link
                href={`/lists/${list.id}`}
                className="group block outline-none focus-visible:ring-2 focus-visible:ring-[#40bcf4]/50"
              >
                <div className={index === 0 ? "-mt-[2px]" : undefined}>
                  <ListPosterStack
                    images={list.preview_images}
                    preloadCovers={index === 0}
                  />
                </div>
                <p className="mt-3 text-sm font-bold leading-snug text-white transition group-hover:text-[#40bcf4]">
                  {list.name}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-[#9ab]">
                  {list.game_count}{" "}
                  {list.game_count === 1 ? "juego" : "juegos"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {truncated && viewAllHref != null ? (
        <p className="mt-4 text-center">
          <Link
            href={viewAllHref}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#678] transition hover:text-[#40bcf4]"
          >
            Ver todas las listas
          </Link>
        </p>
      ) : null}
    </section>
  );
}
