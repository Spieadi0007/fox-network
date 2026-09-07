"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/container";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { site } from "@/lib/site";

/**
 * Who turns up.
 *
 * Buying physical maintenance means letting a stranger open your hardware, so
 * the question a prospect actually has is who that is. Answering it in one
 * name does more here than another feature card would.
 */
export function Founder() {
  const t = useTranslations("founder");

  return (
    <section id="who-turns-up" className="relative py-20 lg:py-24">
      <Container>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="rounded-[2rem] border border-stone-200/70 bg-white p-8 shadow-sm sm:p-10 lg:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
                {t("eyebrow")}
              </span>
              <h2 className="mt-4 max-w-xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.15] tracking-[-0.03em] text-stone-900">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-stone-500">
                {t("body")}
              </p>
            </div>

            {/* The card is the point of the section, so it gets the border and
                the fill while the copy beside it stays plain. */}
            <div className="w-full shrink-0 rounded-2xl border border-stone-200/80 bg-stone-50 p-7 lg:w-80">
              <p className="font-[family-name:var(--font-heading)] text-[19px] font-bold tracking-[-0.02em] text-stone-900">
                {t("name")}
              </p>
              <p className="mt-1.5 text-[14px] text-stone-600">{t("role")}</p>
              <p className="mt-4 border-t border-stone-200 pt-4 font-mono text-[12px] leading-relaxed text-stone-500">
                {t("credential")}
              </p>
              <a
                href={`mailto:${site.contactEmail}`}
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:brightness-90"
              >
                {t("contact")}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
