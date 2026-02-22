import { NextResponse } from "next/server";
import { createServerClient } from "@fox/supabase/client/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirects: only allow relative paths
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Something went wrong — redirect to sign-in with error
  return NextResponse.redirect(
    new URL("/signin?error=Could not authenticate", request.url),
  );
}
