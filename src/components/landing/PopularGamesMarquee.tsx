"use client";

import Link from "next/link";
import type { HomeMarqueeGame } from "@/lib/rawg";
import LogoLoop, { type LogoItem } from "@/components/landing/LogoLoop";
import { MarqueeGameCard } from "@/components/landing/MarqueeGameCard";

type Props = {
  games: HomeMarqueeGame[];
  showRawgAttribution?: boolean;
  hasApiKey: boolean;
};

export function PopularGamesMarquee({
  games,
  showRawgAttribution,
  hasApiKey,
}: Props) {
  const loopItems: LogoItem[] = games.map((g) => ({
    src: g.src,
    alt: g.name,
    href: g.href,
    title: g.name,
  }));

  if (games.length === 0) {
    return (
      <section className="relative z-10 -mt-32 border-t border-white/10 bg-black pb-8 pt-6 sm:-mt-36 sm:pb-10 sm:pt-7">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/25 px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-sm font-semibold text-amber-50">
              Carátulas reales (Fortnite, Crimson Desert, etc.)
            </p>
            <p className="mt-3 text-sm leading-relaxed text-amber-100/80">
               
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-left text-sm text-amber-100/75">
              <li>
                Crea el archivo{" "}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-amber-200">
                  .env.local
                </code>{" "}
                
              </li>
              <li>
                Escribe:{" "}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-amber-200">
                  
                </code>
              </li>
              <li>
                Obtén la clave en{" "}
                <a
                  href="https://rawg.io/apidocs"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-violet-300 underline underline-offset-2 hover:text-violet-200"
                >
                  rawg.io/apidocs
                </a>
                .
              </li>
            </ol>
            <Link
              href="/games"
              className="mt-6 inline-block text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              Ver página Juegos →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 -mt-32 border-t border-white/10 bg-black pb-8 pt-6 sm:-mt-36 sm:pb-10 sm:pt-7">
      <div className="relative mx-auto h-[260px] max-w-[100vw] overflow-hidden sm:h-[290px] md:h-[300px]">
        <LogoLoop
          logos={loopItems}
          renderItem={(_item, key) => {
            const idx = Number(String(key).split("-").pop() ?? "0");
            const game = games[idx];
            if (!game) return null;
            return <MarqueeGameCard game={game} />;
          }}
          speed={90}
          direction="left"
          logoHeight={220}
          gap={26}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="#000000"
          ariaLabel="Carátulas de videojuegos en tendencia con nombre, puesto y género"
          className="w-full"
        />
      </div>
      {showRawgAttribution && hasApiKey ? (
        <p className="mt-3 text-center text-[10px] text-white/35">
          Metadatos y carátulas vía{" "}
          <a
            href="https://rawg.io"
            target="_blank"
            rel="noreferrer noopener"
            className="text-white/50 underline decoration-white/20 underline-offset-2 hover:text-white/70"
          >
            RAWG
          </a>
        </p>
      ) : null}
    </section>
  );
}
