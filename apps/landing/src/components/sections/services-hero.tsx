"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GridBackground } from "@/components/marketing/grid-background";

export function ServicesHero() {
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />

      <Container className="relative flex flex-col items-center py-24 lg:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-stone-600">
                Maintenance-as-a-Service · Europe
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-8 font-[family-name:var(--font-heading)] text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-stone-900"
          >
            Book intervention,
            <br />
            control cost,{" "}
            <span className="text-gradient-fox">and act.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-xl text-[17px] leading-[1.6] text-stone-500"
          >
            Report what&apos;s broken in seconds, track every request&apos;s
            status in one place, and get on-demand support when needed.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="/client/signup"
              className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-stone-900/15 transition-all hover:bg-stone-800"
            >
              Book first intervention
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-7 py-3.5 text-sm font-medium text-stone-700 shadow-sm shadow-stone-200/20 transition-all hover:border-stone-300 hover:bg-stone-50"
            >
              Get a quote
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {[
              "Fixed-price SLA tiers",
              "Dedicated maintenance manager",
              "Live dashboard across every site",
            ].map((text) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-xs text-stone-400"
              >
                <ShieldCheck className="h-3 w-3 text-stone-300" />
                {text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
