import { getPathname } from "@/i18n/navigation";
import { routing, type Locale, type Pathname } from "@/i18n/routing";

/**
 * hreflang for a localized route.
 *
 * The paths differ per locale (/fr/devis vs /en/quote), so the alternates
 * cannot be built by string-concatenating the locale onto one path — they are
 * resolved through the same routing table the links use, which keeps them
 * correct when a translated path changes.
 */
export function alternates(href: Pathname, locale: Locale) {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href, locale: l })]),
  ) as Record<Locale, string>;

  return {
    canonical: getPathname({ href, locale }),
    languages: { ...languages, "x-default": href },
  };
}
