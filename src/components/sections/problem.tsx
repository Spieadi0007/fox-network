"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
  viewportConfig,
} from "@/lib/animations";
import { GridBackground } from "@/components/ui/grid-background";

const painPoints = [
  {
    number: "01",
    title: "Manual Everything",
    description:
      "Your dispatch process is phone calls, spreadsheets, and prayer. Every job is a fire drill because nobody has real-time visibility.",
  },
  {
    number: "02",
    title: "Tool Sprawl",
    description:
      "Dispatch in one app. Invoicing in another. Compliance in a binder. You're paying for six tools that don't talk to each other.",
  },
  {
    number: "03",
    title: "Zero Leverage",
    description:
      "Scaling means hiring more coordinators, not getting more efficient. Your margin shrinks with every new job.",
  },
];

const stats = [
  { value: "40%", label: "of field time wasted on admin work", color: "text-red-500" },
  { value: "6.2", label: "average tools in a field ops stack", color: "text-fox-amber" },
  { value: "$18K", label: "monthly cost of inefficiency per team", color: "text-red-500" },
];

export function Problem() {
  return (
    <section className="relative py-28 lg:py-36">
      <GridBackground />

      <Container>
        {/* Section header — left aligned, editorial */}
        <div className="grid gap-16 lg:grid-cols-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="lg:col-span-5"
          >
            <motion.div variants={fadeInLeft}>
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-fox-orange">
                The Problem
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
                Field ops are stuck
                <br />
                in the dark ages.
              </h2>
              <p className="mt-5 text-base leading-[1.7] text-stone-500">
                Infrastructure operators waste thousands of hours on manual
                coordination while their competitors automate.
              </p>
            </motion.div>

            {/* Stat blocks */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              className="mt-10 space-y-4"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInLeft}
                  className="flex items-baseline gap-4 border-l-2 border-stone-200 py-2 pl-5"
                >
                  <span className={`text-3xl font-bold tracking-tight ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-sm text-stone-400">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Pain point cards — right side, stacked with overlap */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="space-y-4 lg:col-span-6 lg:col-start-7"
          >
            {painPoints.map((point) => (
              <motion.div
                key={point.number}
                variants={fadeInRight}
                className="group relative rounded-2xl border border-stone-200/60 bg-white p-7 transition-all duration-300 hover:border-stone-300/80 hover:shadow-lg hover:shadow-stone-200/30"
              >
                <div className="flex items-start gap-5">
                  <span className="mt-0.5 shrink-0 font-mono text-[11px] font-bold text-stone-300 group-hover:text-fox-orange transition-colors">
                    {point.number}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.65] text-stone-500">
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
