// Where the other FoxNetwork apps live.
//
// Staff and clients are one deployment reached on two subdomains of the
// marketing domain: admin.<domain> and platform.<domain>. Because that
// relationship is fixed, the URLs are derived from this site's own origin
// rather than being three separate values somebody has to keep in step.
//
// The explicit variables still win when set, which is what makes a one-off
// arrangement (a staging platform, a different apex) possible. But nothing
// has to be set for the links to be right in production — and a missing
// variable no longer silently ships localhost links to real visitors, which
// is exactly what it did the first time this deployed.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";

/** `admin` / `platform` as a sibling subdomain of wherever this site is served. */
function sibling(subdomain: string): string {
  try {
    const url = new URL(SITE);
    // Local development runs everything on ports, not subdomains.
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }
    url.hostname = `${subdomain}.${url.hostname.replace(/^www\./, "")}`;
    url.port = "";
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM_URL || sibling("admin");
const PORTAL = process.env.NEXT_PUBLIC_PORTAL_URL || sibling("platform");

export const site = {
  /** Canonical origin of this marketing site, for metadata and hreflang. */
  url: SITE,
  contactEmail: "contact@foxnetwork.io",

  /** Staff sign-in — the ops dashboard. */
  signIn: `${PLATFORM}/signin`,
  signUp: `${PLATFORM}/signup`,

  /** Client portal — where an operator books an intervention. */
  clientSignIn: `${PORTAL}/client/signin`,
  clientSignUp: `${PORTAL}/client/signup`,
} as const;
