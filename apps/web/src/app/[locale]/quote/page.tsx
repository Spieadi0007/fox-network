import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { QuoteForm } from "./quote-form";
import { alternates } from "@/lib/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.quote" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/quote", locale),
  };
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { intent } = await searchParams;

  return (
    <>
      <main className="relative min-h-screen overflow-hidden pb-24 pt-12">
        <div className="mesh-gradient pointer-events-none absolute inset-0" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />

        <Container className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            FoxNetwork
          </Link>

          <div className="mx-auto mt-10 max-w-2xl">
            <QuoteForm waitlist={intent === "waitlist"} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
