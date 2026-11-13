import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense } from "react";
import { Press_Start_2P } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getFollowingForUser } from "@/lib/supabase/friends";
import {
  getAvatarUrlForNavbar,
  getDisplayNameForNavbar,
  upsertProfileFromAuth,
} from "@/lib/supabase/profile";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { NavbarProfileArea } from "@/components/landing/NavbarProfileArea";
import { NavbarFriendsSection } from "@/components/landing/NavbarFriendsSection";
import { NavbarGuestMobileMenu } from "@/components/landing/NavbarGuestMobileMenu";
import { NavbarNotificationsMenu } from "@/components/landing/NavbarNotificationsMenu";
import { getNavbarNotifications } from "@/lib/supabase/navbar-notifications";
import { NavbarSkeleton } from "@/components/skeletons/Skeleton";

const logoFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

type NavItem = { href: string; label: string };

/** Visitante: sesión, registro y contenido público. */
const guestNavItems: NavItem[] = [
  { href: "/login", label: "Iniciar sesión" },
  { href: "/signup", label: "Crear una cuenta" },
  { href: "/games", label: "Juegos" },
  { href: "/news", label: "Noticias" },
];

/** Sesión iniciada: PERFIL → RESEÑAS → BACKLOG → LISTAS → DIARIO → JUEGOS → NOTICIAS. */
const authNavItems: NavItem[] = [
  { href: "/profile", label: "Perfil" },
  { href: "/profile/reviews", label: "Reseñas" },
  { href: "/profile/backlog", label: "Backlog" },
  { href: "/lists", label: "Listas" },
  { href: "/profile/diary", label: "Diario" },
  { href: "/games", label: "Juegos" },
  { href: "/news", label: "Noticias" },
];

async function NavbarContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [, friends, notifPayload] = await Promise.all([
      upsertProfileFromAuth(user, supabase),
      getFollowingForUser(user.id, supabase),
      getNavbarNotifications(user.id, supabase),
    ]);
    const displayName = getDisplayNameForNavbar(user);
    const avatarUrl = getAvatarUrlForNavbar(user);

    return (
      <>
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="overflow-visible border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto grid min-h-[3.25rem] w-full max-w-[1600px] grid-cols-2 items-center gap-3 px-4 py-2 sm:min-h-14 sm:px-6 sm:py-1 lg:px-8 md:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              className="flex shrink-0 items-center justify-self-start text-white no-underline"
            >
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 ${logoFont.className} text-[10px] leading-none tracking-wide sm:gap-2.5 sm:text-sm md:text-base`}
              >
                <Image
                  src="/assets/icons/checkpoint.png"
                  alt=""
                  width={120}
                  height={120}
                  unoptimized
                  className="h-7 w-auto shrink-0 sm:h-9 md:h-10"
                  aria-hidden
                />
                <span className="whitespace-nowrap">Checkpoint</span>
              </span>
            </Link>

            <nav className="col-span-2 hidden flex-wrap items-center justify-center gap-x-3 gap-y-2 py-1 md:col-span-1 md:col-start-2 md:row-start-1 md:flex md:gap-x-4 md:overflow-visible lg:gap-x-5">
              {authNavItems.map((item) => (
                <Fragment key={item.href}>
                  <Link
                    href={item.href}
                    className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-white/95 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                  {item.href === "/news" ? (
                    <NavbarFriendsSection initialFriends={friends} />
                  ) : null}
                </Fragment>
              ))}
            </nav>

            <div className="flex shrink-0 items-center justify-self-end gap-4 overflow-visible max-md:pl-1 md:col-start-3 md:gap-3">
              <NavbarNotificationsMenu
                key={notifPayload.lastSeenAt ?? "none"}
                initialItems={notifPayload.items}
              />
              <NavbarProfileArea
                displayName={displayName}
                avatarUrl={avatarUrl}
              />
            </div>
          </div>
        </div>
      </header>
      <MobileBottomNav />
      </>
    );
  }

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      {/* Invitado móvil: logo a la izquierda, menú (hamburguesa) arriba a la derecha */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 text-white no-underline"
          >
            <Image
              src="/assets/icons/checkpoint.png"
              alt=""
              width={120}
              height={120}
              unoptimized
              className="h-8 w-auto shrink-0"
              aria-hidden
            />
            <span
              className={`min-w-0 truncate ${logoFont.className} text-[11px] leading-none tracking-wide sm:text-xs`}
            >
              Checkpoint
            </span>
          </Link>
          <NavbarGuestMobileMenu items={guestNavItems} />
        </div>
      </div>

      {/* Invitado escritorio: logo a la izquierda, enlaces centrados en la barra */}
      <div className="relative mx-auto hidden h-16 max-w-[1400px] items-center px-4 sm:px-6 lg:px-8 md:flex">
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center text-white no-underline"
        >
          <span
            className={`inline-flex items-center gap-2.5 ${logoFont.className} text-sm leading-none tracking-wide sm:text-base md:text-base`}
          >
            <Image
              src="/assets/icons/checkpoint.png"
              alt=""
              width={120}
              height={120}
              unoptimized
              className="h-8 w-auto shrink-0 sm:h-9 md:h-10"
              aria-hidden
            />
            Checkpoint
          </span>
        </Link>

        <nav
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-x-4 py-1 md:gap-x-5 lg:gap-x-7"
          aria-label="Navegación principal"
        >
          {guestNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="pointer-events-auto shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-white/95 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/**
 * El Navbar consulta sesión, amigos y notificaciones. Se envuelve en Suspense
 * para que esas consultas no bloqueen el render del contenido de la página:
 * el placeholder ocupa el mismo espacio (header absoluto) y se reemplaza al llegar.
 */
export function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarContent />
    </Suspense>
  );
}
