"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ScanEye, ShieldAlert, BookOpen } from "lucide-react";

const features = [
  { icon: ScanEye, title: "Visual QA", desc: "AI detects damage, verifies installation steps, and ensures brand compliance." },
  { icon: ShieldAlert, title: "Fraud Detection", desc: "Flags reused images, inconsistent timestamps, or location mismatches." },
  { icon: BookOpen, title: "Contextual SOPs", desc: "Real-time guidance tailored to the technician\u2019s specific situation." },
];

export function AIValidation() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          AI-Powered Automation & Validation.
        </motion.h2>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}
              className="rounded-2xl border border-stone-800 bg-stone-900/40 p-7">
              <f.icon className="h-8 w-8 text-fox-orange" strokeWidth={1.5} />
              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-stone-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="mt-10">
          <div className="rounded-xl border border-fox-orange/30 bg-fox-orange/5 px-8 py-5">
            <p className="text-[15px] font-semibold text-stone-200">
              Impact: <span className="text-fox-orange">Removes 80-90%</span> of manual operational validation work.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
