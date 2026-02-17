"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Radio, Zap, Globe } from "lucide-react";

const effects = [
  { icon: Radio, title: "Cross-Skilling", desc: "An ATM technician can be certified to repair smart lockers." },
  { icon: Zap, title: "Elastic Capacity", desc: "Scale up for a rollout, scale down for maintenance." },
  { icon: Globe, title: "One API, Global Reach", desc: "Connect once, access partners across multiple regions." },
];

const verticals = ["Telecom", "EV Charging", "Retail", "Industrial IoT"];

export function GlobalGrid() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            The Global Infrastructure Grid.
          </h2>
          <p className="mt-3 text-lg text-[var(--p-text-muted)]">
            One API, infinite scale. A shared marketplace for elastic capacity.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Verticals ring */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="flex flex-col items-center justify-center rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface)] p-10">
            <div className="grid grid-cols-2 gap-4">
              {verticals.map((v) => (
                <div key={v} className="flex h-20 w-28 items-center justify-center rounded-xl border border-[var(--p-border-2)] bg-[var(--p-surface-2)] text-center">
                  <span className="text-sm font-semibold text-[var(--p-text-medium)]">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-full border-2 border-blue-500/30 bg-blue-500/5 px-6 py-3 text-center">
              <p className="text-xs font-semibold text-blue-400">Shared Resource Pool</p>
              <p className="text-[11px] text-[var(--p-text-subtle)]">Cross-skilled workforce, elastic deployment</p>
            </div>
          </motion.div>

          {/* Network effects */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="space-y-5">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">The Network Effect:</h3>
            {effects.map((e) => (
              <motion.div key={e.title} variants={fadeInUp}
                className="rounded-xl border border-[var(--p-border)] bg-[var(--p-surface)] p-5">
                <div className="flex items-center gap-3">
                  <e.icon className="h-5 w-5 shrink-0 text-fox-orange" />
                  <h4 className="text-[15px] font-bold">{e.title}</h4>
                </div>
                <p className="mt-2 text-[13px] leading-[1.7] text-[var(--p-text-muted)]">{e.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
