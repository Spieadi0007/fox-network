"use server";

import { getTranslations } from "next-intl/server";
import { createAnonClient } from "@/lib/supabase";
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

  try {
    const supabase = createAnonClient();
    const { error } = await supabase.from("quote_requests").insert({
      company_name: company,
      name,
      email,
      phone: raw("phone") || null,
      network_type: raw("networkType") || null,
      network_size: raw("sites"),
      region: raw("region") || null,
      notes: raw("message") || null,
      locale,
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

  return { status: "success" };
}
