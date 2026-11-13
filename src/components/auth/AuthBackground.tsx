import { Suspense } from "react";
import GridMotion from "@/components/backgrounds/GridMotion";
import { getGameMedia, getTrendingGamesForDiscovery } from "@/lib/igdb";

/** Grand Theft Auto VI en IGDB (https://www.igdb.com/games/grand-theft-auto-vi). */
const FEATURED_GAME_ID = 52189;

/**
 * Artwork y capturas oficiales de GTA VI (vía IGDB, cacheadas 24 h).
 * Si no hubiera imágenes, usa las carátulas de juegos en tendencia.
 */
async function FeaturedGameGrid() {
  const media = await getGameMedia(FEATURED_GAME_ID, "screenshot_big");

  if (media.length > 0) {
    return (
      <GridMotion
        items={media.map((src) => ({ src, alt: "" }))}
        rows={4}
        portraitRows={7}
        aspectRatio={1.6}
        gap={14}
        radius={12}
        angle={-12}
        speed={18}
        parallax={0.4}
        spotlight={0.6}
        dim={0.4}
        fade={0.45}
        tileColor="#1a1f26"
      />
    );
  }

  const games = await getTrendingGamesForDiscovery(30);
  const covers = games
    .filter((g) => g.background_image)
    .map((g) => ({
      src: (g.background_image as string).replace("/t_cover_big_2x/", "/t_cover_big/"),
      alt: "",
    }));

  return (
    <GridMotion
      items={covers}
      rows={4}
      portraitRows={6}
      aspectRatio={0.75}
      gap={14}
      radius={12}
      angle={-12}
      speed={22}
      parallax={0.4}
      spotlight={0.6}
      dim={0.45}
      fade={0.45}
      tileColor="#1a1f26"
    />
  );
}

/** Fondo fijo de las páginas de iniciar sesión y crear cuenta. */
export function AuthBackground() {
  return (
    <div className="fixed inset-0 z-0 h-dvh min-h-dvh w-full bg-[#0d1014]" aria-hidden>
      <Suspense fallback={null}>
        <FeaturedGameGrid />
      </Suspense>
      {/* Oscurece el centro para que el formulario se lea bien. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,16,20,0.75)_0%,rgba(13,16,20,0.35)_55%,rgba(13,16,20,0.1)_100%)]" />
      <p className="pointer-events-none absolute bottom-3 right-4 text-[10px] text-white/30">
        Imágenes: Grand Theft Auto VI © Rockstar Games · vía IGDB
      </p>
    </div>
  );
}
