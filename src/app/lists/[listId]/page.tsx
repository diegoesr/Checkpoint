import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteListButton } from "@/components/lists/DeleteListButton";
import { ListDetailEditor } from "@/components/lists/ListDetailEditor";
import { ListReadOnlyGrid } from "@/components/lists/ListReadOnlyGrid";
import { Navbar } from "@/components/landing/Navbar";
import { publicProfilePath } from "@/lib/public-profile";
import { getUserListDetailById } from "@/lib/supabase/user-lists";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ listId: string }> };

export default async function UserListDetailPage({ params }: Props) {
  const { listId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/lists/${listId}`);

  const detail = await getUserListDetailById(listId, supabase);
  if (!detail) notFound();

  const { list, entries } = detail;
  const isOwner = user.id === list.user_id;

  const ownerProfileRes = isOwner
    ? null
    : await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", list.user_id)
        .maybeSingle();

  const backHref = isOwner
    ? "/lists"
    : publicProfilePath({
        id: list.user_id,
        username: (ownerProfileRes?.data?.username as string | null) ?? null,
      });

  const backLabel = isOwner ? "← Listas" : "← Perfil";

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[960px] px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#678]">
          <Link
            href={backHref}
            className="text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            {backLabel}
          </Link>
        </p>

        <header className="mt-6 border-b border-[#2f3642] pb-8">
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
            {list.name}
          </h1>
          {list.description ? (
            <p className="mt-3 max-w-2xl text-sm italic leading-relaxed text-[#9ab]">
              {list.description}
            </p>
          ) : null}
          <p className="mt-2 text-sm tabular-nums text-[#678]">
            {entries.length} {entries.length === 1 ? "juego" : "juegos"}
          </p>
          {!isOwner ? (
            <p className="mt-3 text-xs text-[#678]">
            </p>
          ) : null}
        </header>

        {isOwner ? (
          <>
            <div className="mt-8 flex justify-end">
              <DeleteListButton listId={list.id} />
            </div>
            <div className="mt-8">
              <ListDetailEditor list={list} entries={entries} />
            </div>
          </>
        ) : (
          <div className="mt-8">
            <ListReadOnlyGrid entries={entries} />
          </div>
        )}
      </main>
    </div>
  );
}
