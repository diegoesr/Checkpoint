function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21l1.45-1.32C18.6 15.36 22 12.28 22 8.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2Z" />
    </svg>
  );
}

function IconLines({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6-4.6-6 4.6 2.3-7-6-4.6h7.6L12 2Z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

const featureItems = [
  {
    id: "track",
    icon: IconEye,
    text: "Lleva la cuenta de cada videojuego que has terminado o empieza a registrar desde el día en que te unes.",
  },
  {
    id: "favorites",
    icon: IconHeart,
    text: "Destaca tus juegos, listas y reseñas favoritas para volver a ellas cuando quieras.",
  },
  {
    id: "reviews",
    icon: IconLines,
    text: "Escribe reseñas, compártelas y sigue a amigos u otros jugadores para leer las suyas.",
  },
  {
    id: "rate",
    icon: IconStar,
    text: "Valora cada juego con estrellas según cómo te hizo sentir.",
  },
  {
    id: "activity",
    icon: IconCalendar,
    text: "Registra sesiones por día y, cuando esté listo, revisa resúmenes de tu historial de juego.",
  },
  {
    id: "lists",
    icon: IconGrid,
    text: "Organiza tus juegos en listas y planea qué jugar después.",
  },
] as const;

export function HomeFeatures() {
  return (
    <section
      className="relative z-10 border-t border-white/10 bg-black px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      aria-labelledby="home-features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:text-xs">
          Checkpoint te permite…
        </p>
        <h2 id="home-features-heading" className="sr-only">
          Qué puedes hacer en Checkpoint
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-5">
          {featureItems.map(({ id, icon: Icon, text }) => (
            <li key={id}>
              <article className="group flex h-full gap-4 rounded-xl border border-white/10 bg-zinc-900/55 p-5 shadow-sm shadow-black/20 transition duration-300 hover:border-white/40 hover:bg-zinc-900/75 sm:gap-5 sm:p-6">
                <div
                  className="shrink-0 text-white/40 transition-colors duration-300 group-hover:text-white/85"
                  aria-hidden
                >
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <p className="text-sm leading-relaxed text-white/70 sm:text-[0.9375rem]">
                  {text}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
