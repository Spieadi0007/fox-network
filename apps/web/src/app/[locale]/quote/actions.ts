"use server";

import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import { createAnonClient } from "@/lib/supabase";
import { sendQuoteToAirtable, type QuoteRecord } from "@/lib/airtable";
import { routing, type Locale } from "@/i18n/routing";

export type QuoteState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors, keyed by input name. */
  fieldErrors?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitQuote(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  const raw = (key: string) => (formData.get(key) as string | null)?.trim() ?? "";

  const submitted = raw("locale");
  const locale: Locale = routing.locales.includes(submitted as Locale)
    ? (submitted as Locale)
    : routing.defaultLocale;

  const t = await getTranslations({ locale, namespace: "quote" });

  const company = raw("company");
  const name = raw("name");
  const email = raw("email");

  const fieldErrors: Record<string, string> = {};
  if (!company) fieldErrors.company = t("errorRequired");
  if (!name) fieldErrors.name = t("errorRequired");
  if (!email) fieldErrors.email = t("errorRequired");
  else if (!EMAIL.test(email)) fieldErrors.email = t("errorEmail");

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  const quote: QuoteRecord = {
    company,
    name,
    email,
    phone: raw("phone") || null,
    networkType: raw("networkType") || null,
    sites: raw("sites"),
    region: raw("region") || null,
    message: raw("message") || null,
    locale,
  };

  try {
    const supabase = createAnonClient();
    const { error } = await supabase.from("quote_requests").insert({
      company_name: quote.company,
      name: quote.name,
      email: quote.email,
      phone: quote.phone,
      network_type: quote.networkType,
      network_size: quote.sites,
      region: quote.region,
      notes: quote.message,
      locale: quote.locale,
    });
    if (error) throw error;
  } catch {
    // The visitor cannot act on a Postgres error string, so give them the one
    // thing they can do instead: write to us directly.
    return {
      status: "error",
      message: t("errorGeneric", {
        email: "contact@foxnetwork.io",
      }),
    };
  }

  // Only once the lead is safely in Supabase, and after the response, so the
  // visitor never waits on Airtable.
  after(() => sendQuoteToAirtable(quote));

  return { status: "success" };
}
