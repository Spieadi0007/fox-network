import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Space_Grotesk, DM_Sans, DM_Mono } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { alternates } from "@/lib/metadata";
import { site } from "@/lib/site";
import "../globals.css";

// latin-ext carries the French diacritics — é è ê ç à ù — and, importantly,
// the œ ligature, which appears in ordinary French words and is missing from
// the plain latin subset.
const heading = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return {
    metadataBase: new URL(site.url),
    title: t("title"),
    description: t("description"),
    // Both locales are advertised as alternates of each other, plus an
    // x-default pointing at "/" so a search engine sends a visitor through
    // the same language negotiation a person gets.
    alternates: alternates("/", locale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      type: "website",
      url: `${site.url}/${locale}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opts this locale's pages into static rendering.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* Apollo's website visitor tracker, moved here from the app that
            used to serve both the marketing pages and the signed-in
            product. It is a lead-identification tool, so it belongs on the
            public site and has no business running inside a workspace
            someone has logged into.

            NOTE: it currently fires on load, before any consent. That was
            already true on the old site, but this site's market is France —
            under the ePrivacy rules the CNIL enforces, a non-essential
            tracker needs consent first. Gate it behind a consent banner
            before the commercial launch. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"698ec73ce16e4600199567ab"})},document.head.appendChild(o)}initApollo();`,
          }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
