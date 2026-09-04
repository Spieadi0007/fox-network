import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";
import { site } from "@/lib/site";

/**
 * Every link here goes somewhere real.
 *
 * The previous footer advertised AI Validation, Dispatch, Compliance, an API
 * reference and a status page — all pointing at "#", and all listed in
 * FOUNDATION.md §10.3 as not built. Shipping them as navigation is the exact
 * deck-to-reality gap that document warns against, so they are gone until
 * there is something behind them.
 */
export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200/60">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fox-logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
                Fox<span className="text-brand">Network</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-[1.7] text-stone-400">
              {t("tagline")}
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-400">
              <MapPin className="h-3.5 w-3.5" />
              {t("region")}
            </p>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold text-stone-900">
              {t("productHeading")}
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href={{ pathname: "/", hash: "#networks" }} className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("networks")}
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/", hash: "#pricing" }} className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/", hash: "#how-to-book" }} className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("booking")}
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("quote")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold text-stone-900">
              {t("companyHeading")}
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={site.clientSignIn} className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("signIn")}
                </a>
              </li>
              <li>
                <a href={site.clientSignUp} className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("signUp")}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="text-[13px] text-stone-400 transition-colors hover:text-stone-700"
                >
                  {t("contact")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold text-stone-900">
              {t("legalHeading")}
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/legal-notice" className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("legalNotice")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[13px] text-stone-400 transition-colors hover:text-stone-700">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-stone-200/60 pt-8">
          <p className="text-[12px] text-stone-400">
            © {year} FoxNetwork. {t("rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
