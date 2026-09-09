import { createServerClient as createClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { Database } from "../types";
import { sharedCookieDomain } from "./cookie-domain";

export async function createServerClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: sharedCookieDomain(headerStore.get("host")),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from Server Component — safe to ignore.
            // Middleware will refresh the session before the next render.
          }
        },
      },
    },
  );
}
