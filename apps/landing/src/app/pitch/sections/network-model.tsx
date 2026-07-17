"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Cpu } from "lucide-react";

const demand = [
  "EV Charging Networks",
  "Smart Locker Hubs",
  "ATMs & Terminals",
  "Micro-Mobility Parks",
  "Telecom Hubs",
  "Industrial IoT Lines",
];

const supply = [
  { label: "Internal FoxNetwork team", highlight: true },
  { label: "Client Field Staff", highlight: false },
  { label: "Rhenus Logistics", highlight: false },
  { label: "Cennox Technical", highlight: false },
  { label: "Local Verified Techs", highlight: false },
  { label: "W.W. Grainger Supply", highlight: false },
];

export function NetworkModel() {
  return (
    <section className="relative flex min-h-full items-center py-8 lg:py-12">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        {/* Title */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
            The Model
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            On-Demand Maintenance Orchestration Platform
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-[1.6] text-[var(--p-text-subtle)]">
            An &ldquo;Uber model&rdquo; for physical infrastructure — a secure,
            two-sided network matching global demand with immediate local supply.
          </p>
        </motion.div>

        {/* Two-sided marketplace */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-10 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-2"
        >
          {/* DEMAND */}
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-blue-500/20 bg-[var(--p-surface)] p-5"
          >
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold">
              <span className="text-blue-400">Demand:</span> Hardware Networks
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {demand.map((d) => (
                <div
                  key={d}
                  className="flex items-center gap-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-2)] px-3 py-2"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span className="text-[13px] leading-snug text-[var(--p-text-muted)]">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FOX OS core */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center py-2 lg:flex-col"
          >
            <div className="hidden h-px w-10 bg-gradient-to-r from-transparent to-blue-500/40 lg:block" />
            <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-violet-500/30">
              <Cpu className="h-5 w-5 text-white" />
              <span className="mt-0.5 text-[10px] font-bold tracking-wide text-white">FOX OS</span>
              <span className="absolute inset-0 animate-ping rounded-full border border-violet-400/40" style={{ animationDuration: "2.5s" }} />
            </div>
            <div className="hidden h-px w-10 bg-gradient-to-r from-violet-500/40 to-transparent lg:block" />
          </motion.div>

          {/* SUPPLY */}
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-violet-500/20 bg-[var(--p-surface)] p-5"
          >
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold">
              <span className="text-violet-400">Supply:</span> Trusted Partners &amp; Technicians
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {supply.map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                    s.highlight
                      ? "border-violet-500/40 bg-violet-500/10"
                      : "border-[var(--p-border)] bg-[var(--p-surface-2)]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  <span
                    className={`text-[13px] leading-snug ${
                      s.highlight ? "font-semibold text-[var(--p-text)]" : "text-[var(--p-text-muted)]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Flywheel banner */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-5 py-3 text-center"
        >
          <span className="text-sm font-medium text-blue-400">
            Network Flywheel: Higher density of assets → higher intervention
            density → lower unit cost per action.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
