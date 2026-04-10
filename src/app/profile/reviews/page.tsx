import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ProfilePageHeader } from "@/components/profile/ProfilePageHeader";
import { ProfileReviewsPagination } from "@/components/profile/ProfileReviewsPagination";
import { ProfileReviewsSection } from "@/components/profile/ProfileReviewsSection";
import { ProfileSubNav } from "@/components/profile/ProfileSubNav";
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

type SearchParams = Promise<{ page?: string }>;

export default async function ProfileReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/reviews");

  const sp = await searchParams;
  const page = Number.parseInt(sp.page ?? "1", 10);

  const [dash, reviewsPage] = await Promise.all([
    getProfileDashboard(user.id, supabase),
    getGameReviewsPaged(user.id, page, supabase),
  ]);
  const likeMeta = await getReviewLikesMeta(
    reviewsPage.reviews.map((r) => r.id),
    user.id,
    supabase,
  );
  const reviewsWithLikes = attachReviewLikeMeta(
    reviewsPage.reviews,
    likeMeta,
  );

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <ProfilePageHeader dash={dash} user={user} headerActions="none" />
        <ProfileSubNav />

        <div className="mt-8">
          <p className="mb-6 hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#678] md:block">
            <Link
              href="/profile"
              className="text-[#40bcf4] transition hover:text-[#5ccfff]"
            >
              ← Perfil
            </Link>
          </p>
          <div className="mb-6 md:hidden">
            <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
              Todas las reseñas
            </h1>
            <p className="mt-1 text-xs text-[#567]">
              Valoraciones y textos publicados, ordenados por fecha.
            </p>
          </div>
          <ProfileReviewsSection
            reviews={reviewsWithLikes}
            heading="Todas las reseñas"
            emptyMessage="Aún no hay reseñas."
            hideHeadingOnMobile
            reviewOwnerUserId={user.id}
            viewerUserId={user.id}
          />
          <ProfileReviewsPagination
            basePath="/profile/reviews"
            page={reviewsPage.page}
            total={reviewsPage.total}
            pageSize={reviewsPage.pageSize}
          />
        </div>
      </main>
    </div>
  );
}
