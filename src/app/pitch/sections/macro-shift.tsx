"use client";

import { motion } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, viewportConfig } from "@/lib/animations";

export function MacroShift() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          The Macro Shift:{" "}
          <span className="text-stone-400">Digital World, Physical Assets.</span>
        </motion.h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <motion.div variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <h3 className="text-xl font-semibold text-stone-300">The Future Hardware</h3>
            <p className="mt-4 leading-[1.7] text-stone-500">
              Industries are deploying distributed physical networks at unprecedented scale — EV chargers, telecom 5G towers, smart lockers, industrial IoT sensors. The hardware is getting smarter. The operations are not.
            </p>
          </motion.div>

          <motion.div variants={fadeInRight} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <h3 className="text-xl font-semibold text-stone-300">The Operational Reality</h3>
            <p className="mt-4 leading-[1.7] text-stone-500">
              Every device needs installation, maintenance, repair, and decommissioning. That means trucks, technicians, parts, schedules, compliance — coordinated across cities and countries.
            </p>
          </motion.div>
        </div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-16 rounded-2xl border border-stone-800 bg-stone-900/40 p-8 lg:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-fox-orange">Key Insight</p>
              <p className="mt-2 text-[15px] leading-[1.7] text-stone-400">
                As industries transition to distributed networks — EV charging, telecom 5G, smart lockers, and industrial IoT — the bottleneck is no longer the hardware. It is the operation.
              </p>
            </div>
            <div className="flex flex-col items-start justify-center">
              <span className="font-[family-name:var(--font-heading)] text-5xl font-bold text-fox-orange sm:text-6xl">$8 Billion</span>
              <p className="mt-2 text-sm font-medium text-stone-400">Total Global Serviceable Field Operations Market</p>
              <p className="mt-1 text-xs text-stone-600">EV Charging | Telecom Infrastructure | Industrial IoT | Smart Cities</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
