import Link from "next/link";
import Galaxy from "@/components/backgrounds/Galaxy";
import { HeroHeadline } from "@/components/landing/HeroHeadline";

const galaxyProps = {
  density: 1,
  glowIntensity: 0.3,
  saturation: 0,
  hueShift: 140,
  twinkleIntensity: 0.3,
  rotationSpeed: 0.1,
  starSpeed: 0.5,
  speed: 1,
  mouseRepulsion: true,
  repulsionStrength: 2,
  transparent: true,
  // Resolución 1x: el shader es costoso y a 2x (retina) dibuja 4 veces más píxeles
  // sin diferencia visible en estrellas difuminadas.
  dpr: 1,
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
        <Galaxy {...galaxyProps} />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-black/35 via-black/25 to-black"
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto flex min-h-[85vh] max-w-4xl flex-col items-center justify-center px-6 pb-32 text-center sm:px-8 sm:pb-40 ${contentPt}`}
      >
        <HeroHeadline />

        {showSignupCta ? (
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center justify-center rounded-full border border-white/20 bg-black px-10 py-3.5 text-base font-semibold text-white shadow-[0_8px_28px_-8px_rgba(0,0,0,0.85)] transition hover:border-white/35 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060010]"
          >
            ¡Empieza ya!
          </Link>
        ) : null}
      </div>
    </section>
  );
}
