"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Truck, Wrench, Package, FileCheck, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: Truck,
    title: "Deployment",
    description:
      "Plan and execute field deployments end-to-end. Truck capacity planning, site surveys, permits, installation — all managed from one dashboard with full visibility.",
    stat: "100%",
    statLabel: "Job visibility",
    span: "lg:col-span-1",
    accent: "from-blue-500/10 to-sky-500/5",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description:
      "Reactive, preventive, and predictive — all in one place. Intelligent routing assigns the right technician automatically. AI validates every job before sign-off.",
    stat: "37%",
    statLabel: "Faster dispatch",
    span: "lg:col-span-1",
    accent: "from-violet-500/10 to-purple-500/5",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Package,
    title: "Supply Chain",
    description:
      "Parts inventory, demand forecasting, warehouse logistics, and technician material provisioning — from warehouse to van to site.",
    stat: "0",
    statLabel: "Stockouts",
    span: "lg:col-span-1",
    accent: "from-emerald-500/10 to-green-500/5",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: FileCheck,
    title: "Invoicing",
    description:
      "Auto-generate compliant documentation and invoices at job close. Works across deployment, maintenance, and supply chain — no more chasing paperwork across three systems.",
    stat: "5 min",
    statLabel: "To close a job",
    span: "sm:col-span-2 lg:col-span-3",
    accent: "from-amber-500/10 to-orange-500/5",
    iconBg: "bg-amber-50",
    iconColor: "text-fox-orange",
  },
];

export function Solution() {
  return (
    <section id="features" className="relative py-28 lg:py-36">
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
            The Solution
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            One platform.
            <br />
            Everything you need.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-[1.7] text-stone-500">
            Replace your fragmented tool stack with one intelligent command
            center built for running field teams at scale.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-stone-200/60 bg-white p-7 transition-all duration-300 hover:border-stone-300/80 hover:shadow-xl hover:shadow-stone-200/30",
                feature.span,
              )}
            >
              {/* Subtle gradient background */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  feature.accent,
                )}
              />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", feature.iconBg)}>
                    <feature.icon className={cn("h-5 w-5", feature.iconColor)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-stone-300 transition-all duration-300 group-hover:text-stone-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-stone-500">
                  {feature.description}
                </p>

                {/* Stat pill */}
                <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-stone-100 bg-stone-50/80 px-3.5 py-1.5">
                  <span className="text-sm font-bold tracking-tight text-stone-900">
                    {feature.stat}
                  </span>
                  <span className="text-[11px] text-stone-400">{feature.statLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
