import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { alternates } from "@/lib/metadata";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.legalNotice" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/legal-notice", locale),
    robots: { index: false, follow: true },
  };
}

/**
 * Mentions légales.
 *
 * Publishing these is a legal obligation for a company trading online in
 * France (LCEN art. 6 III), and no such page existed before. The required
 * fields are laid out here with their values marked outstanding rather than
 * invented — a wrong RCS number is worse than a visibly empty one.
 */
export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const meta = await getTranslations({ locale, namespace: "meta.legalNotice" });
  const t = await getTranslations({ locale, namespace: "legalPages" });

  const publisher = [
    "publisherLegalForm",
    "publisherCapital",
    "publisherRegistration",
    "publisherVat",
    "publisherAddress",
    "publisherDirector",
  ] as const;

  return (
    <LegalPage title={meta("title")}>
      <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-stone-500">
        {t("legalNoticeIntro")}
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
        <h2 className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.02em] text-stone-900">
          {t("publisher")}
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(0,13rem)_1fr]">
          {publisher.map((key) => (
            <div key={key} className="contents">
              <dt className="text-[13px] font-medium text-stone-500">
                {t(key)}
              </dt>
              <dd className="border-b border-dashed border-stone-200 pb-3 font-mono text-[13px] text-stone-400 sm:border-none sm:pb-0">
                {t("pending")}
              </dd>
            </div>
          ))}
          <div className="contents">
            <dt className="text-[13px] font-medium text-stone-500">
              {t("publisherEmail")}
            </dt>
            <dd className="font-mono text-[13px]">
              <a
                href={`mailto:${site.contactEmail}`}
                className="text-brand hover:brightness-90"
              >
                {site.contactEmail}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
        <h2 className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.02em] text-stone-900">
          {t("host")}
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(0,13rem)_1fr]">
          <div className="contents">
            <dt className="text-[13px] font-medium text-stone-500">
              {t("publisher")}
            </dt>
            <dd className="font-mono text-[13px] text-stone-600">
              Vercel Inc.
            </dd>
          </div>
          <div className="contents">
            <dt className="text-[13px] font-medium text-stone-500">
              {t("hostAddress")}
            </dt>
            <dd className="font-mono text-[13px] text-stone-600">
              440 N Barranca Ave #4133, Covina, CA 91723, USA
            </dd>
          </div>
        </dl>
      </section>
    </LegalPage>
  );
}
