import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { LegalDocument } from "@/components/legal/legal-document";
import { alternates } from "@/lib/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/privacy", locale),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta.privacy" });

  return (
    <LegalPage title={t("title")}>
      <LegalDocument namespace="privacy" />
    </LegalPage>
  );
}
