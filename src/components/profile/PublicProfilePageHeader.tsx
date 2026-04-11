import { ProfileInteractiveStats } from "@/components/profile/ProfileInteractiveStats";
import { ProfilePlatformIdsBlock } from "@/components/profile/ProfilePlatformIdsBlock";
import { PublicProfileRelationshipActions } from "@/components/profile/PublicProfileRelationshipActions";
import type { ProfileDashboard } from "@/lib/supabase/profile-dashboard";

type Props = {
  dash: ProfileDashboard;
  profileUserId: string;
  viewerFollowsProfile: boolean;
  /** El dueño de este perfil sigue al visitante. */
  profileFollowsViewer: boolean;
};

export function PublicProfilePageHeader({
  dash,
  profileUserId,
  viewerFollowsProfile,
  profileFollowsViewer,
}: Props) {
  const displayName =
    dash.profile?.display_name?.trim() || "Jugador";
  const avatar = dash.profile?.avatar_url?.trim() ?? null;
  const handle =
    dash.profile?.username?.trim() || null;

  const headerStats = [
    { label: "Juegos", value: dash.stats.gamesCount },
    { label: "Este año", value: dash.stats.thisYearGamesCount },
    { label: "Siguiendo", value: dash.following.length },
    { label: "Seguidores", value: dash.followers.length },
  ] as const;

  return (
    <header className="border-b border-[#2f3642] pb-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="size-24 rounded-full object-cover ring-1 ring-white/20 sm:size-[104px]"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-[#1f252d] text-2xl font-semibold text-white/90 ring-1 ring-white/20 sm:size-[104px] sm:text-3xl">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 w-full max-w-full flex-1 sm:max-w-xl lg:max-w-md xl:max-w-lg">
            <h1 className="min-w-0 break-words text-[22px] font-bold leading-tight text-white sm:text-2xl">
              {displayName}
            </h1>
            {handle ? (
              <p className="mt-1 text-[13px] text-[#9ab]">@{handle}</p>
            ) : null}
            <PublicProfileRelationshipActions
              profileUserId={profileUserId}
              displayLabel={displayName}
              viewerFollowsProfile={viewerFollowsProfile}
              profileFollowsViewer={profileFollowsViewer}
            />
            {dash.profile?.bio ? (
              <p className="mt-3 text-[15px] italic leading-relaxed text-[#9ab]">
                {dash.profile.bio}
              </p>
            ) : null}
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

        <div className="w-full shrink-0 lg:w-auto">
          <ProfileInteractiveStats
            stats={headerStats}
            profileUserId={dash.profile?.id ?? ""}
            displayHandle={handle}
          />
        </div>
      </div>
    </header>
  );
}
