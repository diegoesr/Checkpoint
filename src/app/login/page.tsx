import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { LoginForm } from "@/components/auth/LoginForm";
import { Navbar } from "@/components/landing/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="relative min-h-full text-slate-100">
      <AuthBackground />

      <Navbar />
      <main className="relative z-10 mx-auto flex max-w-md flex-col px-6 pb-24 pt-28 sm:pt-32">
        <div className="rounded-2xl border border-violet-500/20 bg-slate-950/55 p-8 shadow-[0_0_60px_-12px_rgba(124,58,237,0.35)] backdrop-blur-md sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/signup"
              className="font-medium text-cyan-400 underline decoration-cyan-500/40 underline-offset-4 transition hover:text-cyan-300 hover:decoration-cyan-400/60"
            >
              Crear cuenta
            </Link>
          </p>

          <LoginForm />

          <p className="mt-8 text-center text-[10px] leading-relaxed tracking-wide text-slate-500">
            Autenticación con Supabase. 
          </p>
        </div>
      </main>
    </div>
  );
}
