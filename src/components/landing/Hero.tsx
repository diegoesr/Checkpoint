import Link from "next/link";
import EvilEye from "@/components/backgrounds/EvilEye";
import TextType from "@/components/text/TextType";

const evilEyeProps = {
  eyeColor: "#FF6F37",
  intensity: 1.5,
  pupilSize: 0.6,
  irisWidth: 0.25,
  glowIntensity: 0.35,
  scale: 0.8,
  noiseScale: 1,
  pupilFollow: 1,
  flameSpeed: 1,
  backgroundColor: "#060010",
} as const;

type HeroProps = {
  expandedTopNav?: boolean;
  /** Solo invitados: enlace a registro. Oculto si ya hay sesión. */
  showSignupCta?: boolean;
};

export function Hero({
  expandedTopNav = false,
  showSignupCta = true,
}: HeroProps) {
  const contentPt = expandedTopNav
    ? "pt-44 sm:pt-40"
    : "pt-28 sm:pt-32";

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-[#060010]">
      <div className="absolute inset-0 z-0">
        <EvilEye {...evilEyeProps} />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-black/35 via-black/25 to-black"
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto flex min-h-[85vh] max-w-4xl flex-col items-center justify-center px-6 pb-32 text-center sm:px-8 sm:pb-40 ${contentPt}`}
      >
        <TextType
          as="h1"
          text={[
            "Lleva el control de tus juegos",
            "Prepara tu siguiente aventura",
            "Comparte lo mejor que has jugado",
          ]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="_"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
          loop
          className="mx-auto block w-full max-w-4xl text-center text-[1.65rem] font-semibold leading-snug tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.75)] sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight"
        />

        {showSignupCta ? (
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center justify-center rounded-full border border-white/20 bg-black px-10 py-3.5 text-base font-semibold text-white shadow-[0_8px_28px_-8px_rgba(0,0,0,0.85)] transition hover:border-white/35 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060010]"
          >
            ¡Empieza ya!
          </Link>
        ) : null}

        <p
          className={`max-w-md text-sm text-white/70 drop-shadow-md ${showSignupCta ? "mt-6" : "mt-10"}`}
        >
          La red social para quienes viven cada partida.
        </p>
      </div>
    </section>
  );
}
