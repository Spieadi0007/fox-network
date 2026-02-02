"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function Cover() {
  return (
    <section className="relative flex min-h-full items-center overflow-hidden">
      {/* Grid bg */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-fox-orange/5 blur-[120px]" />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/60 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-stone-800">
              <span className="text-[10px] font-black text-fox-orange">F</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-[-0.02em]">
              Fox<span className="text-fox-orange">Network</span>
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-10 font-[family-name:var(--font-heading)] text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.04em]"
          >
            The Operating
            <br />
            System for{" "}
            <span className="text-gradient-fox">Physical Infrastructure.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 max-w-lg text-lg leading-[1.6] text-stone-400">
            From fragmented field execution to a globally orchestrated digital grid.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 inline-flex rounded-lg border border-stone-700/60 bg-stone-900/40 px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
              Prepared for: Forward-thinking operators // 2025 Strategy
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
