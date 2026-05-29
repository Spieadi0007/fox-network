"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import {
  fadeInUp,
  staggerContainer,
  viewportConfig,
} from "@/lib/animations";
import { LayoutDashboard, Headset, Eye } from "lucide-react";

const value = [
  {
    icon: LayoutDashboard,
    title: "Live network dashboard",
    description:
      "Every site, every intervention, every cost — in one view. Filter by network, asset type, or SLA. Export at month-end.",
  },
  {
    icon: Headset,
    title: "Dedicated maintenance manager",
    description:
      "One human you can call. They know your network, your assets, and your SLA. No ticket-routing roulette.",
  },
  {
    icon: Eye,
    title: "Transparent by default",
    description:
      "Photo proof on every close. Time-stamped status. Fixed prices before you confirm. Invoiced from the dashboard.",
  },
];

export function WhatYouGet() {
  return (
    <section id="what-you-get" className="relative py-24 lg:py-32">
      <Container>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="max-w-2xl"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-fox-orange">
            What you get
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            A tool, a manager,
            <br />
            a number you can call.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {value.map((v) => (
            <motion.div
              key={v.title}
              variants={fadeInUp}
              className="group relative rounded-2xl border border-stone-200/60 bg-white p-7 transition-all duration-300 hover:border-stone-300/80 hover:shadow-lg hover:shadow-stone-200/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fox-orange/10">
                <v.icon className="h-5 w-5 text-fox-orange" />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                {v.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-stone-500">
                {v.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
