"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

const pillars = [
  {
    title: "Experience",
    subtitle: "Strategy",
    desc: "Knowledge & Learnings & Strategy",
    points: ["Workshops", "Process improvements", "Custom workflows", "Multi-country strategy"],
    border: "border-fox-orange/40",
    accent: "text-fox-orange",
    dot: "bg-fox-orange",
    bg: "from-fox-orange/5",
  },
  {
    title: "Execution",
    subtitle: "The Platform",
    desc: "Tools, trainings, Operations execution",
    points: ["Structured data capture", "Performance analytics", "Predictive insights"],
    border: "border-blue-500/30",
    accent: "text-blue-400",
    dot: "bg-blue-400",
    bg: "from-blue-500/5",
  },
  {
    title: "Data",
    subtitle: "Continuous Improvement",
    desc: "Curated data for next cycle of experience",
    points: ["Predictive maintenance", "Quality scoring", "On-demand capacity"],
    border: "border-violet-500/30",
    accent: "text-violet-400",
    dot: "bg-violet-400",
    bg: "from-violet-500/5",
  },
];

export function Consulting() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            End-to-End Field Operations Consulting.
          </h2>
          <p className="mt-3 text-lg text-stone-400">
            Transformation, not just transaction. We implement, connect, and scale with you.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <motion.div key={p.title} variants={fadeInUp}
              className={`relative overflow-hidden rounded-2xl border ${p.border} bg-stone-900/60 p-7`}>
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${p.bg} to-transparent`} />
              <div className="relative">
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">{p.title}</h3>
                <span className={`text-sm font-medium ${p.accent}`}>({p.subtitle})</span>
                <p className="mt-2 text-[13px] text-stone-400">{p.desc}</p>
                <ul className="mt-5 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.dot}`} />
                      <span className="text-[13px] text-stone-300">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="mt-10">
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 px-8 py-5 text-center">
            <p className="text-[15px] font-medium text-stone-300">
              We don&apos;t just advise. We provide the{" "}
              <span className="text-fox-orange">Strategy</span>, the{" "}
              <span className="text-blue-400">Tools</span>, and the{" "}
              <span className="text-violet-400">Network</span> to execute it.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
