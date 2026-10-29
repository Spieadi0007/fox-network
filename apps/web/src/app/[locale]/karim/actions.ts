"use server";

import { getTranslations } from "next-intl/server";
import { sendContactToAirtable } from "@/lib/airtable";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/lib/site";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors, keyed by input name. */
  fieldErrors?: Record<string, string>;
  /** What was typed, so a failed submit doesn't make someone retype it. */
  values?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Leave your details" on Karim's Web Summit page.
 *
 * Airtable is the only place this lands — unlike the quote form there is no
 * Supabase row behind it — so the visitor waits for the write and is told if
 * it failed, rather than walking away believing we have their details.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = (key: string) => (formData.get(key) as string | null)?.trim() ?? "";

  const submitted = raw("locale");
  const locale: Locale = routing.locales.includes(submitted as Locale)
    ? (submitted as Locale)
    : routing.defaultLocale;

  const t = await getTranslations({ locale, namespace: "karim" });

  const name = raw("name");
  const email = raw("email");
  const values = Object.fromEntries(
    ["name", "email", "phone", "website", "message"].map((k) => [k, raw(k)]),
  );

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = t("errorRequired");
  if (!email) fieldErrors.email = t("errorRequired");
  else if (!EMAIL.test(email)) fieldErrors.email = t("errorEmail");

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  const sent = await sendContactToAirtable({
    name,
    email,
    phone: raw("phone") || null,
    website: raw("website") || null,
    message: raw("message") || null,
    locale,
  });

  if (!sent) {
    return {
      status: "error",
      message: t("errorGeneric", { email: site.contactEmail }),
      values,
    };
  }

  return { status: "success" };
}
