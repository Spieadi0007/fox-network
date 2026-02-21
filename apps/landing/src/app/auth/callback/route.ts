import { NextResponse } from "next/server";
import { createServerClient } from "@fox/supabase/client/server";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3000";
const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL || LANDING_URL;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If next points to signup (e.g. company step 2), stay on landing
      if (next.startsWith("/signup")) {
        return NextResponse.redirect(`${LANDING_URL}${next}`);
      }

      // Redirect to platform — session cookies are shared across ports on localhost
      return NextResponse.redirect(`${PLATFORM_URL}${next}`);
    }
  }

  // Something went wrong — redirect to sign-in with error
  return NextResponse.redirect(
    new URL("/signin?error=Could not authenticate", request.url),
  );
}
