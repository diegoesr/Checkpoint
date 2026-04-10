import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileDiaryTimeline } from "@/lib/supabase/profile-diary";
import {
  getProfileDashboard,
  limitPlayingActivityForProfileSection,
} from "@/lib/supabase/profile-dashboard";
import {
  attachReviewLikeMeta,
  getReviewLikesMeta,
} from "@/lib/supabase/review-likes";
import { getUserListsWithPreviews } from "@/lib/supabase/user-lists";
import { ProfileActivityFeed } from "@/components/profile/ProfileActivityFeed";
import { ProfileActivitySection } from "@/components/profile/ProfileActivitySection";
import { ProfileAvatarGrid } from "@/components/profile/ProfileAvatarGrid";
import { ProfilePageHeader } from "@/components/profile/ProfilePageHeader";
import { ProfileReviewsSection } from "@/components/profile/ProfileReviewsSection";
import { ProfileSubNav } from "@/components/profile/ProfileSubNav";
import { ProfileBacklogSidebar } from "@/components/profile/ProfileBacklogSidebar";
import { ProfileDiarySidebar } from "@/components/profile/ProfileDiarySidebar";
import { ProfileListsSidebar } from "@/components/profile/ProfileListsSidebar";
import { ProfileTopFour } from "@/components/profile/ProfileTopFour";
import { Navbar } from "@/components/landing/Navbar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const dash = await getProfileDashboard(user.id, supabase);
  const [likeMeta, diaryEntries, userLists] = await Promise.all([
    getReviewLikesMeta(
      dash.reviews.map((r) => r.id),
      user.id,
      supabase,
    ),
    getProfileDiaryTimeline(user.id, dash, supabase),
    getUserListsWithPreviews(user.id, supabase),
  ]);
  const reviewsWithLikes = attachReviewLikeMeta(dash.reviews, likeMeta);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-3 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <ProfilePageHeader dash={dash} user={user} />
        <ProfileSubNav />

        <div className="mt-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          <div className="min-w-0 space-y-10">
            <ProfileTopFour initial={dash.favorites} />

            <ProfileActivitySection
              initial={limitPlayingActivityForProfileSection(dash.activity)}
              showHeading={false}
            />

            <ProfileReviewsSection
              reviews={reviewsWithLikes}
              emptyMessage="Aún no hay reseñas."
              heading="Actividad reciente"
              viewAllHref="/profile/reviews"
              reviewOwnerUserId={user.id}
              viewerUserId={user.id}
            />

            <section className="border-t border-[#2f3642] pt-10">
              <div className="mb-4 flex items-baseline gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
                  Seguidores
                </h2>
                <span className="text-xs font-semibold tabular-nums text-[#9ab]">
                  {dash.followers.length}
                </span>
              </div>
              <ProfileAvatarGrid
                people={dash.followers}
                emptyLabel="Aún no tienes seguidores."
              />
            </section>
          </div>

          <aside className="mt-12 hidden space-y-10 border-t border-[#2f3642] pt-10 lg:mt-0 lg:block lg:border-t-0 lg:pt-0">
            <ProfileBacklogSidebar
              preview={dash.backlogPreview}
              total={dash.backlogTotal}
              viewAllHref="/profile/backlog"
            />
            <ProfileDiarySidebar
              entries={diaryEntries}
              totalCount={diaryEntries.length}
              viewAllHref="/profile/diary"
            />
            <ProfileListsSidebar
              lists={userLists}
              totalCount={userLists.length}
              viewAllHref="/lists"
            />
            <ProfileActivityFeed
              entries={diaryEntries}
              diaryHref="/profile/diary"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
