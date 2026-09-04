// Where the other FoxNetwork apps live.
//
// During the split these still point at the single landing deployment. Phase 2
// moves them to their own subdomains and only these two values change — which
// is the reason every cross-app link in this app is built from here rather
// than hardcoded as a relative path.
const PLATFORM =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:3000";
const PORTAL = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";

export const site = {
  /** Canonical origin of this marketing site, for metadata and hreflang. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002",
  contactEmail: "contact@foxnetwork.io",

  /** Staff sign-in — the ops dashboard. */
  signIn: `${PLATFORM}/signin`,
  signUp: `${PLATFORM}/signup`,

  /** Client portal — where an operator books an intervention. */
  clientSignIn: `${PORTAL}/client/signin`,
  clientSignUp: `${PORTAL}/client/signup`,
} as const;
