"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import {
  fadeInUp,
  drawLine,
  popIn,
  staggerContainer,
  viewportConfig,
} from "@/lib/animations";
import { Send, Radio, ScanEye, Receipt } from "lucide-react";
import { cn } from "@/lib/cn";
import { GridBackground } from "@/components/ui/grid-background";

const steps = [
  {
    icon: Send,
    title: "Create Work Order",
    description: "Define the scope, requirements, and SLA — all from one screen.",
    detail: "Takes ~2 minutes",
  },
  {
    icon: Radio,
    title: "Assign & Dispatch",
    description: "Route the job to the best technician on your team automatically.",
    detail: "Instant assignment",
  },
  {
    icon: ScanEye,
    title: "AI Validation",
    description: "Photo evidence verified by computer vision before signoff.",
    detail: "Real-time verification",
  },
  {
    icon: Receipt,
    title: "Close & Invoice",
    description: "Compliance docs and invoices generated instantly at job close.",
    detail: "Zero manual entry",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-28 lg:py-36">
      <GridBackground />

      <Container className="relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-fox-orange">
            How It Works
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            Four steps. Fully automated.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-[1.7] text-stone-500">
            From job creation to invoice — every step is tracked, validated, and auditable.
          </p>
        </motion.div>

        {/* Steps — Desktop: horizontal with line, Mobile: vertical */}
        <div className="relative mt-20">
          {/* Horizontal connecting line (desktop) */}
          <motion.div
            variants={drawLine}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="absolute left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] top-[32px] hidden h-px origin-left bg-gradient-to-r from-stone-200 via-fox-orange/30 to-stone-200 lg:block"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={popIn}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Step node */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 group-hover:border-fox-orange/30 group-hover:shadow-lg group-hover:shadow-fox-orange/10">
                  <step.icon className="h-6 w-6 text-stone-400 transition-colors group-hover:text-fox-orange" />
                </div>

                {/* Step number */}
                <span className="mt-4 inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 font-mono text-[10px] font-bold text-stone-400">
                  {i + 1}
                </span>

                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[220px] text-[14px] leading-[1.6] text-stone-500">
                  {step.description}
                </p>

                {/* Detail tag */}
                <span className="mt-4 rounded-full bg-stone-50 px-3 py-1 text-[11px] font-medium text-stone-400">
                  {step.detail}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
