import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileDashboard } from "@/lib/supabase/profile-dashboard";
import {
  buildDiaryEntries,
  getProfileDiaryExtras,
  hydrateDiaryFollowEntries,
} from "@/lib/supabase/profile-diary";
import { ProfileDiaryTimeline } from "@/components/profile/ProfileDiaryTimeline";
import { ProfilePageHeader } from "@/components/profile/ProfilePageHeader";
import { ProfileSubNav } from "@/components/profile/ProfileSubNav";
import { Navbar } from "@/components/landing/Navbar";

export const dynamic = "force-dynamic";

export default async function ProfileDiaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/diary");

  const [dash, extras] = await Promise.all([
    getProfileDashboard(user.id, supabase),
    getProfileDiaryExtras(user.id, supabase),
  ]);
  const entries = await hydrateDiaryFollowEntries(
    buildDiaryEntries(dash, extras),
    extras,
    supabase,
  );

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <ProfilePageHeader
          dash={dash}
          user={user}
          headerActions="none"
        />
        <ProfileSubNav />

        <div className="mt-8">
          <div className="mb-6">
            <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
              Diario
            </h1>
            <p className="mt-1 text-xs text-[#567]">
              Actividad, reseñas, backlog y conexiones, en orden
              cronológico.
            </p>
          </div>
          <ProfileDiaryTimeline entries={entries} />
        </div>
      </main>
    </div>
  );
}
