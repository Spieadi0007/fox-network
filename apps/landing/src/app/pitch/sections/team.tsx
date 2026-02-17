"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

const members = [
  {
    name: "Aditya Channe",
    role: "Chief Product Officer",
    points: ["Product & tech leader", "Infrastructure operations expertise", "Platform architecture"],
  },
  {
    name: "Karim Adaimi",
    role: "Chief Operating Officer",
    points: ["Operations scaling expert", "Multi-country deployments", "Partner network development"],
  },
];

export function Team() {
  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Built by Operators, For Operators.
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-14 mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {members.map((m) => (
            <motion.div key={m.name} variants={fadeInUp}
              className="rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface-2)] overflow-hidden">
              {/* Avatar placeholder */}
              <div className="flex h-40 items-center justify-center bg-fox-orange">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--p-surface-2)]">
                  <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--p-text-medium)]">
                    {m.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">{m.name}</h3>
                <p className="text-sm text-[var(--p-text-muted)]">{m.role}</p>
                <ul className="mt-4 space-y-2">
                  {m.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fox-orange" />
                      <span className="text-[13px] text-[var(--p-text-medium)]">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="mt-10 text-center">
          <p className="text-[15px] font-medium text-[var(--p-text-muted)]">
            A team that has built and scaled field operations firsthand. We have lived your pain.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
