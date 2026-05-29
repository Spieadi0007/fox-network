"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import {
  fadeInUp,
  popIn,
  staggerContainer,
  viewportConfig,
  drawLine,
} from "@/lib/animations";
import { ClipboardList, Timer, CheckCircle2 } from "lucide-react";
import { GridBackground } from "@/components/marketing/grid-background";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us what's broken",
    description:
      "Pick the asset, describe the issue, attach a photo. Two minutes from your dashboard.",
    detail: "From the client dashboard",
  },
  {
    icon: Timer,
    title: "Pick an SLA tier",
    description:
      "Lazy, Standard, Urgent or Emergency. You see the price before you confirm.",
    detail: "Fixed price, no surprises",
  },
  {
    icon: CheckCircle2,
    title: "We dispatch and close",
    description:
      "A technician is assigned, you track them live, and the ticket closes with photo proof.",
    detail: "Updates straight to your dashboard",
  },
];

export function BookingFlow() {
  return (
    <section
      id="how-to-book"
      className="relative overflow-hidden py-24 lg:py-32"
    >
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
            How to book
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            From request to resolved
            <br />
            in three steps.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-[1.7] text-stone-500">
            Bookings happen inside your client dashboard. Every intervention is
            logged, priced, and tracked end-to-end.
          </p>
        </motion.div>

        <div className="relative mt-20">
          <motion.div
            variants={drawLine}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="absolute left-[calc(16.6%+20px)] right-[calc(16.6%+20px)] top-[32px] hidden h-px origin-left bg-gradient-to-r from-stone-200 via-fox-orange/30 to-stone-200 lg:block"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={popIn}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 group-hover:border-fox-orange/30 group-hover:shadow-lg group-hover:shadow-fox-orange/10">
                  <step.icon className="h-6 w-6 text-stone-400 transition-colors group-hover:text-fox-orange" />
                </div>

                <span className="mt-4 inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 font-mono text-[10px] font-bold text-stone-400">
                  {i + 1}
                </span>

                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[260px] text-[14px] leading-[1.6] text-stone-500">
                  {step.description}
                </p>

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
