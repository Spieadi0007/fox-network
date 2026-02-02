"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Monitor, Laptop, Smartphone } from "lucide-react";

const interfaces = [
  { icon: Monitor, title: "Client Dashboard", desc: "Global fleet health & real-time SLA monitoring", color: "text-fox-orange", border: "border-fox-orange/30" },
  { icon: Laptop, title: "Partner Portal", desc: "Task assignment & team management", color: "text-blue-400", border: "border-blue-500/30" },
  { icon: Smartphone, title: "Technician App", desc: "Guided workflows & AI validation", color: "text-violet-400", border: "border-violet-500/30" },
];

export function Interfaces() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Tailored Interfaces for Every Role
          </h2>
          <p className="mt-3 text-lg text-stone-400">
            A single source of truth for the Client, the Partner, and the Field Tech.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 grid gap-6 md:grid-cols-3">
          {interfaces.map((ui) => (
            <motion.div key={ui.title} variants={fadeInUp}
              className={`rounded-2xl border ${ui.border} bg-stone-900/60 p-8 text-center`}>
              <ui.icon className={`mx-auto h-12 w-12 ${ui.color}`} strokeWidth={1.2} />
              <h3 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-bold">{ui.title}</h3>
              <p className="mt-2 text-[14px] text-stone-400">{ui.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
