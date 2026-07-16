"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

type Tier = { label: string; price: string; highlight?: boolean };

type Step = {
  num: string;
  title: string;
  desc: string;
  tiers?: Tier[];
  receive: string;
  border: string;
  featured?: boolean;
};

const steps: Step[] = [
  {
    num: "1.",
    title: "Free Discovery Workshops",
    desc: "We invest in understanding your operations first — your assets, workflows, pain points, and goals. No cost, no commitment.",
    receive: "Full operational assessment and a tailored execution roadmap.",
    border: "border-[var(--p-border)]",
  },
  {
    num: "2.",
    title: "Pay per intervention service",
    desc: "No flat license fees or locked-in contracts. You only scale your platform payments proportionally based on active SLAs:",
    tiers: [
      { label: "Relaxed", price: "€150" },
      { label: "Standard", price: "€200" },
      { label: "Urgent", price: "€300", highlight: true },
      { label: "Emergency", price: "€420" },
    ],
    receive: "Full software access and guaranteed global field SLAs.",
    border: "border-blue-500/50",
    featured: true,
  },
  {
    num: "3.",
    title: "Long-Term Partnership",
    desc: "As your operations scale, we grow with you. Pricing adapts seamlessly to your asset volume, geographic footprint, and evolving business needs.",
    receive: "Dedicated enterprise success team, priority feature requests, and core code optimization.",
    border: "border-[var(--p-border)]",
  },
];

export function Engagement() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            How We Engage:{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Consulting-First Model
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--p-text-muted)]">
            A simple, risk-free structure designed to align perfectly with your scaling operations.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <motion.div key={s.num} variants={fadeInUp}
              className={`flex h-full flex-col rounded-2xl border ${s.border} p-7 ${
                s.featured ? "bg-[var(--p-surface)] ring-1 ring-blue-500/20" : "bg-[var(--p-surface-2)]"
              }`}>
              <span className="font-[family-name:var(--font-heading)] text-3xl font-bold text-violet-400">{s.num}</span>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.7] text-[var(--p-text-muted)]">{s.desc}</p>

              {s.tiers && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {s.tiers.map((t) => (
                    <div
                      key={t.label}
                      className={`rounded-lg border px-3 py-2.5 text-center ${
                        t.highlight
                          ? "border-violet-500/50 bg-violet-500/10"
                          : "border-[var(--p-border)] bg-[var(--p-surface-2)]"
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--p-text-subtle)]">
                        {t.label}
                      </div>
                      <div className={`mt-0.5 text-base font-bold ${t.highlight ? "text-violet-300" : "text-[var(--p-text)]"}`}>
                        {t.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* You receive — pinned to the bottom, aligned across cards */}
              <div className="mt-auto border-t border-[var(--p-border)] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--p-text-subtle)]">
                  You receive
                </p>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--p-text-muted)]">{s.receive}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
