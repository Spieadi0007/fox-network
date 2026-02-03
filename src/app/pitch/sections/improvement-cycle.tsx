"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Search, PenTool, Rocket, BarChart3, Settings } from "lucide-react";

const nodes = [
  { icon: Search, label: "Discovery\nWorkshops" },
  { icon: PenTool, label: "Solution\nDesign & Build" },
  { icon: Rocket, label: "Pilot\nLaunch" },
  { icon: BarChart3, label: "Data Analysis\n& Optimization" },
  { icon: Settings, label: "Continuous\nImprovement" },
];

export function ImprovementCycle() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            The Continuous Improvement Cycle
          </h2>
          <p className="mt-3 text-lg text-[var(--p-text-muted)]">
            Deployment is just Day 1. We optimize Day 2 through Day 10,000.
          </p>
        </motion.div>

        {/* Cycle as horizontal flow with loop arrow */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-16">

          <div className="flex flex-wrap items-center justify-center gap-4">
            {nodes.map((n, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[var(--p-border-2)] bg-[var(--p-surface-2)]">
                    <n.icon className="h-7 w-7 text-fox-orange" strokeWidth={1.5} />
                  </div>
                  <p className="mt-2 text-center text-[11px] leading-tight text-[var(--p-text-muted)] whitespace-pre-line">{n.label}</p>
                </div>
                {i < nodes.length - 1 && (
                  <div className="hidden text-[var(--p-text-faint)] sm:block">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Loop back indicator */}
          <motion.div variants={fadeInUp} className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-fox-orange/20 bg-fox-orange/5 px-5 py-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
              <span className="text-xs font-semibold text-fox-orange">Data Feedback Loop</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
