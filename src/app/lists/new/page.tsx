import Link from "next/link";
import { redirect } from "next/navigation";
import { NewListDraftEditor } from "@/components/lists/NewListDraftEditor";
import { Navbar } from "@/components/landing/Navbar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Crear lista: editor en memoria hasta el primer juego.
 * No se inserta fila en `user_lists` hasta que hay al menos una entrada.
 */
export default async function NewListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/lists/new");

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-[960px] px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#678]">
          <Link
            href="/lists"
            className="text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            ← Listas
          </Link>
        </p>

        <header className="mt-6 border-b border-[#2f3642] pb-8">
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
            Nueva lista
          </h1>
          <p className="mt-2 text-sm tabular-nums text-[#678]">0 juegos</p>
        </header>

        <div className="mt-8">
          <NewListDraftEditor />
        </div>
      </main>
    </div>
  );
}
