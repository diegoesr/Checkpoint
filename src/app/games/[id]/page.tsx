import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameBacklogButton } from "@/components/games/GameBacklogButton";
import { Navbar } from "@/components/landing/Navbar";
import { getBacklogEntryIdForGame } from "@/lib/supabase/game-backlog";
import { getGameById } from "@/lib/igdb";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) notFound();

  const game = await getGameById(numericId);
  if (!game) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const backlogEntryId =
    user != null
      ? await getBacklogEntryIdForGame(user.id, numericId, supabase)
      : null;

  const platforms = game.platforms;
  const genres = game.genres?.map((g) => g.name).filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <Link
          href="/games"
          className="text-sm text-[#40bcf4] transition hover:text-[#5ccfff]"
        >
          ← Juegos en tendencia
        </Link>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#2f3642] bg-[#1a1f26]">
          {game.hero_image ? (
            <div className="relative aspect-video w-full bg-[#1f252d]">
              <Image
                src={game.hero_image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
                priority
              />
            </div>
          ) : null}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {game.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#9ab]">
              {game.released ? <span>Lanzamiento: {game.released}</span> : null}
              {game.rating != null ? (
                <span className="rounded-md border border-[#2f3642] bg-[#1f252d] px-2 py-0.5 text-[#e6edf3]">
                  Crítica {game.rating}
                </span>
              ) : null}
            </div>
            {genres.length > 0 ? (
              <p className="mt-4 text-sm text-[#9ab]">
                <span className="text-[#678]">Géneros: </span>
                {genres.join(", ")}
              </p>
            ) : null}
            {platforms.length > 0 ? (
              <p className="mt-2 text-sm text-[#9ab]">
                <span className="text-[#678]">Plataformas: </span>
                {platforms.join(", ")}
              </p>
            ) : null}
            {game.description ? (
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-white/75">
                {game.description}
              </p>
            ) : (
              <p className="mt-6 text-sm text-[#9ab]">Sin descripción en IGDB.</p>
            )}
            {user ? (
              <GameBacklogButton
                igdbId={numericId}
                initialInBacklog={backlogEntryId != null}
              />
            ) : (
              <p className="mt-6 text-sm text-[#9ab]">
                <Link
                  href={`/login?next=/games/${numericId}`}
                  className="text-[#40bcf4] hover:text-[#5ccfff]"
                >
                  Inicia sesión
                </Link>{" "}
                para guardar juegos en tu backlog.
              </p>
            )}

            <a
              href={game.url ?? `https://www.igdb.com/games/${game.slug ?? game.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex text-sm font-medium text-[#40bcf4] hover:text-[#5ccfff]"
            >
              Ver en IGDB →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
