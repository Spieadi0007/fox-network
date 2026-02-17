"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

const stats = [
  { value: "60-90%", desc: "Reduction in manual data validation and entry." },
  { value: "20-40%", desc: "Faster deployment cycles via automated routing." },
  { value: "0", desc: "Linear headcount growth. Scale assets without adding planners." },
  { value: "1", desc: "Platform for all markets. No need to rebuild operations for new countries." },
];

export function ValueEquation() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          The Value Equation.
        </motion.h2>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-5 sm:grid-cols-2">
          {stats.map((s) => (
            <motion.div key={s.value} variants={fadeInUp}
              className="rounded-2xl border border-fox-orange/30 bg-[var(--p-surface-2)] p-8">
              <span className="font-[family-name:var(--font-heading)] text-4xl font-bold text-fox-orange sm:text-5xl">{s.value}</span>
              <p className="mt-3 text-[15px] leading-[1.7] text-[var(--p-text-muted)]">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="mt-10">
          <div className="rounded-xl bg-fox-orange px-8 py-5 text-center">
            <p className="text-[15px] font-bold text-white">
              We turn field operations from a bottleneck into a competitive advantage.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
