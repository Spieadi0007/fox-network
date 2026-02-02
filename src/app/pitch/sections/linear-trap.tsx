"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, viewportConfig } from "@/lib/animations";

export function LinearTrap() {
  const chartRef = useRef(null);
  const inView = useInView(chartRef, { once: true, margin: "-80px" });

  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          The Linear Trap:{" "}
          <span className="text-stone-400">Why Operations Break at Scale</span>
        </motion.h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {/* Chart */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 lg:col-span-2" ref={chartRef}>
            <svg viewBox="0 0 500 300" className="w-full">
              {/* Axes */}
              <line x1="60" y1="260" x2="480" y2="260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="60" y1="40" x2="60" y2="260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Y label */}
              <text x="20" y="150" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" transform="rotate(-90,20,150)" fontFamily="var(--font-body)">
                Operational Headcount / Complexity
              </text>
              {/* X label */}
              <text x="270" y="290" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="var(--font-body)">
                Asset Scale (1k → 10k → 100k)
              </text>

              {/* Traditional Model — exponential red curve */}
              <motion.path
                d="M80 250 Q200 240 300 180 Q380 120 460 50"
                fill="none" stroke="#ef4444" strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <text x="420" y="45" fill="#ef4444" fontSize="11" fontWeight="600" fontFamily="var(--font-body)">Traditional Model</text>

              {/* Labels on red curve */}
              {[
                { x: 140, y: 230, label: "Manual Processes\n(Excel/WhatsApp)" },
                { x: 270, y: 175, label: "Fragmented 3PLs" },
                { x: 380, y: 105, label: "Blind Validation" },
              ].map((item, i) => (
                <motion.g key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.2 + i * 0.3 }}>
                  <rect x={item.x - 50} y={item.y - 22} width="100" height="24" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  <text x={item.x} y={item.y - 7} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle" fontFamily="var(--font-body)">{item.label}</text>
                </motion.g>
              ))}

              {/* FoxNetwork — flat orange line */}
              <motion.path
                d="M80 245 Q200 240 300 235 Q400 230 460 225"
                fill="none" stroke="#e8590c" strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.8 }}
              />
              <text x="420" y="220" fill="#e8590c" fontSize="11" fontWeight="600" fontFamily="var(--font-body)">FoxNetwork</text>

              <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2 }}>
                <rect x="250" y="223" width="120" height="24" rx="12" fill="rgba(232,89,12,0.1)" stroke="rgba(232,89,12,0.2)" strokeWidth="0.5" />
                <text x="310" y="238" fill="rgba(232,89,12,0.7)" fontSize="9" textAnchor="middle" fontFamily="var(--font-body)">Automated Orchestration</text>
              </motion.g>
            </svg>
          </motion.div>

          {/* Side card */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="rounded-2xl border border-stone-800 bg-stone-900/40 p-7">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">The Core Economic Flaw:</h3>
            <p className="mt-4 text-[15px] leading-[1.75] text-stone-400">
              The traditional model relies on manual coordination. As you scale, you are forced to hire linear headcount to manage fragmented partners. This is an unsustainable economic model.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
