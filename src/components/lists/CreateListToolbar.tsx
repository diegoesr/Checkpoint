import Link from "next/link";

/** Crea una lista borrador y redirige al editor unificado en `/lists/[id]`. */
export function CreateListToolbar() {
  return (
    <Link
      href="/lists/new"
      prefetch
      className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 sm:w-auto sm:px-5"
    >
      Crear lista
    </Link>
  );
}
