import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { ProfileReviewLog } from "@/components/profile/ProfileReviewLog";
import { ProfileSubNav } from "@/components/profile/ProfileSubNav";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ accion?: string }>;

function parseAccion(raw: string | undefined): "review" | "activity" | undefined {
  const a = raw?.toLowerCase().trim() ?? "";
  if (["reseña", "resena", "review"].includes(a)) return "review";
  if (["actividad", "activity"].includes(a)) return "activity";
  return undefined;
}

export default async function ProfileRegistrarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/registrar");

  const sp = await searchParams;
  const autoOpen = parseAccion(sp.accion);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#678]">
          <Link
            href="/profile"
            className="text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            ← Perfil
          </Link>
        </p>
        <ProfileSubNav />
        <header className="mt-8 border-b border-[#2f3642] pb-8">
          <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
            Registrar
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#9ab]">
            Publica una reseña con valoración o registra que estás jugando un
            título.
          </p>
          <div className="mt-8 border-t border-[#2f3642] pt-6">
            <ProfileReviewLog
              autoOpen={autoOpen}
              redirectToProfileAfterSave
            />
          </div>
        </header>
      </main>
    </div>
  );
}
