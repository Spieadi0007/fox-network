/**
 * The base URL to build emailed links from.
 *
 * This deliberately does not share the `?? "http://localhost:3000"` fallback
 * used for OAuth redirects. A wrong redirect URL fails loudly in front of the
 * person it affects; a wrong link inside an email is discovered days later by
 * someone who cannot get in, so an unset variable falls back to the known
 * production host rather than to localhost.
 */
export function getPublicAppUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_LANDING_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (configured) return stripTrailingSlash(configured);

  // Vercel sets this on production deployments of a project with a domain.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;

  return "https://www.foxnetwork.io";
}

export function invitationUrl(token: string): string {
  return `${getPublicAppUrl()}/invite/${token}`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
