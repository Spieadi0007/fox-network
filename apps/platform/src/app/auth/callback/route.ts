import { NextResponse } from "next/server";
import { createServerClient } from "@fox/supabase/client/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const landingUrl =
    process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3000";
  return NextResponse.redirect(
    `${landingUrl}/signin?error=Could not authenticate`,
  );
}
