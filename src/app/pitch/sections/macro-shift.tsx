"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, fadeInLeft, fadeInRight, viewportConfig } from "@/lib/animations";
import { usePitchColors } from "@/app/pitch/pitch-theme";

/* ── EV Charger blueprint illustration ── */
function HardwareIllustration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const c = usePitchColors();

  return (
    <div ref={ref} className="mt-3 flex items-center justify-center">
      <svg viewBox="0 0 420 400" className="w-full max-h-[200px]">
        {/* Blueprint grid */}
        <defs>
          <pattern id="bp-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="420" height="400" fill="url(#bp-grid)" />

        {/* Charger body */}
        <motion.g
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Base / pedestal */}
          <rect x="145" y="330" width="120" height="16" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
          <rect x="168" y="316" width="74" height="18" rx="3" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />

          {/* Main column */}
          <rect x="155" y="55" width="100" height="266" rx="10" fill={c.panel} stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" />

          {/* Screen */}
          <rect x="170" y="82" width="70" height="52" rx="5" fill="rgba(59,130,246,0.07)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
          <rect x="180" y="94" width="50" height="5" rx="2" fill="rgba(59,130,246,0.3)" />
          <rect x="180" y="104" width="32" height="5" rx="2" fill="rgba(59,130,246,0.18)" />
          <rect x="180" y="114" width="42" height="5" rx="2" fill="rgba(59,130,246,0.18)" />

          {/* Connector port */}
          <rect x="185" y="155" width="40" height="30" rx="6" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
          <circle cx="205" cy="170" r="8" fill="none" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" />
          <circle cx="205" cy="170" r="3" fill="rgba(59,130,246,0.5)" />

          {/* Cable */}
          <motion.path
            d="M205 185 Q205 210 225 230 Q248 252 248 280 Q248 300 235 310"
            fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="3.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.8, duration: 1 }}
          />
          {/* Cable connector tip */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.8 }}
          >
            <rect x="224" y="306" width="22" height="30" rx="5" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
            <circle cx="235" cy="318" r="3.5" fill="rgba(59,130,246,0.4)" />
          </motion.g>

          {/* LED indicator strip */}
          <rect x="193" y="198" width="24" height="5" rx="2.5" fill="rgba(34,197,94,0.5)" />

          {/* Status light */}
          <motion.circle
            cx="205" cy="68" r="5"
            fill="rgba(34,197,94,0.6)"
            animate={inView ? { opacity: [0.4, 1, 0.4] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>

        {/* Blueprint annotations */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          {/* Dimension line - height */}
          <line x1="125" y1="55" x2="125" y2="330" stroke="rgba(59,130,246,0.18)" strokeWidth="0.8" strokeDasharray="4 3" />
          <line x1="120" y1="55" x2="130" y2="55" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <line x1="120" y1="330" x2="130" y2="330" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <text x="123" y="200" textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize="10" fontFamily="var(--font-mono), monospace" transform="rotate(-90,123,200)">
            1.8m HEIGHT
          </text>

          {/* Annotation - screen */}
          <line x1="240" y1="108" x2="290" y2="92" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <circle cx="290" cy="92" r="2" fill="rgba(59,130,246,0.3)" />
          <text x="296" y="88" fill="rgba(59,130,246,0.55)" fontSize="11" fontWeight="500" fontFamily="var(--font-mono), monospace">SMART DISPLAY</text>
          <text x="296" y="102" fill="rgba(59,130,246,0.35)" fontSize="9" fontFamily="var(--font-mono), monospace">10.1&quot; TOUCHSCREEN</text>

          {/* Annotation - connector */}
          <line x1="225" y1="170" x2="290" y2="155" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <circle cx="290" cy="155" r="2" fill="rgba(59,130,246,0.3)" />
          <text x="296" y="151" fill="rgba(59,130,246,0.55)" fontSize="11" fontWeight="500" fontFamily="var(--font-mono), monospace">CHARGING PORT</text>
          <text x="296" y="165" fill="rgba(59,130,246,0.35)" fontSize="9" fontFamily="var(--font-mono), monospace">CCS2 / 150kW DC</text>

          {/* Annotation - status */}
          <line x1="217" y1="200" x2="290" y2="210" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <circle cx="290" cy="210" r="2" fill="rgba(34,197,94,0.4)" />
          <text x="296" y="207" fill="rgba(34,197,94,0.55)" fontSize="11" fontWeight="500" fontFamily="var(--font-mono), monospace">STATUS: ONLINE</text>
          <text x="296" y="221" fill="rgba(34,197,94,0.3)" fontSize="9" fontFamily="var(--font-mono), monospace">UPTIME 99.7%</text>

          {/* Annotation - IoT top */}
          <line x1="205" y1="55" x2="205" y2="35" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <circle cx="205" cy="35" r="2" fill="rgba(59,130,246,0.3)" />
          <text x="205" y="26" textAnchor="middle" fill="rgba(59,130,246,0.55)" fontSize="11" fontWeight="500" fontFamily="var(--font-mono), monospace">4G/5G CONNECTED</text>

          {/* Annotation - left side */}
          <line x1="155" y1="250" x2="80" y2="265" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <circle cx="80" cy="265" r="2" fill="rgba(59,130,246,0.3)" />
          <text x="12" y="261" fill="rgba(59,130,246,0.55)" fontSize="11" fontWeight="500" fontFamily="var(--font-mono), monospace">GROUND MOUNT</text>
          <text x="12" y="275" fill="rgba(59,130,246,0.35)" fontSize="9" fontFamily="var(--font-mono), monospace">BOLTED FOUNDATION</text>

          {/* Annotation - power */}
          <line x1="155" y1="140" x2="80" y2="130" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
          <circle cx="80" cy="130" r="2" fill="rgba(59,130,246,0.3)" />
          <text x="12" y="126" fill="rgba(59,130,246,0.55)" fontSize="11" fontWeight="500" fontFamily="var(--font-mono), monospace">POWER MODULE</text>
          <text x="12" y="140" fill="rgba(59,130,246,0.35)" fontSize="9" fontFamily="var(--font-mono), monospace">AC/DC 480V INPUT</text>
        </motion.g>
      </svg>
    </div>
  );
}

/* ── Operational complexity illustration ── */
function OperationalIllustration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const c = usePitchColors();

  const opsNodes = [
    { x: 210, y: 35,  icon: "truck",      label: "DISPATCH TRUCK" },
    { x: 370, y: 65,  icon: "wrench",     label: "REPAIR PARTS" },
    { x: 55,  y: 75,  icon: "alert",      label: "MAINT. ALERT" },
    { x: 40,  y: 200, icon: "schedule",   label: "ROUTING DELAY" },
    { x: 380, y: 185, icon: "clipboard",  label: "COMPLIANCE" },
    { x: 70,  y: 330, icon: "parts",      label: "SPARE PARTS" },
    { x: 350, y: 320, icon: "clock",      label: "SLA: 48 HRS" },
    { x: 210, y: 370, icon: "invoice",    label: "INVOICE" },
    { x: 380, y: 260, icon: "photo",      label: "PHOTO CHECK" },
    { x: 45,  y: 135, icon: "user",       label: "TECH ASSIGN" },
  ];

  const connections = [
    [0, 2], [0, 1], [2, 9], [9, 3], [1, 4], [4, 8],
    [3, 5], [5, 7], [7, 6], [6, 8], [0, 4], [9, 5],
    [1, 6], [2, 3], [8, 7], [0, 9], [4, 7], [3, 7],
  ];

  const iconPaths: Record<string, string> = {
    truck:     "M-8,-5 L5,-5 L5,3 L9,3 L9,5 L-8,5 Z M5,-1 L9,3 M-5,5 A2.5,2.5,0,1,0,-5,5.01 M7,5 A2.5,2.5,0,1,0,7,5.01",
    wrench:    "M-4,-8 L-1,-3 L1,-3 L4,-8 M0,-3 L0,7 M-4,7 L4,7",
    alert:     "M0,-8 L7,7 L-7,7 Z M0,-3 L0,3 M0,5 L0,5.5",
    schedule:  "M-6,-6 L6,-6 L6,6 L-6,6 Z M-6,-2 L6,-2 M-2,-6 L-2,-2 M2,-6 L2,-2",
    clipboard: "M-5,-8 L5,-8 L5,8 L-5,8 Z M-3,-4 L3,-4 M-3,0 L3,0 M-3,4 L1,4",
    parts:     "M-3,-7 A4,4,0,1,1,3,-7 M0,-3 L0,7 M-5,2 L5,2",
    clock:     "M0,0 m-7,0 a7,7,0,1,0,14,0 a7,7,0,1,0,-14,0 M0,-4 L0,0 L4,2",
    invoice:   "M-5,-8 L3,-8 L5,-5 L5,8 L-5,8 Z M-3,-4 L3,-4 M-3,0 L3,0 M-3,4 L1,4",
    photo:     "M-7,-4 L7,-4 L7,6 L-7,6 Z M-3,-7 L3,-7 L3,-4 L-3,-4 Z M0,1 A3,3,0,1,0,0.01,1",
    user:      "M0,-5 A4,4,0,1,0,0.01,-5 M-6,8 Q-6,1 0,1 Q6,1 6,8",
  };

  return (
    <div ref={ref} className="mt-3 flex items-center justify-center">
      <svg viewBox="0 0 420 400" className="w-full max-h-[200px]">
        <defs>
          <pattern id="bp-grid2" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
          </pattern>
          <filter id="ops-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="420" height="400" fill="url(#bp-grid2)" />

        {/* Central charger (faded, overwhelmed) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.2 } : {}}
          transition={{ duration: 0.5 }}
        >
          <rect x="175" y="110" width="70" height="195" rx="8" fill={c.subtleFaint} stroke={c.strokeLight} strokeWidth="1" />
          <rect x="188" y="130" width="44" height="28" rx="4" fill={c.subtleFaint} stroke={c.strokeFaint} strokeWidth="0.8" />
          <rect x="165" y="300" width="90" height="12" rx="3" fill={c.subtleFaint} stroke={c.strokeFaint} strokeWidth="0.8" />
        </motion.g>

        {/* Connection lines (chaotic network) */}
        {connections.map(([a, b], i) => (
          <motion.line
            key={`conn-${i}`}
            x1={opsNodes[a].x} y1={opsNodes[a].y}
            x2={opsNodes[b].x} y2={opsNodes[b].y}
            stroke="rgba(59,130,246,0.2)"
            strokeWidth="1"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
          />
        ))}

        {/* Lines from center charger to nodes */}
        {opsNodes.map((node, i) => (
          <motion.line
            key={`center-${i}`}
            x1={210} y1={210}
            x2={node.x} y2={node.y}
            stroke="rgba(59,130,246,0.12)"
            strokeWidth="0.6"
            strokeDasharray="3 4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 + i * 0.06 }}
          />
        ))}

        {/* Traveling pulses */}
        {[0, 3, 6, 9, 12, 15].map((ci) => {
          const [a, b] = connections[ci];
          return (
            <motion.circle
              key={`pulse-${ci}`}
              r="3"
              fill="#3B82F6"
              filter="url(#ops-glow)"
              animate={inView ? {
                cx: [opsNodes[a].x, opsNodes[b].x],
                cy: [opsNodes[a].y, opsNodes[b].y],
                opacity: [0, 0.8, 0.8, 0],
              } : {}}
              transition={{
                duration: 1.8,
                delay: 1.5 + ci * 0.2,
                repeat: Infinity,
                repeatDelay: 2.5,
              }}
            />
          );
        })}

        {/* Operation nodes with icons */}
        {opsNodes.map((node, i) => (
          <motion.g
            key={`node-${i}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 200, damping: 15 }}
          >
            {/* Node circle bg */}
            <circle cx={node.x} cy={node.y} r="20"
              fill={c.panel} stroke="rgba(59,130,246,0.45)" strokeWidth="1.2" />

            {/* Icon */}
            <g transform={`translate(${node.x},${node.y})`}>
              <path d={iconPaths[node.icon]}
                fill="none" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Label */}
            <text
              x={node.x}
              y={node.y + 30}
              textAnchor="middle"
              fill="rgba(59,130,246,0.55)"
              fontSize="8"
              fontWeight="500"
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.05em"
            >
              {node.label}
            </text>
          </motion.g>
        ))}

        {/* "Complexity" warning pulse around the charger */}
        <motion.circle
          cx="210" cy="210" r="55"
          fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="1" strokeDasharray="5 4"
          animate={inView ? { r: [55, 75, 55], opacity: [0.3, 0.1, 0.3] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.circle
          cx="210" cy="210" r="80"
          fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="0.8" strokeDasharray="4 5"
          animate={inView ? { r: [80, 100, 80], opacity: [0.15, 0.05, 0.15] } : {}}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
      </svg>
    </div>
  );
}

export function MacroShift() {
  const c = usePitchColors();
  return (
    <section className="relative flex min-h-full items-center py-4 lg:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(${c.gridLineBold} 1px, transparent 1px), linear-gradient(90deg, ${c.gridLineBold} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          The Macro Shift:{" "}
          <span className="text-[var(--p-text-muted)]">Digital World, Physical Assets.</span>
        </motion.h2>

        {/* Two-column visual comparison */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Left — The Future Hardware */}
          <motion.div variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4 lg:p-5">
            <h3 className="text-lg font-semibold text-[var(--p-text-strong)]">The Future Hardware</h3>
            <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--p-text-subtle)]">
              Industries are deploying distributed physical networks at unprecedented scale — EV chargers, telecom 5G towers, smart lockers, industrial IoT sensors.
            </p>
            <HardwareIllustration />
          </motion.div>

          {/* Right — The Operational Reality */}
          <motion.div variants={fadeInRight} initial="hidden" whileInView="visible" viewport={viewportConfig}
            className="rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4 lg:p-5">
            <h3 className="text-lg font-semibold text-[var(--p-text-strong)]">The Operational Reality</h3>
            <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--p-text-subtle)]">
              Every device needs trucks, technicians, parts, schedules, compliance — coordinated across cities and countries.
            </p>
            <OperationalIllustration />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
