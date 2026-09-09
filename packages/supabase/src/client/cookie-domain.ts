/**
 * The domain the Supabase auth cookie should be scoped to.
 *
 * Staff and clients are one deployment reached on two subdomains, and
 * middleware moves people between them: a client account signing in on
 * admin.<domain> is sent to platform.<domain>. Cookies are host-scoped
 * unless a domain is set, so without this that redirect lands on a host
 * where the session does not exist and asks them to sign in a second time.
 *
 * The parent domain is derived by stripping a known application subdomain
 * rather than by guessing where the registrable domain begins. Guessing
 * needs the public suffix list to be correct — ".co.uk" is two labels, ".io"
 * is one — and getting it wrong writes a cookie the browser silently
 * refuses. We only ever serve from these two subdomains, so the safe answer
 * is to recognise them and leave every other host alone.
 *
 * Returning undefined means host-only, which is the right behaviour for
 * localhost, *.vercel.app previews and the bare apex.
 */
const APP_SUBDOMAINS = ["admin", "platform"];

export function sharedCookieDomain(
  host: string | null | undefined,
): string | undefined {
  if (!host) return undefined;

  const name = host.split(":")[0].toLowerCase().replace(/\.$/, "");
  const labels = name.split(".");
  if (labels.length < 3) return undefined;
  if (!APP_SUBDOMAINS.includes(labels[0])) return undefined;

  return `.${labels.slice(1).join(".")}`;
}
