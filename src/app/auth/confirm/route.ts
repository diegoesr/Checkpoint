import { type NextRequest } from "next/server";
import { resolveAuthRedirect } from "@/lib/supabase/complete-auth-session";

/** Alias recomendado en plantillas de correo (token_hash + type). */
export async function GET(request: NextRequest) {
  return resolveAuthRedirect(request);
}
