import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ProfileFriendsContent } from "@/components/profile/ProfileFriendsContent";
import { ProfilePageHeader } from "@/components/profile/ProfilePageHeader";
import { ProfileSubNav } from "@/components/profile/ProfileSubNav";
import { getProfileDashboard } from "@/lib/supabase/profile-dashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfileFriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/friends");

  const dash = await getProfileDashboard(user.id, supabase);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-3 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <ProfilePageHeader dash={dash} user={user} headerActions="none" />
        <ProfileSubNav />
        <ProfileFriendsContent
          following={dash.following}
          followers={dash.followers}
        />
      </main>
    </div>
  );
}
