import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  getAvatarUrlForNavbar,
  getDisplayNameForNavbar,
} from "@/lib/supabase/profile";
import type { ProfileDashboard } from "@/lib/supabase/profile-dashboard";
import { ProfileBacklogBar } from "@/components/profile/ProfileBacklogBar";
import { ProfilePlatformIdsBlock } from "@/components/profile/ProfilePlatformIdsBlock";
import { ProfileInteractiveStats } from "@/components/profile/ProfileInteractiveStats";
import { ProfileReviewLog } from "@/components/profile/ProfileReviewLog";

function ProfileSettingsGearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function ProfilePageHeader({
  dash,
  user,
  headerActions = "default",
}: {
  dash: ProfileDashboard;
  user: User;
  /** default: actividad + reseña · backlog: solo backlog · none: sin barra de acciones. */
  headerActions?: "default" | "backlog" | "none";
}) {
  const displayName =
    dash.profile?.display_name?.trim() || getDisplayNameForNavbar(user);
  const avatar =
    dash.profile?.avatar_url?.trim() || getAvatarUrlForNavbar(user);
  const handle =
    dash.profile?.username?.trim() ||
    user.email?.split("@")[0] ||
    "jugador";

  const headerStats = [
    { label: "Juegos", value: dash.stats.gamesCount },
    { label: "Este año", value: dash.stats.thisYearGamesCount },
    { label: "Siguiendo", value: dash.following.length },
    { label: "Seguidores", value: dash.followers.length },
  ] as const;

  return (
    <header className="border-b border-[#2f3642] pb-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-3 max-md:items-center max-md:text-center md:gap-5">
          <div className="flex w-full justify-start md:hidden">
            <Link
              href="/profile/edit"
              className="flex size-10 items-center justify-center rounded-lg text-[#9ab] transition hover:bg-white/5 hover:text-white"
              aria-label="Configuración del perfil"
            >
              <ProfileSettingsGearIcon />
            </Link>
          </div>
          <div className="flex min-w-0 w-full flex-1 flex-col gap-5 max-md:items-center max-md:text-center md:flex-row md:items-start md:gap-6 md:text-left">
            <div className="w-full max-md:text-center md:hidden">
              <h1 className="min-w-0 break-words text-[22px] font-bold leading-tight text-white">
                {displayName}
              </h1>
            </div>
            <div className="shrink-0">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="size-24 rounded-full object-cover ring-1 ring-white/20 md:size-[104px]"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-full bg-[#1f252d] text-2xl font-semibold text-white/90 ring-1 ring-white/20 md:size-[104px] md:text-3xl">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 w-full max-w-full flex-1 md:max-w-xl lg:max-w-md xl:max-w-lg">
              <div className="hidden flex-wrap items-center gap-x-2 gap-y-2 md:flex md:justify-start">
                <h1 className="min-w-0 break-words text-[22px] font-bold leading-tight text-white sm:text-2xl">
                  {displayName}
                </h1>
                <Link
                  href="/profile/edit"
                  className="shrink-0 rounded border border-[#3d4654] bg-[#2c3440] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8d0d9] transition hover:border-[#556] hover:bg-[#384250] hover:text-white"
                >
                  Editar perfil
                </Link>
              </div>
              <p className="mt-1 text-[13px] text-[#9ab]">@{handle}</p>
              {dash.profile?.bio ? (
                <p className="mt-3 text-[15px] italic leading-relaxed text-[#9ab]">
                  {dash.profile.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-[#5c6a7a]">
                  Añade una frase en editar perfil.
                </p>
              )}
              {dash.links.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
                  {dash.links.map((l) => (
                    <li key={l.id}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#40bcf4] hover:underline"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ProfilePlatformIdsBlock
                profile={dash.profile}
                className="mt-4 border-t border-[#2f3642] pt-4"
              />
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-auto">
          <ProfileInteractiveStats
            stats={headerStats}
            profileUserId={user.id}
            displayHandle={handle}
          />
        </div>
      </div>

      {headerActions === "none" ? null : (
        <div className="mt-8 w-full border-t border-[#2f3642] pt-6">
          {headerActions === "backlog" ? (
            <ProfileBacklogBar />
          ) : (
            <ProfileReviewLog />
          )}
        </div>
      )}
    </header>
  );
}
