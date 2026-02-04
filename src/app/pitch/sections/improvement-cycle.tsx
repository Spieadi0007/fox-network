"use client";

import { motion } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { Search, PenTool, Rocket, BarChart3, RefreshCw } from "lucide-react";

const steps = [
  { Icon: Search, label: "Discovery", desc: "Workshops, assessment, operational mapping", color: "#3B82F6" },
  { Icon: PenTool, label: "Solution Design", desc: "Custom architecture, integrations, workflows", color: "#6366F1" },
  { Icon: Rocket, label: "Pilot & Deploy", desc: "Phased rollout, training, go-live support", color: "#F97316" },
  { Icon: BarChart3, label: "Measure", desc: "KPIs, SLA tracking, cost analysis, reporting", color: "#10B981" },
  { Icon: RefreshCw, label: "Optimize", desc: "Process improvements, scaling, new regions", color: "#8B5CF6" },
];

// 5 points on a circle (top, top-right, bottom-right, bottom-left, top-left)
const R = 160;
const CX = 220;
const CY = 195;
const angles = [-90, -18, 54, 126, 198].map((d) => (d * Math.PI) / 180);
const points = angles.map((a) => ({ x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }));

// Build curved arrow paths between consecutive points
function arcPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  // Push control point outward from center
  const dx = mx - CX;
  const dy = my - CY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const push = 30;
  const cx = mx + (dx / dist) * push;
  const cy = my + (dy / dist) * push;
  return `M${from.x} ${from.y} Q${cx} ${cy} ${to.x} ${to.y}`;
}

export function ImprovementCycle() {
  return (
    <section className="relative flex min-h-full items-center py-4 lg:py-6">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            The Continuous Improvement Cycle
          </h2>
          <p className="mt-2 text-sm text-[var(--p-text-muted)]">
            Deployment is just Day 1. We optimize Day 2 through Day 10,000.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-row items-start justify-center gap-12">

          {/* ── Cycle diagram ── */}
          <motion.div
            variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="relative h-[400px] w-[440px] shrink-0"
          >
            <svg viewBox="0 0 440 390" className="h-full w-full" fill="none">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0 0 L8 3 L0 6" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="1.2" />
                </marker>
              </defs>

              {/* Connecting arcs with arrows */}
              {points.map((from, i) => {
                const to = points[(i + 1) % 5];
                return (
                  <path
                    key={`arc-${i}`}
                    d={arcPath(from, to)}
                    stroke="rgba(99,102,241,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    markerEnd="url(#arrow)"
                  />
                );
              })}

              {/* Step nodes */}
              {points.map((pt, i) => {
                const step = steps[i];
                return (
                  <g key={i}>
                    {/* Outer ring */}
                    <circle cx={pt.x} cy={pt.y} r="32" fill="var(--p-bg, #111110)" stroke={step.color} strokeWidth="1.5" opacity="0.9" />
                    {/* Inner fill */}
                    <circle cx={pt.x} cy={pt.y} r="31" fill={`${step.color}10`} />
                    {/* Number */}
                    <text x={pt.x} y={pt.y - 6} textAnchor="middle" fill={step.color} fontSize="11" fontWeight="700" fontFamily="var(--font-mono), monospace">
                      {`0${i + 1}`}
                    </text>
                    {/* Label */}
                    <text x={pt.x} y={pt.y + 10} textAnchor="middle" fill="var(--p-text)" fontSize="10" fontWeight="600" fontFamily="var(--font-body)">
                      {step.label}
                    </text>
                  </g>
                );
              })}

              {/* Center text */}
              <text x={CX} y={CY - 10} textAnchor="middle" fill="var(--p-text)" fontSize="16" fontWeight="800" fontFamily="var(--font-heading)">
                Data-Driven
              </text>
              <text x={CX} y={CY + 12} textAnchor="middle" fill="var(--p-text)" fontSize="16" fontWeight="800" fontFamily="var(--font-heading)">
                Feedback Loop
              </text>
            </svg>
          </motion.div>

          {/* ── Step details ── */}
          <motion.div
            variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="flex w-full max-w-sm flex-col gap-3"
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.Icon className="h-4 w-4" style={{ color: step.color }} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[13px] font-bold leading-tight text-[var(--p-text)]">
                    <span className="mr-1.5 font-mono text-[11px] font-medium" style={{ color: step.color }}>
                      {`0${i + 1}`}
                    </span>
                    {step.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--p-text-muted)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
