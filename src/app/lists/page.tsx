import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateListToolbar } from "@/components/lists/CreateListToolbar";
import { UserListRow } from "@/components/lists/UserListRow";
import { Navbar } from "@/components/landing/Navbar";
import { getUserListsWithPreviews } from "@/lib/supabase/user-lists";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/lists");

  const lists = await getUserListsWithPreviews(user.id, supabase);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#678]">
          <Link
            href="/profile"
            className="text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            ← Perfil
          </Link>
        </p>
        <h1 className="sr-only">Listas</h1>
        <div className="mt-6 flex flex-col-reverse gap-8">
          <section aria-labelledby="lists-heading">
            <h2
              id="lists-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]"
            >
              Mi top de listas
            </h2>
            {lists.length === 0 ? (
              <p className="mt-4 text-sm text-[#678]">
                Aún no tienes listas.
              </p>
            ) : (
              <ul className="mt-6 flex list-none flex-col gap-8 p-0 md:grid md:grid-cols-2 md:justify-items-center md:gap-x-6 md:gap-y-10 lg:grid-cols-3">
                {lists.map((list) => (
                  <UserListRow key={list.id} list={list} />
                ))}
              </ul>
            )}
          </section>

          <div className="shrink-0">
            <CreateListToolbar />
          </div>
        </div>
      </main>
    </div>
  );
}
