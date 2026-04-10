import { redirect } from "next/navigation";
import { createBlankListForUser } from "@/app/lists/actions";

export const dynamic = "force-dynamic";

/**
 * Desde «Crear lista»: crea una fila borrador y redirige al editor unificado
 * (datos + búsqueda + rejilla) en `/lists/[id]`.
 */
export default async function NewListPage() {
  const result = await createBlankListForUser();
  if (!result.ok) {
    if (result.error === "No autenticado") {
      redirect("/login?next=/lists/new");
    }
    redirect("/lists");
  }

  redirect(`/lists/${result.id}`);
}
