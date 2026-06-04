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

  const isStaffDashboard = pathname.startsWith("/dashboard");
  const isClientArea = pathname.startsWith("/client");
  const isTechnicianArea = pathname.startsWith("/technician");
  const isClientPublic =
    pathname === "/client/signin" || pathname === "/client/signup";
  const isClientAuthed = isClientArea && !isClientPublic;

  type ProfileShape = {
    role: string;
    organization_id: string | null;
    account_type: string | null;
  };

  async function fetchProfile(): Promise<ProfileShape | null> {
    if (!user) return null;
    const { data } = await client.supabase
      .from("profiles")
      .select("role, organization_id, account_type")
      .eq("id", user.id)
      .single<ProfileShape>();
    return data;
  }

  // ── Client area ──
  if (isClientArea) {
    if (isClientAuthed) {
      if (!user) {
        return redirectWithCookies(
          new URL("/client/signin", request.url),
          client,
        );
      }
      const profile = await fetchProfile();
      if (profile?.account_type && profile.account_type !== "client") {
        return redirectWithCookies(new URL("/dashboard", request.url), client);
      }
      if (!profile?.organization_id) {
        return redirectWithCookies(
          new URL(
            "/client/signin?error=No+organization+linked+to+your+account",
            request.url,
          ),
          client,
        );
      }
      return client.response;
    }

    // Public client pages: bounce authenticated users to the right home
    if (user) {
      const profile = await fetchProfile();
      if (profile?.account_type === "client" && profile.organization_id) {
        return redirectWithCookies(
          new URL("/client/dashboard", request.url),
          client,
        );
      }
      if (profile?.organization_id) {
        return redirectWithCookies(new URL("/dashboard", request.url), client);
      }
    }
    return client.response;
  }

  // ── Technician area ──
  if (isTechnicianArea) {
    if (!user) {
      return redirectWithCookies(new URL("/signin", request.url), client);
    }
    const profile = await fetchProfile();
    if (profile?.role !== "technician") {
      // Non-technicians go to their proper home
      if (profile?.account_type === "client") {
        return redirectWithCookies(
          new URL("/client/dashboard", request.url),
          client,
        );
      }
      return redirectWithCookies(new URL("/dashboard", request.url), client);
    }
    if (!profile?.organization_id) {
      return redirectWithCookies(new URL("/signin", request.url), client);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email ?? "");
    requestHeaders.set("x-user-role", profile.role ?? "technician");
    requestHeaders.set("x-organization-id", profile.organization_id ?? "");

    const next = NextResponse.next({ request: { headers: requestHeaders } });
    client.response.cookies.getAll().forEach((cookie) => {
      next.cookies.set(cookie.name, cookie.value);
    });
    return next;
  }

  // ── Staff dashboard area ──
  if (isStaffDashboard) {
    if (!user) {
      return redirectWithCookies(new URL("/signin", request.url), client);
    }
    const profile = await fetchProfile();
    if (profile?.account_type === "client") {
      return redirectWithCookies(
        new URL("/client/dashboard", request.url),
        client,
      );
    }
    if (profile?.role === "technician") {
      return redirectWithCookies(new URL("/technician", request.url), client);
    }
    if (!profile?.organization_id) {
      return redirectWithCookies(
        new URL("/account/setup", request.url),
        client,
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email ?? "");
    requestHeaders.set("x-user-role", profile.role ?? "viewer");
    requestHeaders.set("x-organization-id", profile.organization_id ?? "");

    const next = NextResponse.next({ request: { headers: requestHeaders } });
    client.response.cookies.getAll().forEach((cookie) => {
      next.cookies.set(cookie.name, cookie.value);
    });
    return next;
  }

  // ── Public marketing routes ──
  if (user) {
    if (pathname === "/signin") {
      const profile = await fetchProfile();
      if (profile?.account_type === "client") {
        return redirectWithCookies(
          new URL("/client/dashboard", request.url),
          client,
        );
      }
      if (profile?.role === "technician") {
        return redirectWithCookies(new URL("/technician", request.url), client);
      }
      return redirectWithCookies(new URL("/dashboard", request.url), client);
    }
    if (pathname === "/signup" && !request.nextUrl.searchParams.has("step")) {
      const profile = await fetchProfile();
      if (profile?.account_type === "client") {
        return redirectWithCookies(
          new URL("/client/dashboard", request.url),
          client,
        );
      }
      return redirectWithCookies(new URL("/dashboard", request.url), client);
    }
  }
  return client.response;
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/client/:path*",
    "/technician/:path*",
    "/account/:path*",
  ],
};
