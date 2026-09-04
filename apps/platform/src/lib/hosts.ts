// Which front door did this request come through?
//
// Staff and clients are one app, deployed once, but reached on two
// subdomains: admin.<domain> for staff, platform.<domain> for clients.
// The pages, the login and the database are identical either way — the host
// only decides where "/" lands and which side someone gets bounced to when
// they arrive on the wrong one.
//
// Anything that is neither prefix — localhost, a *.vercel.app preview, the
// bare apex — resolves to "any", where no host rules apply at all and the app
// behaves exactly as it did before subdomains existed. That is what keeps
// local development and preview deployments usable.

export type Surface = "staff" | "client" | "any";

const PREFIX: Record<Exclude<Surface, "any">, string> = {
  staff: "admin.",
  client: "platform.",
};

export function surfaceOf(host: string | null | undefined): Surface {
  if (!host) return "any";
  const name = host.split(":")[0].toLowerCase();
  if (name.startsWith(PREFIX.staff)) return "staff";
  if (name.startsWith(PREFIX.client)) return "client";
  return "any";
}

/** The surface a path belongs to. Technicians are staff-side. */
export function surfaceOfPath(pathname: string): Exclude<Surface, "any"> {
  return pathname.startsWith("/client") ? "client" : "staff";
}

/**
 * Swap the subdomain so a URL lands on the surface its path belongs to.
 *
 * Returns null when there is nothing to swap — an unrecognised host, or a
 * path already on the right side — so the caller can keep the request-relative
 * URL it would otherwise have built.
 */
export function hostForPath(
  currentHost: string | null | undefined,
  pathname: string,
): string | null {
  const from = surfaceOf(currentHost);
  if (from === "any" || !currentHost) return null;

  const to = surfaceOfPath(pathname);
  if (to === from) return null;

  return currentHost.replace(PREFIX[from], PREFIX[to]);
}
