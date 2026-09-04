import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@fox/supabase/client/middleware";
import { hostForPath, surfaceOf } from "@/lib/hosts";

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
    // Same host deliberately: the code was issued for whichever subdomain
    // the user signed in on, and it must be exchanged there. This also runs
    // before `host` exists, so it cannot use urlFor.
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  const host = request.headers.get("host");
  const surface = surfaceOf(host);

  const isStaffDashboard = pathname.startsWith("/dashboard");
  const isClientArea = pathname.startsWith("/client");
  const isTechnicianArea = pathname.startsWith("/technician");

  // ── Front door per subdomain ──
  // Staff and clients share this app but arrive on different hosts, so "/"
  // means something different on each. On an unrecognised host (localhost, a
  // preview build) surface is "any" and none of this applies.
  if (surface === "client") {
    if (pathname === "/" || pathname === "/signin") {
      return NextResponse.redirect(urlFor("/client/signin"));
    }
    if (pathname === "/signup") {
      return NextResponse.redirect(urlFor("/client/signup"));
    }
  }
  if (surface === "staff" && pathname === "/") {
    return NextResponse.redirect(urlFor("/signin"));
  }

  // ── Wrong door ──
  // /dashboard reached on the client subdomain, or /client on the staff one.
  // Send them across instead of serving the same page on both hosts, which
  // would give every page two addresses.
  if (isStaffDashboard || isClientArea || isTechnicianArea) {
    const swap = hostForPath(host, pathname);
    if (swap) {
      const crossed = new URL(request.url);
      crossed.host = swap;
      return NextResponse.redirect(crossed);
    }
  }

  const client = createMiddlewareClient(request);

  const {
    data: { user },
  } = await client.supabase.auth.getUser();

  // Every redirect below is expressed as a path. This puts each one on the
  // host that owns it, so sending a client to /client/dashboard from the
  // staff subdomain lands them on the client subdomain rather than serving
  // the client portal under admin.
  function urlFor(path: string): URL {
    const url = new URL(path, request.url);
    const swap = hostForPath(host, url.pathname);
    if (swap) url.host = swap;
    return url;
  }
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

    // An invitation is normally accepted by handle_new_user when the account
    // is created. Someone invited *after* they signed up never hits that
    // trigger, so they arrive here with no organisation and would be sent to
    // company signup. Give them their invitation instead.
    if (data && !data.organization_id) {
      const { data: orgId } = await client.supabase.rpc(
        "claim_pending_invitation",
      );
      if (orgId) {
        const { data: linked } = await client.supabase
          .from("profiles")
          .select("role, organization_id, account_type")
          .eq("id", user.id)
          .single<ProfileShape>();
        return linked ?? data;
      }
    }

    return data;
  }

  // ── Client area ──
  if (isClientArea) {
    if (isClientAuthed) {
      if (!user) {
        return redirectWithCookies(
          urlFor("/client/signin"),
          client,
        );
      }
      const profile = await fetchProfile();
      if (profile?.account_type && profile.account_type !== "client") {
        return redirectWithCookies(urlFor("/dashboard"), client);
      }
      if (!profile?.organization_id) {
        return redirectWithCookies(
          urlFor("/client/signin?error=No+organization+linked+to+your+account"),
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
          urlFor("/client/dashboard"),
          client,
        );
      }
      if (profile?.organization_id) {
        return redirectWithCookies(urlFor("/dashboard"), client);
      }
    }
    return client.response;
  }

  // ── Technician area ──
  if (isTechnicianArea) {
    if (!user) {
      return redirectWithCookies(urlFor("/signin"), client);
    }
    const profile = await fetchProfile();
    if (profile?.role !== "technician") {
      // Non-technicians go to their proper home
      if (profile?.account_type === "client") {
        return redirectWithCookies(
          urlFor("/client/dashboard"),
          client,
        );
      }
      return redirectWithCookies(urlFor("/dashboard"), client);
    }
    if (!profile?.organization_id) {
      return redirectWithCookies(urlFor("/signin"), client);
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
      return redirectWithCookies(urlFor("/signin"), client);
    }
    const profile = await fetchProfile();
    if (profile?.account_type === "client") {
      return redirectWithCookies(
        urlFor("/client/dashboard"),
        client,
      );
    }
    if (profile?.role === "technician") {
      return redirectWithCookies(urlFor("/technician"), client);
    }
    if (!profile?.organization_id) {
      // No org yet — keep them moving through account creation.
      return redirectWithCookies(
        urlFor("/signup?step=company-2"),
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
      if (profile?.account_type === "client" && profile.organization_id) {
        return redirectWithCookies(
          urlFor("/client/dashboard"),
          client,
        );
      }
      // The organisation check is not redundant. /technician bounces a
      // member with no organisation straight back to /signin, so routing on
      // role alone would ping-pong between the two for ever.
      if (profile?.role === "technician" && profile.organization_id) {
        return redirectWithCookies(urlFor("/technician"), client);
      }
      if (profile?.organization_id) {
        return redirectWithCookies(urlFor("/dashboard"), client);
      }

      // Signed in, but attached to no organisation. Sending them on to
      // /dashboard used to bounce them to /signup?step=company-2 — so opening
      // the sign-in page landed you in company creation, with no way back to
      // the form to sign in as somebody else. Show the page and say why.
      if (!request.nextUrl.searchParams.has("incomplete")) {
        return redirectWithCookies(
          urlFor("/signin?incomplete=1"),
          client,
        );
      }
      return client.response;
    }
    if (pathname === "/signup" && !request.nextUrl.searchParams.has("step")) {
      const profile = await fetchProfile();
      if (profile?.account_type === "client") {
        return redirectWithCookies(
          urlFor("/client/dashboard"),
          client,
        );
      }
      return redirectWithCookies(urlFor("/dashboard"), client);
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
  ],
};
