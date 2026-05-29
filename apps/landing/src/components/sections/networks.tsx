"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import {
  fadeInUp,
  staggerContainer,
  viewportConfig,
} from "@/lib/animations";
import { Package, Banknote, BatteryCharging } from "lucide-react";

const networks = [
  {
    icon: Package,
    name: "Locker networks",
    description:
      "Parcel lockers, click-and-collect points, return hubs. Doors, screens, payment terminals, power.",
  },
  {
    icon: Banknote,
    name: "ATM networks",
    description:
      "Cash dispensers, deposit machines, kiosks. Uptime, cash-jam clearing, hardware swaps.",
  },
  {
    icon: BatteryCharging,
    name: "EV charging stations",
    description:
      "AC and DC chargers, fast-charging stalls, payment readers. Faults, cables, connectivity.",
  },
];

export function Networks() {
  return (
    <section id="networks" className="relative py-24 lg:py-28">
      <Container>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="max-w-2xl"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-fox-orange">
            Built for
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            Distributed networks
            <br />
            that have to stay up.
          </h2>
          <p className="mt-5 text-base leading-[1.7] text-stone-500">
            One maintenance partner across every site. We dispatch, fix, and
            close the ticket — you keep the network alive.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {networks.map((n) => (
            <motion.div
              key={n.name}
              variants={fadeInUp}
              className="group relative rounded-2xl border border-stone-200/60 bg-white p-7 transition-all duration-300 hover:border-stone-300/80 hover:shadow-lg hover:shadow-stone-200/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fox-orange/10">
                <n.icon className="h-5 w-5 text-fox-orange" />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-stone-900">
                {n.name}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-stone-500">
                {n.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
