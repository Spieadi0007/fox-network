import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@fox/supabase/client/middleware";

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:3001";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users away from auth pages
  // But allow /signup with ?step= param (OAuth users returning for company setup)
  const pathname = request.nextUrl.pathname;
  if (user) {
    if (pathname === "/signin") {
      return NextResponse.redirect(PLATFORM_URL);
    }
    if (pathname === "/signup" && !request.nextUrl.searchParams.has("step")) {
      return NextResponse.redirect(PLATFORM_URL);
    }
  }

  return response;
}

export const config = {
  matcher: ["/signin", "/signup"],
};
