import { createBrowserClient as createClient } from "@supabase/ssr";
import type { Database } from "../types";
import { sharedCookieDomain } from "./cookie-domain";

export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // The browser writes the same cookie the server does. Scoping it
      // differently here would leave two auth cookies on the same domain,
      // which is the shape of bug this whole change exists to remove.
      cookieOptions: {
        domain: sharedCookieDomain(
          typeof window === "undefined" ? null : window.location.hostname,
        ),
      },
    },
  );
}
