import Image from "next/image";
import Link from "next/link";
import { formatGenresLabel, type TrendingGame } from "@/lib/igdb";

type Props = { game: TrendingGame; rank?: number };

export function GameCard({ game, rank }: Props) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group relative z-0 flex h-[26rem] w-full origin-center flex-col overflow-hidden rounded-2xl border border-[#2f3642] bg-[#1a1f26] transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform hover:z-10 hover:scale-[1.12] hover:border-[#40bcf4]/45 hover:shadow-lg hover:shadow-black/40 focus-visible:border-[#40bcf4] focus-visible:outline-none active:border-[#40bcf4] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:h-[27.5rem]"
    >
      <div className="relative h-[11.25rem] w-full shrink-0 bg-[#1f252d] sm:h-[12.5rem]">
        {game.hero_image ? (
          <Image
            src={game.hero_image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 40vw, 360px"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-base text-[#9ab]">
            {game.name}
          </div>
        )}
        {rank != null ? (
          <span className="absolute left-3 top-3 rounded-lg bg-black/75 px-2.5 py-1 text-sm font-bold tabular-nums text-[#40bcf4] ring-1 ring-[#2f3642]">
            #{rank}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-[#40bcf4] sm:text-lg">
          {game.name}
        </h2>
        <p className="mt-2 line-clamp-2 shrink-0 text-sm text-[#9ab]">
          {formatGenresLabel(game.genres)}
        </p>
        <div className="mt-auto flex min-h-[2.75rem] flex-wrap content-end items-center gap-2 pt-3">
          {game.released ? (
            <span className="text-sm text-[#678]">{game.released}</span>
          ) : null}
          {game.rating != null ? (
            <span className="rounded-md border border-[#2f3642] bg-[#1f252d] px-2.5 py-1 text-sm font-medium text-[#e6edf3]">
              Crítica {game.rating}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
