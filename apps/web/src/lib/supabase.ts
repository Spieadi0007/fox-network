import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for the one thing this site writes: a quote
 * request.
 *
 * There is no session to carry, so this deliberately does not use the
 * cookie-based @supabase/ssr client the signed-in apps need — and by not
 * importing @fox/supabase at all, the marketing site stays free of the
 * Next-server-action coupling that the rest of the split has to unpick.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
