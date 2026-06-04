"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import {
  fadeInUp,
  staggerContainer,
  viewportConfig,
} from "@/lib/animations";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const tiers = [
  { name: "Relaxed", price: 150, response: "Within 5 business days", accent: false },
  { name: "Standard", price: 200, response: "Within 72 hours", accent: false },
  { name: "Urgent", price: 300, response: "Within 24 hours", accent: true },
  { name: "Emergency", price: 420, response: "Within 4 hours, 24/7", accent: false },
];

// Same for every tier — only the response time and price change.
const INCLUDED = [
  "Dedicated maintenance manager",
  "Live dashboard tracking",
  "Photo evidence on close",
  "Parts included",
];

export function SlaPricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-50/80 to-transparent" />
      <Container className="relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="max-w-2xl"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-fox-orange">
            SLA & Pricing
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            One price per intervention.
            <br />
            You pick the response time.
          </h2>
          <p className="mt-5 text-base leading-[1.7] text-stone-500">
            One flat price per intervention.* Pick the SLA that matches the
            urgency — we hit it or we eat the cost.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeInUp}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/30",
                tier.accent
                  ? "border-fox-orange/40 shadow-lg shadow-fox-orange/10"
                  : "border-stone-200/60 hover:border-stone-300/80",
              )}
            >
              {tier.accent && (
                <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-fox-orange px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Most picked
                </span>
              )}

              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-stone-900">
                  {tier.name}
                </h3>
                <span className="font-mono text-[11px] text-stone-400">
                  {tier.response}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-stone-900">
                  €{tier.price}
                </span>
                <span className="text-xs text-stone-400">/ intervention</span>
              </div>

              <a
                href="/client/signup"
                className={cn(
                  "mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all",
                  tier.accent
                    ? "bg-fox-orange text-white shadow-sm shadow-fox-orange/20 hover:brightness-110"
                    : "border border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
                )}
              >
                Book {tier.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Same for every tier — only response time and price change */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
            Every tier includes
          </span>
          {INCLUDED.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 text-sm text-stone-600"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-fox-orange" />
              {f}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-stone-400">
          *Travel time not included — billed at ~€1/km. Prices excl. VAT.
          Volume contracts available — talk to us about your fleet.
        </p>
      </Container>
    </section>
  );
}
