"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Truck, Wrench, Package } from "lucide-react";

const modules = [
  { num: "1", icon: Truck, title: "Deployment", items: ["Truck capacity", "Site surveys", "Installation"] },
  { num: "2", icon: Wrench, title: "Maintenance", items: ["Auto-routing", "Preventive/Corrective flows"] },
  { num: "3", icon: Package, title: "Supply Chain", items: ["Parts inventory", "Warehouse management"] },
];

const coreItems = ["Invoicing (Billing/Payments)", "Routing (Skill matching/Traffic)", "Automatic Validation (Photo checks)"];

export function Orchestration() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          The Orchestration Layer.
        </motion.h2>

        {/* Top 3 modules */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-5 sm:grid-cols-3">
          {modules.map((m) => (
            <motion.div key={m.title} variants={fadeInUp}
              className="rounded-2xl border border-fox-orange/30 bg-stone-900/60 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fox-orange font-[family-name:var(--font-heading)] text-sm font-bold text-white">{m.num}</span>
                <m.icon className="h-5 w-5 text-stone-400" />
                <h3 className="text-lg font-bold">{m.title}</h3>
              </div>
              <ul className="mt-4 space-y-1.5">
                {m.items.map((it) => (
                  <li key={it} className="text-[13px] text-stone-400">{it}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Arrow down */}
        <div className="flex justify-center py-6">
          <div className="flex flex-col items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="h-2 w-px bg-fox-orange/40"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }} />
            ))}
            <motion.div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-fox-orange/40"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
          </div>
        </div>

        {/* Core orchestration */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mx-auto max-w-lg rounded-2xl border-2 border-fox-orange/40 bg-stone-900/60 p-8 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Orchestration Layer</h3>
          <ul className="mt-5 space-y-3">
            {coreItems.map((it) => (
              <li key={it} className="text-[14px] text-stone-400">{it}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
