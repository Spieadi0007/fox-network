import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowUpRight,
  CalendarCheck,
  Globe,
  Linkedin,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { ContactRow } from "./contact-row";

/**
 * Karim's link page — what the QR code on his Web Summit badge opens.
 *
 * Someone scans it standing in a hall, mid-conversation, so this is built for
 * one thumb on a phone: who he is, then a handful of big targets, nothing to
 * scroll past. No navbar or footer for the same reason.
 *
 * Kept out of search results: it duplicates the founder section and exists
 * only for people who were handed the code.
 */

// Filled in once Karim confirms them. In production a link with an empty
// value is not shown, so nothing half-finished reaches someone holding a phone
// up to a badge; in development it renders as "#" so the layout can be seen.
const KARIM = {
  email: site.contactEmail,
  phone: "",
  booking: "",
  linkedin: "https://www.linkedin.com/in/adaimi-karim/",
};

const dev = process.env.NODE_ENV === "development";
const pending = (value: string, placeholder = "#") =>
  value || (dev ? placeholder : "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.karim" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

type LinkItem = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  external?: boolean;
  primary?: boolean;
};

export default async function KarimPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("karim");
  const f = await getTranslations("founder");

  // Booking a call is what the conversation at the stand is for, so it leads;
  // LinkedIn is the low-commitment way to stay in touch.
  const links: LinkItem[] = [
    {
      href: pending(KARIM.booking),
      label: t("bookCall"),
      hint: t("bookCallHint"),
      icon: CalendarCheck,
      external: true,
      primary: true,
    },
    {
      href: pending(KARIM.linkedin),
      label: t("linkedin"),
      hint: t("linkedinHint"),
      icon: Linkedin,
      external: true,
    },
    {
      href: `/${locale}`,
      label: t("website"),
      hint: t("websiteHint"),
      icon: Globe,
    },
  ].filter((link) => link.href);

  const phone = pending(KARIM.phone, "+33 6 00 00 00 00");

  return (
    <main className="relative min-h-svh overflow-hidden px-4 py-10 sm:py-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-sm">
        <section className="rounded-[1.75rem] border border-stone-200/70 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-white">
            KA
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-heading)] text-[24px] font-bold tracking-[-0.03em] text-stone-900">
            {f("name")}
          </h1>
          <p className="mt-1 text-[15px] text-stone-600">{f("role")}</p>
          {/* The same lockup as the site's navbar, so the page reads as ours. */}
          <div className="mt-4 inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fox-logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
              Fox<span className="text-brand">Network</span>
            </span>
          </div>
          <div className="mt-5 space-y-2">
            <ContactRow kind="email" value={KARIM.email} />
            {phone && <ContactRow kind="phone" value={phone} />}
          </div>
          <p className="mx-auto mt-5 max-w-[17rem] text-[14px] leading-[1.6] text-stone-500">
            {t("tagline")}
          </p>
        </section>

        <ul className="mt-5 space-y-3">
          {links.map(({ href, label, hint, icon: Icon, external, primary }) => (
            <li key={label}>
              <a
                href={href}
                {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all active:scale-[0.98] ${
                  primary
                    ? "border-stone-900 bg-stone-900 text-white hover:bg-stone-800"
                    : "border-stone-200/80 bg-white text-stone-900 hover:border-stone-300 hover:shadow-sm"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    primary ? "bg-white/10" : "bg-stone-100 text-brand"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{label}</span>
                  <span
                    className={`block truncate text-[13px] ${primary ? "text-white/60" : "text-stone-500"}`}
                  >
                    {hint}
                  </span>
                </span>
                <ArrowUpRight
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                    primary ? "text-white/60" : "text-stone-400"
                  }`}
                />
              </a>
            </li>
          ))}
          <li>
            <ContactForm />
          </li>
        </ul>
      </div>
    </main>
  );
}
