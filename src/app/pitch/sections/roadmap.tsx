"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

const phases = [
  { weeks: "Weeks 1-3", title: "Discovery", items: ["Deep-dive workshops", "Asset & process mapping", "Data requirements", "Operations audit"], color: "bg-fox-orange", border: "border-fox-orange/40" },
  { weeks: "Weeks 4-6", title: "Build & Execute", items: ["Platform config", "Workflow setup", "Integration prep", "Pilot onboarding"], color: "bg-blue-500", border: "border-blue-500/40" },
  { weeks: "Weeks 7-8", title: "Onboard", items: ["Team training", "Partner activation", "Pilot deployments", "Feedback loops"], color: "bg-sky-500", border: "border-sky-500/40" },
  { weeks: "Weeks 9-12", title: "Scale", items: ["Full rollout", "Optimization", "Capacity expansion", "Continuous improvement"], color: "bg-violet-500", border: "border-violet-500/40" },
];

export function Roadmap() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          90-Day Transformation Roadmap
        </motion.h2>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <motion.div key={p.title} variants={fadeInUp} className={`rounded-2xl border ${p.border} bg-[var(--p-surface-2)] overflow-hidden`}>
              <div className={`${p.color} px-5 py-3`}>
                <p className="text-xs font-medium text-[var(--p-text-muted)]">{p.weeks}:</p>
                <p className="text-lg font-bold text-[var(--p-text)]">{p.title}</p>
              </div>
              <ul className="p-5 space-y-2">
                {p.items.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--p-text-faint)]" />
                    <span className="text-[13px] text-[var(--p-text-muted)]">{it}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
