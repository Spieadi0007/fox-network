"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import { usePitchColors } from "@/app/pitch/pitch-theme";

export function PitchCTA() {
  const c = usePitchColors();
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(${c.gridLineBold} 1px, transparent 1px), linear-gradient(90deg, ${c.gridLineBold} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fox-orange/5 blur-[120px]" />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="relative flex flex-col items-center text-center">
          <motion.h2 variants={fadeInUp}
            className="font-[family-name:var(--font-heading)] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Let&apos;s Architect
            <br />
            Your Operations.
          </motion.h2>

          <motion.a variants={fadeInUp} href="mailto:contact@foxnetwork.io"
            className="shimmer-btn mt-12 inline-flex items-center gap-2 rounded-xl bg-fox-orange px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-fox-orange/25 transition-all hover:shadow-fox-orange/40 hover:brightness-110">
            Book the Free Discovery Session
            <ArrowRight className="h-5 w-5" />
          </motion.a>

          <motion.p variants={fadeInUp} className="mt-6 text-[15px] text-[var(--p-text-subtle)]">
            No commitment. Just a blueprint for your future.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-16 flex flex-wrap items-center justify-center gap-6">
            <span className="font-mono text-xs lowercase tracking-widest text-[var(--p-text-faint)]">foxnetwork.io</span>
            <span className="text-[var(--p-text-ghost)]">|</span>
            <span className="font-mono text-xs lowercase tracking-widest text-[var(--p-text-faint)]">contact@foxnetwork.io</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
