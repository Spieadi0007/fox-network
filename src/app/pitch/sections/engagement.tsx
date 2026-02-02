"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

const steps = [
  {
    num: "1.",
    title: "Two Free Discovery Sessions",
    desc: "We start with two 1.5hr complimentary workshops to understand your business assets, pain points, and goals. No commitment required.",
    output: "Output: Macro-process analysis and high-level execution plan.",
    border: "border-fox-orange/40",
  },
  {
    num: "2.",
    title: "Milestone-Based Implementation",
    desc: "Based on discovery, we propose a tailored plan. You only pay as we deliver value.",
    output: "",
    border: "border-blue-500/30",
  },
  {
    num: "3.",
    title: "Ongoing Partnership",
    desc: "After the first milestone, we discuss long-term pricing based on scale and needs.",
    output: "",
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
          <p className="mt-3 text-lg text-stone-400">A simple, risk-free way to get started.</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <motion.div key={s.num} variants={fadeInUp}
              className={`rounded-2xl border ${s.border} bg-stone-900/60 p-7`}>
              <span className="font-[family-name:var(--font-heading)] text-3xl font-bold text-fox-orange">{s.num}</span>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.7] text-stone-400">{s.desc}</p>
              {s.output && <p className="mt-4 text-[13px] font-medium text-stone-500">{s.output}</p>}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
