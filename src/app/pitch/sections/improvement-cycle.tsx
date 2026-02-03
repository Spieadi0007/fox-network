"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { Search, PenTool, Rocket, BarChart3, Settings } from "lucide-react";

// Proper infinity: left loop goes up-left-down, crosses center, right loop goes up-right-down, crosses back
const INF_LEFT = "M390 210 C340 90 120 90 120 210 C120 330 340 330 390 210";
const INF_RIGHT = "M390 210 C440 90 660 90 660 210 C660 330 440 330 390 210";

export function ImprovementCycle() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

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

        <div ref={ref} className="relative mx-auto mt-6 h-[420px] w-full max-w-[780px]">

          {/* ── SVG infinity ── */}
          <svg viewBox="0 0 780 420" className="absolute inset-0 h-full w-full" fill="none">
            <defs>
              <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="gr" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="wide">
                <feGaussianBlur stdDeviation="18" />
              </filter>
              <filter id="med">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Wide outer glow — left */}
            <path d={INF_LEFT} stroke="rgba(59,130,246,0.15)" strokeWidth="40" filter="url(#wide)" />
            {/* Wide outer glow — right */}
            <path d={INF_RIGHT} stroke="rgba(59,130,246,0.15)" strokeWidth="40" filter="url(#wide)" />

            {/* Orange accent glow — left */}
            <path d={INF_LEFT} stroke="rgba(249,115,22,0.08)" strokeWidth="24" filter="url(#wide)" />
            {/* Orange accent glow — right */}
            <path d={INF_RIGHT} stroke="rgba(249,115,22,0.08)" strokeWidth="24" filter="url(#wide)" />

            {/* Mid glow — left */}
            <motion.path d={INF_LEFT} stroke="url(#gl)" strokeWidth="6" filter="url(#med)"
              initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            {/* Mid glow — right */}
            <motion.path d={INF_RIGHT} stroke="url(#gr)" strokeWidth="6" filter="url(#med)"
              initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
            />

            {/* Core stroke — left */}
            <motion.path d={INF_LEFT} stroke="rgba(99,102,241,0.4)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
            {/* Core stroke — right */}
            <motion.path d={INF_RIGHT} stroke="rgba(99,102,241,0.4)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.8, delay: 0.15, ease: "easeInOut" }}
            />

            {/* Bright inner — left */}
            <motion.path d={INF_LEFT} stroke="rgba(147,151,255,0.6)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.4 }}
            />
            {/* Bright inner — right */}
            <motion.path d={INF_RIGHT} stroke="rgba(147,151,255,0.6)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.55 }}
            />

            {/* ── Traveling pulses ── */}
            <motion.circle r="5" fill="#F97316"
              style={{ offsetPath: `path("${INF_LEFT}")`, filter: "drop-shadow(0 0 8px rgba(249,115,22,0.7))" }}
              initial={{ offsetDistance: "0%" }} animate={inView ? { offsetDistance: ["0%", "100%"] } : {}}
              transition={{ delay: 2, duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle r="5" fill="#3B82F6"
              style={{ offsetPath: `path("${INF_RIGHT}")`, filter: "drop-shadow(0 0 8px rgba(59,130,246,0.7))" }}
              initial={{ offsetDistance: "0%" }} animate={inView ? { offsetDistance: ["0%", "100%"] } : {}}
              transition={{ delay: 2, duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle r="3" fill="#8B5CF6" opacity="0.7"
              style={{ offsetPath: `path("${INF_LEFT}")`, filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}
              initial={{ offsetDistance: "0%" }} animate={inView ? { offsetDistance: ["50%", "150%"] } : {}}
              transition={{ delay: 2, duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle r="3" fill="#F97316" opacity="0.6"
              style={{ offsetPath: `path("${INF_RIGHT}")`, filter: "drop-shadow(0 0 6px rgba(249,115,22,0.4))" }}
              initial={{ offsetDistance: "0%" }} animate={inView ? { offsetDistance: ["50%", "150%"] } : {}}
              transition={{ delay: 2, duration: 4.5, repeat: Infinity, ease: "linear" }}
            />

            {/* ── Directional arrows ── */}
            {[
              // Left loop (counterclockwise visually)
              { x: 260, y: 100, rot: 160 },
              { x: 115, y: 140, rot: 230 },
              { x: 115, y: 285, rot: 310 },
              { x: 260, y: 330, rot: 20 },
              // Right loop (clockwise visually)
              { x: 520, y: 100, rot: 20 },
              { x: 665, y: 140, rot: 130 },
              { x: 665, y: 285, rot: 210 },
              { x: 520, y: 330, rot: 340 },
              // Crossing
              { x: 420, y: 155, rot: -25 },
              { x: 360, y: 265, rot: 155 },
            ].map((a, i) => (
              <motion.path key={i}
                d="M-7 -5 L0 0 L-7 5" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                transform={`translate(${a.x},${a.y}) rotate(${a.rot})`}
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.6 + i * 0.06 }}
              />
            ))}

            {/* Grid crosshairs */}
            {[{ x: 50, y: 40 }, { x: 730, y: 40 }, { x: 50, y: 380 }, { x: 730, y: 380 }].map((p, i) => (
              <g key={i} opacity="0.1">
                <line x1={p.x - 10} y1={p.y} x2={p.x + 10} y2={p.y} stroke="white" strokeWidth="0.5" />
                <line x1={p.x} y1={p.y - 10} x2={p.x} y2={p.y + 10} stroke="white" strokeWidth="0.5" />
              </g>
            ))}

            {/* Micro data labels */}
            {[
              { x: 190, y: 120, t: "SLA TRACKING" },
              { x: 590, y: 120, t: "ROUTE OPT" },
              { x: 190, y: 320, t: "COST DATA" },
              { x: 590, y: 320, t: "KPI SCORE" },
            ].map((d, i) => (
              <text key={i} x={d.x} y={d.y} textAnchor="middle" fill="white" opacity="0.06"
                fontSize="7" fontFamily="var(--font-mono), monospace" letterSpacing="0.12em">{d.t}</text>
            ))}
          </svg>

          {/* ── Center label ── */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
          >
            <div style={{ textShadow: "0 0 40px rgba(249,115,22,0.5), 0 0 80px rgba(249,115,22,0.2)" }}>
              <p className="font-[family-name:var(--font-heading)] text-[clamp(1.25rem,3vw,1.75rem)] font-extrabold text-white">Data</p>
              <p className="font-[family-name:var(--font-heading)] text-[clamp(1.25rem,3vw,1.75rem)] font-extrabold text-white">Feedback</p>
              <p className="font-[family-name:var(--font-heading)] text-[clamp(1.25rem,3vw,1.75rem)] font-extrabold text-white">Loop</p>
            </div>
          </motion.div>

          {/* ── Glass node cards ── */}
          {[
            { Icon: Search, label: "Discovery", sub: "Workshops", cls: "top-[-2%] right-[24%]" },
            { Icon: PenTool, label: "Solution", sub: "Design & Build", cls: "top-[36%] right-[-1%]" },
            { Icon: Rocket, label: "Pilot", sub: "Launch", cls: "bottom-[-2%] right-[24%]" },
            { Icon: BarChart3, label: "Data Analysis", sub: "& Optimization", cls: "bottom-[-2%] left-[18%]" },
            { Icon: Settings, label: "Continuous", sub: "Improvement Cycle", cls: "top-[36%] left-[-1%]" },
          ].map((node, i) => (
            <motion.div
              key={i}
              className={`absolute z-10 ${node.cls}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 160, damping: 14 }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="flex h-[68px] w-[68px] items-center justify-center rounded-xl"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <node.Icon className="h-7 w-7 text-fox-orange/80" strokeWidth={1.3} />
                </div>
                <p className="mt-2 text-center text-[11px] font-bold leading-tight text-white/90">{node.label}</p>
                <p className="text-center text-[10px] leading-tight text-white/45">{node.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
