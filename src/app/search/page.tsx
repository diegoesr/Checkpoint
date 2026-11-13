import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { isIgdbConfigured, searchGames } from "@/lib/igdb";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const data = query ? await searchGames(query, 1, 20) : null;
  const results = data?.results ?? [];
  const count = data?.count ?? 0;
  const hasKey = isIgdbConfigured();

  return (
    <div className="min-h-full bg-black font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-40 sm:pt-44">
        <h1 className="text-3xl font-semibold">Buscar juegos</h1>
        <p className="mt-2 text-sm text-white/55">
          Resultados vía IGDB. Busca desde la página{" "}
          <Link href="/games" className="text-cyan-400 hover:text-cyan-300">
            Juegos
          </Link>{" "}
          o vuelve aquí con un término en la URL (<code className="text-white/50">?q=</code>
          ).
        </p>

        {!hasKey ? (
          <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
            Falta <code className="text-amber-100">IGDB_CLIENT_ID</code> e{" "}
            <code className="text-amber-100">IGDB_CLIENT_SECRET</code> en{" "}
            <code className="text-amber-100">.env.local</code> para obtener
            resultados.
          </p>
        ) : null}

        {query ? (
          <>
            <p className="mt-6 text-sm text-white/60">
              «{query}» — {count} resultado{count === 1 ? "" : "s"}
            </p>
            <ul className="mt-6 space-y-3">
              {results.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/games/${game.id}`}
                    className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-500/35 hover:bg-white/[0.07]"
                  >
                    <div className="relative h-20 w-[60px] shrink-0 overflow-hidden rounded-lg bg-white/10">
                      {game.background_image ? (
                        <Image
                          src={game.background_image}
                          alt=""
                          width={60}
                          height={80}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-[10px] text-white/40">
                          Sin imagen
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{game.name}</p>
                      {game.released ? (
                        <p className="mt-0.5 text-xs text-white/45">
                          {game.released}
                        </p>
                      ) : null}
                      {game.rating != null ? (
                        <p className="mt-1 text-xs text-cyan-400/80">
                          Crítica {game.rating}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {results.length === 0 && hasKey ? (
              <p className="mt-8 text-white/50">No hay juegos con ese término.</p>
            ) : null}
          </>
        ) : (
          <p className="mt-8 text-white/50">
            Ve a{" "}
            <Link href="/games" className="text-cyan-400 hover:text-cyan-300">
              Juegos
            </Link>{" "}
            y usa el buscador, o añade{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/70">
              ?q=tu búsqueda
            </code>{" "}
            en la URL.
          </p>
        )}

        <Link
          href="/"
          className="mt-10 inline-block text-cyan-400 hover:text-cyan-300"
        >
          ← Inicio
        </Link>
      </main>
    </div>
  );
}
