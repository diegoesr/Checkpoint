import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-black px-6 text-center text-slate-200">
      <h1 className="text-xl font-semibold text-white">
        No se pudo completar el inicio de sesión
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        El enlace puede haber caducado, ser inválido o haberse abierto en otro
        navegador distinto al del registro (flujo PKCE). En Supabase, edita la
        plantilla “Confirm signup” y usa un enlace con{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs">
          token_hash
        </code>{" "}
        hacia{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs">
          /auth/confirm
        </code>{" "}
        (ver documentación del proyecto). También puedes desactivar temporalmente
        la confirmación por correo para pruebas.
      </p>
      <Link
        href="/login"
        className="mt-8 text-sm font-medium text-cyan-400 underline-offset-4 hover:underline"
      >
        Ir a iniciar sesión
      </Link>
    </div>
  );
}
