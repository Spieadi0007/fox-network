import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@fox/supabase/client/middleware";

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:3001";

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

  // Redirect authenticated users away from auth pages
  // But allow /signup with ?step= param (OAuth users returning for company setup)
  if (user) {
    if (pathname === "/signin") {
      const redirect = NextResponse.redirect(PLATFORM_URL);
      client.response.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie.name, cookie.value);
      });
      return redirect;
    }
    if (pathname === "/signup" && !request.nextUrl.searchParams.has("step")) {
      const redirect = NextResponse.redirect(PLATFORM_URL);
      client.response.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie.name, cookie.value);
      });
      return redirect;
    }
  }

  return client.response;
}

export const config = {
  matcher: ["/", "/signin", "/signup"],
};
