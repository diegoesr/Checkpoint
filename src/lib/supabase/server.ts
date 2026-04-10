import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Un cliente por petición RSC: Navbar, layout y páginas reutilizan la misma
 * instancia y evitan lecturas duplicadas de cookies / handshakes extra.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components: cookies are read-only
          }
        },
      },
    },
  );
});
