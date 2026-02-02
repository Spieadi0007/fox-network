"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { AlertTriangle } from "lucide-react";

const pains = [
  { title: "No Real-Time Visibility", desc: "You don\u2019t know a site is down until a customer complains. Zero proactive insight." },
  { title: "SLA Breaches", desc: "Missed deadlines due to poor routing and lack of predictive capacity." },
  { title: "Inconsistent Quality", desc: "Training varies by partner; performance is not validated with real metrics." },
  { title: "Multi-Country Fragmentation", desc: "Every new market requires rebuilding the partner network from scratch." },
];

export function PainPoints() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Operating in the Dark.
          </h2>
          <p className="mt-3 text-lg text-stone-400">
            The cost of fragmentation is measured in downtime and lost revenue.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-5 sm:grid-cols-2">
          {pains.map((p) => (
            <motion.div key={p.title} variants={fadeInUp}
              className="group rounded-2xl border border-stone-800 bg-stone-900/40 p-7 transition-all duration-300 hover:border-fox-orange/30">
              <div className="flex items-start justify-between">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold">{p.title}</h3>
                <AlertTriangle className="h-5 w-5 shrink-0 text-fox-orange/60" />
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-stone-400">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
