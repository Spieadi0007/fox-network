import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@fox/supabase/client/middleware";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3000";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow callback route through
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return response;
  }

  // Redirect unauthenticated users to landing sign-in
  if (!user) {
    return NextResponse.redirect(`${LANDING_URL}/signin`);
  }

  // Fetch profile for role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single<{ role: string; organization_id: string | null }>();

  const role = profile?.role ?? "viewer";

  // Inject user info as headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email ?? "");
  requestHeaders.set("x-user-role", role);
  requestHeaders.set("x-organization-id", profile?.organization_id ?? "");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
