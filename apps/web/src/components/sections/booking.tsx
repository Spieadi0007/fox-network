"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ClipboardList, Timer, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import {
  fadeInUp,
  popIn,
  staggerContainer,
  viewportConfig,
  drawLine,
} from "@/lib/animations";

// Numbered because booking genuinely is a sequence: you cannot pick an SLA
// before describing the fault, and nothing is dispatched before both.
const STEPS = [
  { id: "report", Icon: ClipboardList },
  { id: "choose", Icon: Timer },
  { id: "close", Icon: CheckCircle2 },
] as const;

export function Booking() {
  const t = useTranslations("booking");

  return (
    <section id="how-to-book" className="relative overflow-hidden py-24 lg:py-32">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <Container className="relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-[1.7] text-stone-500">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="relative mt-20">
          <motion.div
            variants={drawLine}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="absolute left-[calc(16.6%+20px)] right-[calc(16.6%+20px)] top-[32px] hidden h-px origin-left bg-gradient-to-r from-stone-200 via-brand/30 to-stone-200 lg:block"
          />

          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {STEPS.map(({ id, Icon }, i) => (
              <motion.li
                key={id}
                variants={popIn}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 group-hover:border-brand/30 group-hover:shadow-lg group-hover:shadow-brand/10">
                  <Icon className="h-6 w-6 text-stone-400 transition-colors group-hover:text-brand" />
                </div>

                <span className="mt-4 inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 font-mono text-[10px] font-bold text-stone-400">
                  {i + 1}
                </span>

                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                  {t(`steps.${id}.title`)}
                </h3>
                <p className="mt-2 max-w-[260px] text-[14px] leading-[1.6] text-stone-500">
                  {t(`steps.${id}.description`)}
                </p>

                <span className="mt-4 rounded-full bg-stone-50 px-3 py-1 text-[11px] font-medium text-stone-400">
                  {t(`steps.${id}.detail`)}
                </span>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </Container>
    </section>
  );
}
