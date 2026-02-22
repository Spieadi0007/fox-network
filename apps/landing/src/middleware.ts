import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@fox/supabase/client/middleware";

function redirectWithCookies(
  url: URL,
  client: ReturnType<typeof createMiddlewareClient>,
) {
  const response = NextResponse.redirect(url);
  client.response.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If Supabase redirects the auth code to "/" instead of "/auth/callback",
  // forward it to the callback route so the code gets exchanged for a session.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  const client = createMiddlewareClient(request);

  const {
    data: { user },
  } = await client.supabase.auth.getUser();

  const isDashboard = pathname.startsWith("/dashboard");

  // ── Public routes: redirect authenticated users to /dashboard ──
  if (!isDashboard) {
    if (user) {
      if (pathname === "/signin") {
        return redirectWithCookies(new URL("/dashboard", request.url), client);
      }
      if (pathname === "/signup" && !request.nextUrl.searchParams.has("step")) {
        return redirectWithCookies(new URL("/dashboard", request.url), client);
      }
    }
    return client.response;
  }

  // ── Dashboard routes: require auth ──

  // Redirect unauthenticated users to sign-in
  if (!user) {
    return redirectWithCookies(new URL("/signin", request.url), client);
  }

  // Fetch profile for role
  const { data: profile } = await client.supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single<{ role: string; organization_id: string | null }>();

  const role = profile?.role ?? "viewer";

  // Redirect users without an organization to company setup
  if (!profile?.organization_id) {
    return redirectWithCookies(
      new URL("/signup?step=company-2", request.url),
      client,
    );
  }

  // Inject user info as headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email ?? "");
  requestHeaders.set("x-user-role", role);
  requestHeaders.set("x-organization-id", profile.organization_id ?? "");

  const next = NextResponse.next({
    request: { headers: requestHeaders },
  });
  // Preserve refreshed session cookies
  client.response.cookies.getAll().forEach((cookie) => {
    next.cookies.set(cookie.name, cookie.value);
  });
  return next;
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
  ],
};
