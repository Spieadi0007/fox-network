"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { Link } from "@/i18n/navigation";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { site } from "@/lib/site";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />

      <Container className="relative flex flex-col items-center py-24 lg:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-medium text-stone-600">
                {t("badge")}
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-8 text-balance font-[family-name:var(--font-heading)] text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-stone-900"
          >
            {t("titleLine1")}
            <br />
            <span className="text-gradient-brand">{t("titleLine2")}</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-xl text-[17px] leading-[1.6] text-stone-500"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={site.clientSignUp}
              className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-stone-900/15 transition-all hover:bg-stone-800"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-7 py-3.5 text-sm font-medium text-stone-700 shadow-sm shadow-stone-200/20 transition-all hover:border-stone-300 hover:bg-stone-50"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {[t("assurance1"), t("assurance2")].map((text) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-xs text-stone-400"
              >
                <ShieldCheck className="h-3 w-3 text-stone-300" />
                {text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
