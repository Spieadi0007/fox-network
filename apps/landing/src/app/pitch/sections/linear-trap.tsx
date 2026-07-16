"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { Users, TrendingDown, UserCheck } from "lucide-react";
import { usePitchColors } from "@/app/pitch/pitch-theme";

export function LinearTrap() {
  const chartRef = useRef(null);
  const inView = useInView(chartRef, { once: true, margin: "-80px" });
  const c = usePitchColors();

  return (
    <section className="relative flex min-h-full items-center py-4 lg:py-6">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          Traditional Ops vs.{" "}
          <span className="text-blue-400">FoxNetwork</span>
        </motion.h2>

        <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-2 max-w-2xl text-sm leading-[1.6] text-[var(--p-text-subtle)]">
          As you add more assets, the traditional model forces you to add more people. FoxNetwork breaks the curve.
        </motion.p>

        {/* ── Full-width chart ── */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-4 rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4 lg:p-6" ref={chartRef}>
          <svg viewBox="0 0 700 380" className="w-full max-h-[320px]">
            <defs>
              {/* Gradient fill for the gap area */}
              <linearGradient id="gap-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(239,68,68,0.12)" />
                <stop offset="100%" stopColor="rgba(239,68,68,0.02)" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={`hgrid-${i}`} x1="80" y1={70 + i * 60} x2="660" y2={70 + i * 60}
                stroke={c.gridLine} strokeWidth="1" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line key={`vgrid-${i}`} x1={210 + i * 150} y1="50" x2={210 + i * 150} y2="320"
                stroke={c.gridLine} strokeWidth="1" />
            ))}

            {/* Axes */}
            <line x1="80" y1="320" x2="660" y2="320" stroke={c.stroke} strokeWidth="1.5" />
            <line x1="80" y1="50" x2="80" y2="320" stroke={c.stroke} strokeWidth="1.5" />

            {/* Y-axis label */}
            <text x="28" y="190" fill={c.textDimmer} fontSize="13" textAnchor="middle" transform="rotate(-90,28,190)" fontFamily="var(--font-body)">
              Operational Cost / Complexity
            </text>

            {/* X-axis label */}
            <text x="370" y="360" fill={c.textDimmer} fontSize="13" textAnchor="middle" fontFamily="var(--font-body)">
              Asset Scale
            </text>

            {/* X-axis scale markers */}
            {[
              { x: 130, label: "1K" },
              { x: 280, label: "10K" },
              { x: 430, label: "50K" },
              { x: 580, label: "100K" },
            ].map((m, i) => (
              <g key={`xmark-${i}`}>
                <line x1={m.x} y1="320" x2={m.x} y2="326" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <text x={m.x} y="340" fill={c.textDimmer} fontSize="12" textAnchor="middle" fontFamily="var(--font-mono), monospace">
                  {m.label}
                </text>
              </g>
            ))}

            {/* ── Gap area between curves (shaded red) ── */}
            <motion.path
              d="M100 305 Q250 298 370 240 Q480 170 630 65 L630 285 Q480 290 370 293 Q250 298 100 302 Z"
              fill="url(#gap-fill)"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 2, duration: 1 }}
            />

            {/* ── Traditional Model — exponential red curve ── */}
            <motion.path
              d="M100 305 Q250 295 370 240 Q480 170 630 65"
              fill="none" stroke="#ef4444" strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5 }}
            />

            {/* Red curve label */}
            <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
              <text x="630" y="55" fill="#ef4444" fontSize="14" fontWeight="700" textAnchor="end" fontFamily="var(--font-body)">
                Traditional Model
              </text>
            </motion.g>

            {/* Pain point labels along red curve */}
            {[
              { x: 180, y: 285, label: "Manual Processes", sub: "Excel / WhatsApp" },
              { x: 340, y: 225, label: "Fragmented 3PLs", sub: "No unified view" },
              { x: 500, y: 135, label: "Blind Validation", sub: "Can't verify work" },
            ].map((item, i) => (
              <motion.g key={i} initial={{ opacity: 0, y: 5 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.4 + i * 0.3 }}>
                {/* Dot on curve */}
                <circle cx={item.x} cy={item.y} r="5" fill="#ef4444" opacity="0.8" />
                <circle cx={item.x} cy={item.y} r="8" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="1" />
                {/* Label */}
                <text x={item.x} y={item.y - 20} fill={c.textMuted} fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="var(--font-body)">
                  {item.label}
                </text>
                <text x={item.x} y={item.y - 8} fill={c.textDimmer} fontSize="10" textAnchor="middle" fontFamily="var(--font-body)">
                  {item.sub}
                </text>
              </motion.g>
            ))}

            {/* ── FoxNetwork — flat blue line ── */}
            <motion.path
              d="M100 302 Q250 298 370 293 Q480 290 630 285"
              fill="none" stroke="#3B82F6" strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.8 }}
            />

            {/* Blue line label */}
            <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
              <text x="630" y="278" fill="#3B82F6" fontSize="14" fontWeight="700" textAnchor="end" fontFamily="var(--font-body)">
                FoxNetwork
              </text>
            </motion.g>

            {/* FoxNetwork advantage label */}
            <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2.2 }}>
              <rect x="300" y="296" width="180" height="22" rx="11" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
              <text x="390" y="311" fill="rgba(59,130,246,0.8)" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="var(--font-body)">
                Automated Orchestration
              </text>
            </motion.g>
          </svg>
        </motion.div>

        {/* ── Three key callouts below the chart ── */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Users,
              stat: "5-10x",
              label: "more headcount needed",
              desc: "The traditional model requires linear hiring as you scale. Double assets = double staff.",
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
            },
            {
              icon: TrendingDown,
              stat: "Near-flat",
              label: "cost curve with Fox",
              desc: "Automated dispatch, AI validation, and unified data mean you scale assets without scaling headcount.",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              icon: UserCheck,
              stat: "Up to 60%",
              label: "lower Ops cost",
              desc: "One shared pool of certified technicians serves many asset types across different clients — high utilization, lower cost per intervention.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              className={`rounded-2xl border ${card.border} bg-[var(--p-surface)] p-4`}
            >
              <div className="flex items-center gap-3">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div>
                  <span className={`font-[family-name:var(--font-heading)] text-2xl font-bold ${card.color}`}>
                    {card.stat}
                  </span>
                  <span className="ml-1.5 text-xs text-[var(--p-text-muted)]">{card.label}</span>
                </div>
              </div>
              <p className="mt-2 text-[13px] leading-[1.6] text-[var(--p-text-subtle)]">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
