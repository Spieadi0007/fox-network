"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

const steps = [
  {
    num: "1.",
    title: "Free Discovery Workshops",
    desc: "We invest in understanding your operations first — your assets, workflows, pain points, and goals. No cost, no commitment.",
    output: "You receive: Full operational assessment and a tailored execution roadmap.",
    border: "border-fox-orange/40",
  },
  {
    num: "2.",
    title: "Milestone-Based Implementation",
    desc: "We build and deploy in phases. You only pay when we deliver measurable results at each milestone.",
    output: "You receive: Working platform configured to your operations from day one.",
    border: "border-blue-500/30",
  },
  {
    num: "3.",
    title: "Long-Term Partnership",
    desc: "As your operations scale, we grow with you. Pricing adapts to your volume, regions, and evolving needs.",
    output: "You receive: Dedicated support, continuous optimization, and priority roadmap input.",
    border: "border-violet-500/30",
  },
];

export function Engagement() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            How We Engage: A Consulting-First Model
          </h2>
          <p className="mt-3 text-lg text-[var(--p-text-muted)]">A simple, risk-free way to get started.</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <motion.div key={s.num} variants={fadeInUp}
              className={`rounded-2xl border ${s.border} bg-[var(--p-surface-2)] p-7`}>
              <span className="font-[family-name:var(--font-heading)] text-3xl font-bold text-fox-orange">{s.num}</span>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.7] text-[var(--p-text-muted)]">{s.desc}</p>
              {s.output && <p className="mt-4 text-[13px] font-medium text-[var(--p-text-subtle)]">{s.output}</p>}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
