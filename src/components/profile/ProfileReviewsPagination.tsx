import Link from "next/link";
import { GAME_REVIEWS_PAGE_SIZE } from "@/lib/supabase/profile-dashboard";

type Props = {
  basePath: string;
  page: number;
  total: number;
  pageSize?: number;
};

export function ProfileReviewsPagination({
  basePath,
  page,
  total,
  pageSize = GAME_REVIEWS_PAGE_SIZE,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const href = (p: number) =>
    p <= 1 ? basePath : `${basePath}?page=${p}`;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#2f3642] pt-8 text-sm text-[#9ab]"
      aria-label="Paginación de reseñas"
    >
      <p className="text-xs tabular-nums text-[#678]">
        Página {page} de {totalPages} · {total}{" "}
        {total === 1 ? "reseña" : "reseñas"}
      </p>
      <div className="flex gap-4">
        {prev != null ? (
          <Link
            href={href(prev)}
            className="font-semibold text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            ← Anterior
          </Link>
        ) : (
          <span className="text-[#567]">← Anterior</span>
        )}
        {next != null ? (
          <Link
            href={href(next)}
            className="font-semibold text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            Siguiente →
          </Link>
        ) : (
          <span className="text-[#567]">Siguiente →</span>
        )}
      </div>
    </nav>
  );
}
