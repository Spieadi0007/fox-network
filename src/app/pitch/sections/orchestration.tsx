"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import { usePitchColors } from "@/app/pitch/pitch-theme";

const stages = ["Plan", "Execute", "Validate", "Bill"];

const pillars = [
  {
    label: "Deployment",
    color: "#3B82F6",
    steps: [
      "Truck capacity & automated planning",
      "Installation, site surveys, permits & works",
      "Approval & escalation management",
      "Live support",
    ],
  },
  {
    label: "Maintenance",
    color: "#8B5CF6",
    steps: [
      "Manual & automatic routing",
      "Reactive, preventive & predictive interventions",
      "Client-specific SLA tracking & KPI reporting",
      "Escalation management & live support",
    ],
  },
  {
    label: "Supply Chain",
    color: "#06B6D4",
    steps: [
      "Parts inventory & min/max stock management",
      "Demand & forecast planning",
      "Logistics, shipments & warehouse management",
      "Technician material provisioning",
    ],
  },
];

export function Orchestration() {
  const c = usePitchColors();

  return (
    <section className="relative flex min-h-full items-center py-4 lg:py-6">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        {/* Title */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">The Solution</span>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Hardware Operations at Scale.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-[var(--p-text-subtle)]">
            Every operation follows the same flow. One system handles all of it.
          </p>
        </motion.div>

        {/* ── Horizontal flow bar: PLAN → EXECUTE → VALIDATE → BILL ── */}
        <motion.div
          variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-6 flex items-center gap-1 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-1.5"
        >
          {stages.map((stage, i) => (
            <div key={stage} className="flex flex-1 items-center">
              <div className="flex-1 rounded-lg bg-blue-500/10 px-3 py-2.5 text-center">
                <span className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-wide text-blue-400 sm:text-base">
                  {stage}
                </span>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-blue-500/30" />
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Pillar grid ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-3 grid grid-cols-3 gap-3"
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.label}
              variants={fadeInUp}
              className="rounded-xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4"
            >
              {/* Pillar header */}
              <div className="mb-3 flex items-center gap-2.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: pillar.color }}
                />
                <h3 className="font-[family-name:var(--font-heading)] text-base font-bold">
                  {pillar.label}
                </h3>
              </div>

              {/* Steps */}
              <div className="space-y-1.5">
                {pillar.steps.map((step, si) => (
                  <div
                    key={si}
                    className="rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-2)] px-3 py-2"
                  >
                    <span className="text-xs text-[var(--p-text-muted)]">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Shared layer: Validate + Bill ── */}
        <motion.div
          variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-3 rounded-xl border-2 border-dashed border-blue-500/25 bg-blue-500/[0.03] p-4"
        >
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-fox-orange" />
              <h3 className="font-[family-name:var(--font-heading)] text-base font-bold">
                Shared Across All Operations
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Photo & rule-based validation",
                "Auto-invoicing per job",
                "Technician payouts",
                "Margin tracking",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-fox-orange/20 bg-fox-orange/[0.06] px-3 py-1 text-xs font-medium text-fox-orange"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
