"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Package, Banknote, BatteryCharging } from "lucide-react";
import { Container } from "@/components/container";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

// The asset classes are a fixed set, and the icon for each belongs in code
// while its name and description belong in the message catalog.
const ITEMS = [
  { id: "lockers", Icon: Package },
  { id: "atms", Icon: Banknote },
  { id: "ev", Icon: BatteryCharging },
] as const;

export function Networks() {
  const t = useTranslations("networks");

  return (
    <section id="networks" className="relative py-24 lg:py-28">
      <Container>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="max-w-2xl"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="mt-5 text-base leading-[1.7] text-stone-500">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ITEMS.map(({ id, Icon }) => (
            <motion.div
              key={id}
              variants={fadeInUp}
              className="group relative rounded-2xl border border-stone-200/60 bg-white p-7 transition-all duration-300 hover:border-stone-300/80 hover:shadow-lg hover:shadow-stone-200/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                {t(`items.${id}.name`)}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-stone-500">
                {t(`items.${id}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
