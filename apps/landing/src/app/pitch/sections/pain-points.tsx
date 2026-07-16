"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { DollarSign, Wrench, BarChart3, Clock, Globe, Users } from "lucide-react";

const pains = [
  {
    icon: DollarSign,
    title: "High Cost of Field Operations",
    desc: "Density of hardware is low, which leads to a low intervention rate per technician and high cost per intervention.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    num: "01",
  },
  {
    icon: Wrench,
    title: "Manual, Non-Automated Operations",
    desc: "Reliance on WhatsApp, Excel, and phone calls to run daily operations.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    num: "02",
  },
  {
    icon: BarChart3,
    title: "No Data Feedback Loop",
    desc: "Blind validation with no actionable insights to improve products or processes.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    num: "03",
  },
  {
    icon: Clock,
    title: "SLA Breaches & Excessive Downtime",
    desc: "Missed deadlines and prolonged asset downtime impacting customer experience.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    num: "04",
  },
  {
    icon: Globe,
    title: "Multi-Country / Multi-Partner Fragmentation",
    desc: "Each new market requires rebuilding operations from scratch, with unique dependencies and tailored business rules.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    num: "05",
  },
  {
    icon: Users,
    title: "Inconsistent Quality Across Partners",
    desc: "Dozens of 3PLs with different processes. No certification standards, no real metrics — resulting in rework and reputation damage.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    num: "06",
  },
];

export function PainPoints() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <span className="inline-block rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-400">The Problem</span>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Operating in the Dark.
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-[var(--p-text-muted)]">
            The cost of fragmentation is measured in downtime, lost revenue, and compounding inefficiency.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pains.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeInUp}
              className={`group relative rounded-2xl border ${p.border} bg-[var(--p-surface)] p-6 transition-all duration-300 hover:bg-[var(--p-surface-2)]`}
            >
              {/* Number watermark */}
              <span className="pointer-events-none absolute right-5 top-4 font-[family-name:var(--font-heading)] text-[40px] font-bold leading-none text-[var(--p-text)] opacity-[0.04]">
                {p.num}
              </span>

              <div className="relative">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${p.bg}`}>
                  <p.icon className={`h-5 w-5 ${p.color}`} />
                </div>

                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-[15px] font-bold leading-snug text-[var(--p-text)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.7] text-[var(--p-text-muted)]">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
