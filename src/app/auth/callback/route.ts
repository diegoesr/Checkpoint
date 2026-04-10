import { type NextRequest } from "next/server";
import { resolveAuthRedirect } from "@/lib/supabase/complete-auth-session";

export async function GET(request: NextRequest) {
  return resolveAuthRedirect(request);
}
