/**
 * Búsqueda de juegos vía IGDB; solo se usa en /games.
 * Envía a /search con ?q=
 */
export function GamesSearchBar() {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className="mt-6 w-full max-w-md"
    >
      <label className="sr-only" htmlFor="games-search-q">
        Buscar juegos en IGDB
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-[#2f3642] bg-[#1f252d] px-3 py-2.5 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20">
        <svg
          className="size-4 shrink-0 text-[#678]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          id="games-search-q"
          name="q"
          type="search"
          placeholder="Buscar juego…"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-500"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
