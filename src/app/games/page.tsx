import Link from "next/link";
import { GameCard } from "@/components/games/GameCard";
import { GamesSearchBar } from "@/components/games/GamesSearchBar";
import { Navbar } from "@/components/landing/Navbar";
import { getTrendingGamesForDiscovery } from "@/lib/rawg";

export default async function GamesPage() {
  const games = await getTrendingGamesForDiscovery();
  const hasKey = Boolean(process.env.RAWG_API_KEY);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">Top 10 en tendencia</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#9ab]">
            Los diez títulos más destacados ahora según RAWG (destacados + novedades en su base).
          </p>
          <GamesSearchBar />
        </div>

        {!hasKey ? (
          <div className="mt-12 rounded-xl border border-amber-500/35 bg-amber-950/25 p-6 text-sm text-amber-100/90">
            <p className="font-medium text-amber-50">Falta la clave de RAWG</p>
            <p className="mt-2 text-amber-100/80">
              Crea <code className="rounded bg-[#1a1f26] px-1.5 py-0.5 text-xs text-amber-200/90">.env.local</code>{" "}
              con{" "}
              <code className="rounded bg-[#1a1f26] px-1.5 py-0.5 text-xs text-amber-200/90">RAWG_API_KEY=tu_clave</code>{" "}
              y reinicia el servidor. Clave gratuita en{" "}
              <a
                href="https://rawg.io/apidocs"
                target="_blank"
                rel="noreferrer noopener"
                className="text-[#40bcf4] underline underline-offset-2 hover:text-[#5ccfff]"
              >
                rawg.io/apidocs
              </a>
              .
            </p>
          </div>
        ) : games.length === 0 ? (
          <p className="mt-12 text-[#9ab]">
            No se pudieron cargar juegos. Revisa la clave o vuelve a intentar más tarde.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-2 overflow-visible sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {games.map((game, index) => (
              <li key={game.id} className="flex min-h-0 min-w-0 overflow-visible">
                <GameCard game={game} rank={index + 1} />
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/"
          className="mt-12 inline-block text-sm text-[#40bcf4] transition hover:text-[#5ccfff]"
        >
          ← Inicio
        </Link>
      </main>
    </div>
  );
}
