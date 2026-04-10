import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileDashboard } from "@/lib/supabase/profile-dashboard";
import {
  getAvatarUrlForNavbar,
  getDisplayNameForNavbar,
  upsertProfileFromAuth,
} from "@/lib/supabase/profile";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Navbar } from "@/components/landing/Navbar";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/edit");

  const [, dash] = await Promise.all([
    upsertProfileFromAuth(user, supabase),
    getProfileDashboard(user.id, supabase),
  ]);

  const displayName =
    dash.profile?.display_name?.trim() || getDisplayNameForNavbar(user);
  const avatarUrl =
    dash.profile?.avatar_url?.trim() || getAvatarUrlForNavbar(user) || "";
  const username = dash.profile?.username?.trim() || "";
  const bio = dash.profile?.bio?.trim() || "";
  const psnId = dash.profile?.psn_id?.trim() || "";
  const xboxGamertag = dash.profile?.xbox_gamertag?.trim() || "";
  const steamDisplay = dash.profile?.steam_display?.trim() || "";
  const nintendoFriendCode =
    dash.profile?.nintendo_friend_code?.trim() || "";
  const epicDisplayName = dash.profile?.epic_display_name?.trim() || "";
  const battlenetBtag = dash.profile?.battlenet_btag?.trim() || "";
  const email = user.email ?? "";

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <h1 className="text-2xl font-bold text-white">Editar perfil</h1>
        <p className="mt-2 text-sm text-[#9ab]">
          Nombre, frase, foto, usuario, correo, IDs en consolas y enlaces de
          contacto.
        </p>
        <div className="mt-10">
          <ProfileEditForm
            userId={user.id}
            email={email}
            displayName={displayName}
            username={username}
            bio={bio}
            avatarUrl={avatarUrl}
            psnId={psnId}
            xboxGamertag={xboxGamertag}
            steamDisplay={steamDisplay}
            nintendoFriendCode={nintendoFriendCode}
            epicDisplayName={epicDisplayName}
            battlenetBtag={battlenetBtag}
            links={dash.links}
          />
        </div>
      </main>
    </div>
  );
}
