import { defineRouting } from "next-intl/routing";

// French is the product language, not a translation of the English one: the
// beachhead is Paris and the eight départements of Île-de-France. English
// exists for international operators evaluating us from outside France.
//
// Both locales are prefixed. A hidden default ("/" serves French, "/en"
// serves English) makes hreflang ambiguous and leaves the French pages with
// no canonical URL of their own — so "/" only ever negotiates and redirects.
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",

  // URLs are translated too. A French prospect searching for "devis
  // maintenance" should land on /fr/devis, not /fr/quote — the path is part
  // of the page for both the reader and the search engine. The key on the
  // left is the internal route (and the folder under app/[locale]); the
  // values are what a visitor actually sees.
  pathnames: {
    "/": "/",
    "/quote": { fr: "/devis", en: "/quote" },
    "/privacy": { fr: "/confidentialite", en: "/privacy" },
    "/terms": { fr: "/conditions-utilisation", en: "/terms" },
    "/legal-notice": { fr: "/mentions-legales", en: "/legal-notice" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathname = keyof typeof routing.pathnames;

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};
