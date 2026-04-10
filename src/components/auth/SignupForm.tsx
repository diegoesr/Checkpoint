"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-600/40 bg-[#0d0f18] px-3.5 py-3 text-[15px] text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/55 focus:outline-none focus:ring-2 focus:ring-cyan-500/25";

const labelClass =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/85";

const buttonClass =
  "mt-1 rounded-lg border border-[#006BB4]/45 bg-[#15282c] py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_24px_-10px_rgba(0,107,180,0.4)] transition hover:border-[#DE443B]/55 hover:bg-[#1a3540] hover:shadow-[0_8px_28px_-8px_rgba(222,68,59,0.22)] focus-visible:ring-2 focus-visible:ring-[#006BB4]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b14] disabled:pointer-events-none disabled:opacity-50";

function mapAuthMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered")) {
    return "Ese correo ya está registrado. Prueba a iniciar sesión.";
  }
  if (m.includes("password")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }
  if (m.includes("network")) {
    return "Error de red. Comprueba tu conexión.";
  }
  return message || "No se pudo crear la cuenta.";
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const username = String(fd.get("username") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/confirm`,
        data: {
          display_name: username || undefined,
        },
      },
    });

    setLoading(false);
    if (signError) {
      setError(mapAuthMessage(signError.message));
      return;
    }

    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setInfo(
      "Te hemos enviado un enlace de confirmación al correo. Ábrelo para activar la cuenta.",
    );
  }

  return (
    <form className="mt-9 flex flex-col gap-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username" className={labelClass}>
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClass}
          placeholder="jugador_42"
        />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-400/95" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-cyan-400/90" role="status">
          {info}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
