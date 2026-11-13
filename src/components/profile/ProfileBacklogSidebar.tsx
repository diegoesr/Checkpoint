import Image from "next/image";
import Link from "next/link";
import type { GameBacklogRow } from "@/lib/supabase/game-backlog";
import { GAME_COVER_QUALITY } from "@/lib/game-image";

type Props = {
  preview: GameBacklogRow[];
  total: number;
  /** Enlace a la vista completa del backlog; en perfiles ajenos suele ser null. */
  viewAllHref: string | null;
};

function formatCount(n: number) {
  return n > 99 ? "99+" : String(n);
}

export function ProfileBacklogSidebar({
  preview,
  total,
  viewAllHref,
}: Props) {
  const posters = preview.map((row) => (
    <div
      key={row.id}
      title={row.game_name}
      className="relative aspect-[2/3] min-h-0 w-0 flex-[1_1_0%] border-l border-[#14181c] bg-[#1f252d] first:border-l-0 pointer-events-none"
    >
      {row.background_image ? (
        <Image
          src={row.background_image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 18vw, 56px"
          quality={GAME_COVER_QUALITY}
        />
      ) : (
        <span className="sr-only">{row.game_name}</span>
      )}
    </div>
  ));

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-[#2f3642] pb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Backlog
        </h2>
        <span className="text-xs font-semibold tabular-nums text-[#9ab]">
          {formatCount(total)}
        </span>
      </div>

      {preview.length > 0 ? (
        viewAllHref != null ? (
          <Link
            href={viewAllHref}
            className="group block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#40bcf4]/50"
            aria-label="Ir al backlog"
          >
            <div className="flex overflow-hidden rounded-sm ring-1 ring-[#2f3642] transition group-hover:ring-[#40bcf4]/45">
              {posters}
            </div>
          </Link>
        ) : (
          <div className="flex overflow-hidden rounded-sm ring-1 ring-[#2f3642]">
            {posters}
          </div>
        )
      ) : (
        <p className="text-xs leading-relaxed text-[#678]">
          {viewAllHref != null ? (
            <>
              Nada pendiente.{" "}
              <Link
                href="/games"
                className="text-[#40bcf4] transition hover:text-[#5ccfff]"
              >
                Explorar juegos
              </Link>
            </>
          ) : (
            "Sin juegos en el backlog."
          )}
        </p>
      )}
    </section>
  );
}
