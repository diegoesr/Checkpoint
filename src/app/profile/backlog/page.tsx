import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { BacklogRemoveButton } from "@/components/profile/BacklogRemoveButton";
import { ProfilePageHeader } from "@/components/profile/ProfilePageHeader";
import { ProfileSubNav } from "@/components/profile/ProfileSubNav";
import { getGameBacklogForUser } from "@/lib/supabase/game-backlog";
import { getProfileDashboard } from "@/lib/supabase/profile-dashboard";
import { createClient } from "@/lib/supabase/server";
import { GAME_COVER_QUALITY } from "@/lib/game-image";

export const dynamic = "force-dynamic";

export default async function ProfileBacklogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/backlog");

  const [dash, backlog] = await Promise.all([
    getProfileDashboard(user.id, supabase),
    getGameBacklogForUser(user.id, supabase),
  ]);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <ProfilePageHeader
          dash={dash}
          user={user}
          headerActions="backlog"
        />
        <ProfileSubNav />

        <div className="mt-8">
          <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
            Backlog
          </h1>
      
          {backlog.length === 0 ? (
            <p className="mt-8 text-sm text-[#678]">
              Tu backlog está vacío.{" "}
              <Link
                href="/games"
                className="text-[#40bcf4] hover:text-[#5ccfff]"
              >
                Explorar juegos
              </Link>
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[#2f3642]">
              {backlog.map((row) => (
                <li
                  key={row.id}
                  className="flex gap-4 py-5 first:pt-0 sm:items-center"
                >
                  <Link
                    href={`/games/${row.igdb_id}`}
                    className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-[#1f252d] ring-1 ring-[#2f3642] sm:h-28 sm:w-[4.5rem]"
                  >
                    {row.background_image ? (
                      <Image
                        src={row.background_image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="72px"
                        quality={GAME_COVER_QUALITY}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-[#567]">
                        —
                      </div>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/games/${row.igdb_id}`}
                        className="text-base font-semibold text-white hover:text-emerald-400/90 sm:text-lg"
                      >
                        {row.game_name}
                      </Link>
                      <p className="mt-1 text-xs text-[#678]">
                        Añadido{" "}
                        <time dateTime={row.created_at}>
                          {new Date(row.created_at).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      </p>
                    </div>
                    <div className="shrink-0">
                      <BacklogRemoveButton entryId={row.id} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
