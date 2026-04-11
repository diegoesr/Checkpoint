import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ProfileActivityFeed } from "@/components/profile/ProfileActivityFeed";
import { ProfileAvatarGrid } from "@/components/profile/ProfileAvatarGrid";
import { ProfileReviewsSection } from "@/components/profile/ProfileReviewsSection";
import { ProfileBacklogSidebar } from "@/components/profile/ProfileBacklogSidebar";
import { ProfileDiarySidebar } from "@/components/profile/ProfileDiarySidebar";
import { ProfileListsSidebar } from "@/components/profile/ProfileListsSidebar";
import { ProfileTopFour } from "@/components/profile/ProfileTopFour";
import { PublicProfilePageHeader } from "@/components/profile/PublicProfilePageHeader";
import {
  publicProfilePath,
  resolveProfileIdFromSlug,
} from "@/lib/public-profile";
import { getProfileDiaryTimeline } from "@/lib/supabase/profile-diary";
import { getProfileDashboard } from "@/lib/supabase/profile-dashboard";
import {
  attachReviewLikeMeta,
  getReviewLikesMeta,
} from "@/lib/supabase/review-likes";
import { getUserListsWithPreviews } from "@/lib/supabase/user-lists";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicUserProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/u/${encodeURIComponent(slug)}`);
  }

  const profileUserId = await resolveProfileIdFromSlug(supabase, slug);
  if (!profileUserId) notFound();

  if (profileUserId === user.id) {
    redirect("/profile");
  }

  const dash = await getProfileDashboard(profileUserId, supabase);

  const [{ data: followRow }, { data: reverseFollowRow }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", profileUserId)
        .maybeSingle(),
      supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", profileUserId)
        .eq("following_id", user.id)
        .maybeSingle(),
    ]);
  const viewerFollowsProfile = Boolean(followRow);
  const profileFollowsViewer = Boolean(reverseFollowRow);

  const reviewsAllHref = `${publicProfilePath({
    id: profileUserId,
    username: dash.profile?.username ?? null,
  })}/reviews`;
  const [likeMeta, diaryEntries, theirLists] = await Promise.all([
    getReviewLikesMeta(
      dash.reviews.map((r) => r.id),
      user.id,
      supabase,
    ),
    getProfileDiaryTimeline(profileUserId, dash, supabase),
    getUserListsWithPreviews(profileUserId, supabase),
  ]);
  const reviewsWithLikes = attachReviewLikeMeta(dash.reviews, likeMeta);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.14em] text-[#678]">
          <Link
            href="/profile"
            className="text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            ← Mi perfil
          </Link>
        </p>
        <PublicProfilePageHeader
          dash={dash}
          profileUserId={profileUserId}
          viewerFollowsProfile={viewerFollowsProfile}
          profileFollowsViewer={profileFollowsViewer}
        />

        <div className="mt-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          <div className="min-w-0 space-y-10">
            <ProfileTopFour initial={dash.favorites} readOnly />
            <ProfileReviewsSection
              reviews={reviewsWithLikes}
              emptyMessage="Este jugador aún no ha publicado reseñas."
              viewAllHref={reviewsAllHref}
              reviewOwnerUserId={profileUserId}
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
                emptyLabel="Aún no tiene seguidores."
              />
            </section>
          </div>

          <aside className="mt-12 space-y-10 border-t border-[#2f3642] pt-10 lg:mt-0 lg:border-t-0 lg:pt-0">
            <ProfileBacklogSidebar
              preview={dash.backlogPreview}
              total={dash.backlogTotal}
              viewAllHref={null}
            />
            <ProfileDiarySidebar
              entries={diaryEntries}
              totalCount={diaryEntries.length}
              viewAllHref={null}
            />
            <ProfileListsSidebar
              lists={theirLists}
              totalCount={theirLists.length}
              viewAllHref={null}
            />
            <ProfileActivityFeed entries={diaryEntries} diaryHref={null} />
          </aside>
        </div>
      </main>
    </div>
  );
}
