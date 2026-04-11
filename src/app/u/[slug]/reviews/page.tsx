import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ProfileReviewsPagination } from "@/components/profile/ProfileReviewsPagination";
import { ProfileReviewsSection } from "@/components/profile/ProfileReviewsSection";
import { PublicProfilePageHeader } from "@/components/profile/PublicProfilePageHeader";
import { publicProfilePath, resolveProfileIdFromSlug } from "@/lib/public-profile";
import {
  getGameReviewsPaged,
  getProfileDashboard,
} from "@/lib/supabase/profile-dashboard";
import {
  attachReviewLikeMeta,
  getReviewLikesMeta,
} from "@/lib/supabase/review-likes";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function PublicUserReviewsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number.parseInt(sp.page ?? "1", 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/u/${encodeURIComponent(slug)}/reviews`);
  }

  const profileUserId = await resolveProfileIdFromSlug(supabase, slug);
  if (!profileUserId) notFound();

  if (profileUserId === user.id) {
    redirect("/profile/reviews");
  }

  const [dash, reviewsPage, followResult, reverseFollowResult] =
    await Promise.all([
      getProfileDashboard(profileUserId, supabase),
      getGameReviewsPaged(profileUserId, page, supabase),
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
  const viewerFollowsProfile = Boolean(followResult.data);
  const profileFollowsViewer = Boolean(reverseFollowResult.data);
  const likeMeta = await getReviewLikesMeta(
    reviewsPage.reviews.map((r) => r.id),
    user.id,
    supabase,
  );
  const reviewsWithLikes = attachReviewLikeMeta(
    reviewsPage.reviews,
    likeMeta,
  );

  const profileBase = publicProfilePath({
    id: dash.profile?.id ?? profileUserId,
    username: dash.profile?.username ?? null,
  });
  const playerLabel =
    dash.profile?.display_name?.trim() ||
    dash.profile?.username?.trim() ||
    "Este jugador";

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <p className="mb-6 hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#678] md:block">
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

        <div className="mt-8">
          <p className="mb-6 hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#678] md:block">
            <Link
              href={profileBase}
              className="text-[#40bcf4] transition hover:text-[#5ccfff]"
            >
              ← Perfil de este jugador
            </Link>
          </p>
          <div className="mb-6 md:hidden">
            <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
              Todas las reseñas
            </h1>
            <p className="mt-1 text-xs text-[#567]">
              Publicadas por {playerLabel}.
            </p>
          </div>
          <ProfileReviewsSection
            reviews={reviewsWithLikes}
            heading="Todas las reseñas"
            emptyMessage="Este jugador aún no ha publicado reseñas."
            hideHeadingOnMobile
            reviewOwnerUserId={profileUserId}
            viewerUserId={user.id}
          />
          <ProfileReviewsPagination
            basePath={`${profileBase}/reviews`}
            page={reviewsPage.page}
            total={reviewsPage.total}
            pageSize={reviewsPage.pageSize}
          />
        </div>
      </main>
    </div>
  );
}
