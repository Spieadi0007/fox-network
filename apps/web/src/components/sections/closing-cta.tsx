"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/container";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export function ClosingCta() {
  const t = useTranslations("cta");

  return (
    <section id="cta" className="py-24 lg:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 px-8 py-20 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-deep/10 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0" />

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-stone-400">
              {t("body")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href={site.clientSignUp}
                className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:brightness-110"
              >
                {t("primary")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {t("secondary")}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
