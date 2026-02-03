"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { usePitchColors } from "@/app/pitch/pitch-theme";

/* ── Desktop Monitor — Client Dashboard ── */
function DesktopMonitor({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 320 240" className="w-full">
      {/* Stand */}
      <rect x="130" y="210" width="60" height="8" rx="2" fill={c.subtle} />
      <rect x="148" y="200" width="24" height="14" rx="1" fill={c.subtle} />

      {/* Monitor body */}
      <motion.rect
        x="20" y="10" width="280" height="190" rx="10"
        fill={c.panel}
        stroke="rgba(59,130,246,0.3)"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      {/* Screen bezel */}
      <rect x="28" y="18" width="264" height="172" rx="4" fill={c.screen} />

      {/* ── Dashboard UI ── */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {/* Top nav bar */}
        <rect x="28" y="18" width="264" height="22" rx="4" fill={c.uiBg} />
        <text x="40" y="33" fill="rgba(59,130,246,0.7)" fontSize="7" fontWeight="700" fontFamily="var(--font-mono), monospace">Client Dashboard</text>
        {/* Nav dots */}
        <circle cx="268" cy="29" r="3" fill="rgba(34,197,94,0.5)" />
        <circle cx="278" cy="29" r="3" fill="rgba(59,130,246,0.4)" />

        {/* Mini map area */}
        <rect x="34" y="46" width="120" height="70" rx="4" fill={c.uiBg2} />
        {/* Simplified world map dots */}
        {[
          [60, 60], [70, 58], [85, 62], [90, 55], [95, 65],
          [100, 58], [110, 60], [115, 68], [75, 75], [105, 72],
          [65, 68], [80, 80], [120, 55], [130, 62], [140, 58],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.5" fill={i < 5 ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.25)"} />
        ))}
        {/* Connection lines */}
        <line x1="60" y1="60" x2="90" y2="55" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
        <line x1="90" y1="55" x2="110" y2="60" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
        <line x1="85" y1="62" x2="120" y2="55" stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" />

        {/* SLA donut chart */}
        <circle cx="188" cy="74" r="18" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="5" />
        <circle cx="188" cy="74" r="18" fill="none" stroke="#3B82F6" strokeWidth="5" strokeDasharray="100 14" strokeLinecap="round" transform="rotate(-90,188,74)" />
        <text x="188" y="77" textAnchor="middle" fill={c.text} fontSize="9" fontWeight="700" fontFamily="var(--font-mono), monospace">96%</text>
        <text x="188" y="100" textAnchor="middle" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-body)">Uptime SLA</text>

        {/* Stats row */}
        {[
          { x: 228, label: "96.4%", sub: "SLA" },
          { x: 258, label: "14,300", sub: "Assets" },
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="48" width="28" height="22" rx="3" fill={c.uiBg2} />
            <text x={s.x + 14} y="58" textAnchor="middle" fill={c.text} fontSize="6" fontWeight="700" fontFamily="var(--font-mono), monospace">{s.label}</text>
            <text x={s.x + 14} y="66" textAnchor="middle" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">{s.sub}</text>
          </g>
        ))}

        {/* Mini bar chart */}
        <rect x="228" y="78" width="56" height="28" rx="3" fill={c.uiBg2} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const h = 5 + Math.random() * 15;
          return (
            <rect key={i} x={234 + i * 7} y={100 - h} width="4" height={h} rx="1" fill={`rgba(59,130,246,${0.3 + i * 0.08})`} />
          );
        })}

        {/* Job table */}
        <rect x="34" y="122" width="252" height="62" rx="4" fill={c.uiBg2} />
        <text x="42" y="134" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-mono), monospace">FIELD TREND</text>
        {/* Table rows */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="40" y={140 + i * 10} width={50 + Math.random() * 40} height="4" rx="1" fill={`rgba(59,130,246,${0.12 + i * 0.04})`} />
            <rect x="160" y={140 + i * 10} width="30" height="4" rx="1" fill={c.subtle} />
            <rect x="200" y={140 + i * 10} width="20" height="4" rx="1" fill="rgba(34,197,94,0.2)" />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ── Laptop — Partner Portal ── */
function LaptopScreen({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 320 230" className="w-full">
      {/* Laptop base */}
      <path d="M10 210 L40 195 L280 195 L310 210 Z" fill={c.subtleFaint} stroke={c.strokeLight} strokeWidth="0.8" />

      {/* Screen body */}
      <motion.rect
        x="40" y="15" width="240" height="180" rx="8"
        fill={c.panel}
        stroke="rgba(59,130,246,0.25)"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      <rect x="48" y="23" width="224" height="162" rx="3" fill={c.screen} />

      <motion.g
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {/* Top nav */}
        <rect x="48" y="23" width="224" height="20" rx="3" fill={c.uiBg} />
        <text x="58" y="36" fill="rgba(59,130,246,0.7)" fontSize="6" fontWeight="700" fontFamily="var(--font-mono), monospace">Partner Portal</text>

        {/* Sidebar */}
        <rect x="48" y="43" width="50" height="142" fill={c.uiElement} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="55" y={52 + i * 18} width="36" height="4" rx="1" fill={i === 0 ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)"} />
        ))}

        {/* Calendar header */}
        <text x="108" y="58" fill={c.textDim} fontSize="6" fontWeight="600" fontFamily="var(--font-body)">Calendar</text>

        {/* Calendar grid */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => {
            const hasEvent = (row + col) % 3 === 0;
            return (
              <rect
                key={`${row}-${col}`}
                x={106 + col * 28}
                y={64 + row * 22}
                width="24" height="18" rx="2"
                fill={hasEvent ? "rgba(59,130,246,0.12)" : "rgba(30,35,48,0.6)"}
                stroke={hasEvent ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.04)"}
                strokeWidth="0.5"
              />
            );
          })
        )}

        {/* Task list panel */}
        <rect x="106" y="156" width="160" height="26" rx="3" fill={c.uiBg2} />
        <text x="112" y="166" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-mono), monospace">Task List</text>
        {[0, 1].map((i) => (
          <rect key={i} x={112 + i * 60} y={170} width="40" height="4" rx="1" fill="rgba(59,130,246,0.15)" />
        ))}
      </motion.g>
    </svg>
  );
}

/* ── Phone — Technician App ── */
function PhoneScreen({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 180 340" className="w-full max-w-[200px]">
      {/* Phone body */}
      <motion.rect
        x="20" y="10" width="140" height="320" rx="20"
        fill={c.panel}
        stroke="rgba(139,92,246,0.3)"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 15 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
      {/* Notch */}
      <rect x="60" y="14" width="60" height="8" rx="4" fill={c.subtle} />
      {/* Screen */}
      <rect x="28" y="28" width="124" height="290" rx="4" fill={c.screen} />

      <motion.g
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {/* Status bar */}
        <text x="36" y="42" fill={c.textDimmer} fontSize="7" fontFamily="var(--font-mono), monospace">9:41</text>
        <text x="130" y="42" textAnchor="end" fill={c.textDimmer} fontSize="7" fontFamily="var(--font-mono), monospace">100%</text>

        {/* Header */}
        <text x="90" y="62" textAnchor="middle" fill={c.text} fontSize="9" fontWeight="700" fontFamily="var(--font-body)">Technician App</text>

        {/* Photo verification area */}
        <rect x="34" y="72" width="112" height="80" rx="6" fill={c.uiBg2} />
        {/* Camera/photo placeholder */}
        <rect x="42" y="80" width="96" height="52" rx="3" fill={c.uiElement} stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
        {/* Camera icon */}
        <rect x="74" y="96" width="32" height="22" rx="4" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        <circle cx="90" cy="107" r="6" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        <circle cx="90" cy="107" r="2" fill="rgba(139,92,246,0.3)" />
        {/* AI status */}
        <rect x="50" y="136" width="36" height="10" rx="5" fill="rgba(34,197,94,0.15)" />
        <text x="68" y="143" textAnchor="middle" fill="rgba(34,197,94,0.6)" fontSize="5" fontWeight="600" fontFamily="var(--font-mono), monospace">AI OK</text>

        {/* Task checklist */}
        <text x="36" y="170" fill={c.textDim} fontSize="7" fontWeight="600" fontFamily="var(--font-body)">Current Task</text>
        {[
          { label: "Inspection done", checked: true },
          { label: "Installation done", checked: true },
          { label: "Maintenance (next)", checked: false },
        ].map((item, i) => (
          <g key={i}>
            <rect x="36" y={178 + i * 24} width="108" height="20" rx="4" fill={item.checked ? "rgba(34,197,94,0.06)" : "rgba(30,35,48,0.8)"} stroke={item.checked ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"} strokeWidth="0.5" />
            {/* Checkbox */}
            <rect x="42" y={183 + i * 24} width="10" height="10" rx="2" fill={item.checked ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.05)"} />
            {item.checked && (
              <path d={`M44 ${188 + i * 24} L46 ${190 + i * 24} L50 ${186 + i * 24}`} stroke="rgba(34,197,94,0.8)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            )}
            <text x="58" y={191 + i * 24} fill={item.checked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.5)"} fontSize="6.5" fontFamily="var(--font-body)">{item.label}</text>
          </g>
        ))}

        {/* Start Task button */}
        <rect x="36" y="262" width="108" height="28" rx="8" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
        <text x="90" y="280" textAnchor="middle" fill="rgba(59,130,246,0.9)" fontSize="8" fontWeight="700" fontFamily="var(--font-body)">Start Task</text>

        {/* Bottom nav */}
        <rect x="28" y="298" width="124" height="20" rx="4" fill={c.uiElement} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={42 + i * 28} y="304" width="14" height="3" rx="1" fill={i === 0 ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"} />
        ))}
      </motion.g>
    </svg>
  );
}

export function Interfaces() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Tailored Interfaces for Every Role
          </h2>
          <p className="mt-3 text-lg text-[var(--p-text-muted)]">
            A single source of truth for the Client, the Partner, and the Field Tech.
          </p>
        </motion.div>

        {/* ── Three devices ── */}
        <div ref={ref} className="mt-12 grid items-end gap-6 md:grid-cols-3">
          {/* Client Dashboard — Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <DesktopMonitor inView={inView} />
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-fox-orange">Client Dashboard</p>
              <p className="mt-1 text-xs text-[var(--p-text-subtle)]">Global fleet health & real-time SLA monitoring</p>
            </div>
          </motion.div>

          {/* Technician App — Phone (center, raised) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center md:order-3 lg:order-2"
          >
            <div className="mx-auto w-[55%]">
              <PhoneScreen inView={inView} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-violet-400">Technician App</p>
              <p className="mt-1 text-xs text-[var(--p-text-subtle)]">Guided workflows & AI validation</p>
            </div>
          </motion.div>

          {/* Partner Portal — Laptop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col items-center md:order-2 lg:order-3"
          >
            <LaptopScreen inView={inView} />
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-blue-400">Partner Portal</p>
              <p className="mt-1 text-xs text-[var(--p-text-subtle)]">Task assignment & team management</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
