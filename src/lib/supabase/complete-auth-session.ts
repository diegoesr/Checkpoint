import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Completa sesión tras enlace del correo u OAuth:
 * - `token_hash` + `type` → verifyOtp (funciona aunque abras el mail en otro navegador)
 * - `code` → exchangeCodeForSession (PKCE; requiere el mismo navegador que inició el flujo)
 */
export async function resolveAuthRedirect(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : `/${next}`;

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return buildSuccessRedirect(origin, safeNext, forwardedHost);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return buildSuccessRedirect(origin, safeNext, forwardedHost);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

function buildSuccessRedirect(
  origin: string,
  next: string,
  forwardedHost: string | null,
): NextResponse {
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`);
  }
  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
