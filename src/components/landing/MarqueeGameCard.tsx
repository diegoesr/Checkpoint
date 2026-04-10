"use client";

import Image from "next/image";
import Link from "next/link";
import type { HomeMarqueeGame } from "@/lib/rawg";

type Props = { game: HomeMarqueeGame };

export function MarqueeGameCard({ game }: Props) {
  return (
    <Link
      href={game.href}
      className="relative z-0 flex h-[212px] w-[158px] shrink-0 origin-center flex-col overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/90 text-left shadow-lg shadow-black/40 transition-[transform,box-shadow,border-color] duration-300 ease-in-out will-change-transform group-hover/item:z-20 group-hover/item:scale-[1.16] hover:border-white/40 hover:shadow-violet-950/25 focus-visible:border-white focus-visible:outline-none active:border-white motion-reduce:transition-none motion-reduce:group-hover/item:scale-100 sm:h-[226px] sm:w-[176px] md:h-[238px] md:w-[188px]"
    >
      <div className="relative h-[118px] w-full shrink-0 bg-zinc-900 sm:h-[128px] md:h-[136px]">
        <Image
          src={game.src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:640px) 158px, 188px"
          loading="lazy"
        />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold tabular-nums text-violet-200 ring-1 ring-violet-500/40 sm:text-xs">
          #{game.rank}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-1 px-3 py-2.5 sm:px-3.5 sm:py-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-white sm:text-[13px]">
          {game.name}
        </p>
        <p className="line-clamp-2 text-[10px] leading-snug text-white/55 sm:text-xs">
          {game.genresLabel}
        </p>
      </div>
    </Link>
  );
}
