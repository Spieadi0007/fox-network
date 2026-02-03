"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";

/* ─────────────────────────────────────────────
   1. EXPERIENCE — Manager plans on a whiteboard,
      steps appear one by one, then a checklist
      forms showing the strategy is ready.
   ───────────────────────────────────────────── */
function StrategyAnimation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const steps = [
    { label: "Audit current ops", delay: 0.6 },
    { label: "Map your workflow", delay: 1.0 },
    { label: "Design playbook", delay: 1.4 },
    { label: "Roll out to teams", delay: 1.8 },
  ];

  return (
    <div ref={ref} className="relative flex h-56 items-center justify-center">
      <svg viewBox="0 0 240 170" className="w-full max-w-[260px]">
        {/* Whiteboard */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <rect x="30" y="10" width="180" height="120" rx="8"
            fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
          {/* Top bar */}
          <rect x="30" y="10" width="180" height="20" rx="8"
            fill="rgba(59,130,246,0.08)" />
          <text x="120" y="24" textAnchor="middle"
            fill="rgba(59,130,246,0.5)" fontSize="8" fontWeight="600"
            fontFamily="var(--font-body)">
            Your Strategy Plan
          </text>
        </motion.g>

        {/* Checklist items appearing one by one */}
        {steps.map((step, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: step.delay }}
          >
            {/* Checkbox */}
            <rect x="46" y={42 + i * 22} width="12" height="12" rx="3"
              fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8" />
            {/* Checkmark animates in after the row */}
            <motion.path
              d={`M${49} ${49 + i * 22} L${51} ${51 + i * 22} L${55} ${46 + i * 22}`}
              stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.3, delay: step.delay + 0.3 }}
            />
            {/* Label */}
            <text x="66" y={51 + i * 22}
              fill="rgba(255,255,255,0.5)" fontSize="8.5"
              fontFamily="var(--font-body)">
              {step.label}
            </text>
          </motion.g>
        ))}

        {/* "Ready" badge pops in at the end */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 2.4, type: "spring" as const, stiffness: 200, damping: 15 }}
        >
          <rect x="140" y="100" width="56" height="20" rx="10"
            fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="0.8" />
          <text x="168" y="113" textAnchor="middle"
            fill="#3B82F6" fontSize="8" fontWeight="600"
            fontFamily="var(--font-body)">
            Ready
          </text>
        </motion.g>

        {/* Caption */}
        <text x="120" y="155" textAnchor="middle"
          fill="rgba(255,255,255,0.3)" fontSize="8"
          fontFamily="var(--font-body)">
          We plan every step with you
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. EXECUTION — Technician fills a form on
      their phone → data flows to the platform
      → dashboard lights up with live data.
   ───────────────────────────────────────────── */
function ExecutionAnimation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative flex h-56 items-center justify-center">
      <svg viewBox="0 0 280 170" className="w-full max-w-[280px]">

        {/* ── PHONE (left side) ── */}
        <motion.g
          initial={{ opacity: 0, x: -15 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Phone body */}
          <rect x="15" y="15" width="58" height="105" rx="10"
            fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
          {/* Notch */}
          <rect x="32" y="18" width="24" height="4" rx="2"
            fill="rgba(59,130,246,0.15)" />
          {/* Screen area */}
          <rect x="21" y="28" width="46" height="78" rx="4"
            fill="rgba(59,130,246,0.03)" />

          {/* Person icon (stick figure) */}
          <circle cx="44" cy="38" r="4" fill="rgba(59,130,246,0.3)" />
          <line x1="44" y1="42" x2="44" y2="52" stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeLinecap="round" />
          <line x1="38" y1="46" x2="50" y2="46" stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeLinecap="round" />

          {/* Form fields filling in */}
          <motion.rect x="26" y="58" width="36" height="5" rx="2"
            fill="rgba(59,130,246,0.3)"
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }} style={{ originX: 0 }} />
          <motion.rect x="26" y="67" width="28" height="5" rx="2"
            fill="rgba(59,130,246,0.2)"
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 1.1, duration: 0.5 }} style={{ originX: 0 }} />
          <motion.rect x="26" y="76" width="32" height="5" rx="2"
            fill="rgba(59,130,246,0.2)"
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 1.4, duration: 0.5 }} />

          {/* Camera/photo icon — tap to upload photo */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.7, type: "spring" as const, stiffness: 200, damping: 15 }}
          >
            <rect x="26" y="86" width="36" height="16" rx="3"
              fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.6" />
            {/* Camera icon */}
            <rect x="38" y="89" width="12" height="9" rx="2"
              fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="0.8" />
            <circle cx="44" cy="94" r="2.5"
              fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="0.8" />
          </motion.g>

          {/* "Submit" button */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 2.0 }}
          >
            {/* Submit tap ripple */}
            <motion.circle cx="44" cy="110" r="0"
              fill="rgba(59,130,246,0.2)"
              animate={inView ? { r: [0, 12, 0], opacity: [0.5, 0.2, 0] } : {}}
              transition={{ delay: 2.2, duration: 0.6 }} />
          </motion.g>
        </motion.g>

        {/* Label below phone */}
        <text x="44" y="135" textAnchor="middle"
          fill="rgba(255,255,255,0.35)" fontSize="7.5"
          fontFamily="var(--font-body)">
          Technician
        </text>
        <text x="44" y="145" textAnchor="middle"
          fill="rgba(255,255,255,0.25)" fontSize="7"
          fontFamily="var(--font-body)">
          fills form on site
        </text>

        {/* ── DATA FLOW (middle) ── */}
        {/* Dashed arrow line */}
        <motion.line x1="80" y1="67" x2="170" y2="67"
          stroke="rgba(59,130,246,0.12)" strokeWidth="1" strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 2.3, duration: 0.6 }} />
        {/* Arrow head */}
        <motion.path d="M167 63 L173 67 L167 71" fill="none"
          stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 2.8 }} />

        {/* Flowing data dots */}
        {[0, 1, 2].map((i) => (
          <motion.circle key={i} r="2.5"
            fill="#3b82f6"
            initial={{ opacity: 0, cx: 82, cy: 67 }}
            animate={inView ? {
              cx: [82, 110, 140, 170],
              cy: [67, 60 + i * 5, 62 + i * 3, 67],
              opacity: [0, 0.8, 0.8, 0],
            } : {}}
            transition={{
              duration: 1.2,
              delay: 2.5 + i * 0.25,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}

        {/* Middle label */}
        <text x="125" y="85" textAnchor="middle"
          fill="rgba(59,130,246,0.35)" fontSize="7"
          fontFamily="var(--font-body)">
          data syncs live
        </text>

        {/* ── PLATFORM DASHBOARD (right side) ── */}
        <motion.g
          initial={{ opacity: 0, x: 15 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Monitor frame */}
          <rect x="175" y="10" width="90" height="70" rx="6"
            fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
          {/* Title bar */}
          <rect x="175" y="10" width="90" height="14" rx="6"
            fill="rgba(59,130,246,0.08)" />
          <circle cx="183" cy="17" r="2" fill="rgba(59,130,246,0.2)" />
          <circle cx="190" cy="17" r="2" fill="rgba(59,130,246,0.2)" />
          <circle cx="197" cy="17" r="2" fill="rgba(59,130,246,0.2)" />

          {/* Job card appearing */}
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 3.0, duration: 0.4 }}
          >
            <rect x="181" y="30" width="78" height="22" rx="4"
              fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" />
            <circle cx="190" cy="41" r="4"
              fill="rgba(59,130,246,0.15)" />
            {/* Status dot */}
            <circle cx="190" cy="41" r="1.5"
              fill="#3b82f6" />
            <rect x="198" y="36" width="30" height="3" rx="1"
              fill="rgba(59,130,246,0.3)" />
            <rect x="198" y="43" width="20" height="3" rx="1"
              fill="rgba(59,130,246,0.15)" />
            {/* Status badge */}
            <rect x="238" y="36" width="16" height="10" rx="5"
              fill="rgba(34,197,94,0.15)" />
            <text x="246" y="43" textAnchor="middle"
              fill="rgba(34,197,94,0.7)" fontSize="5" fontWeight="600"
              fontFamily="var(--font-body)">
              Live
            </text>
          </motion.g>

          {/* Mini bar chart growing */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.rect key={i}
              x={185 + i * 15} y={72 - (10 + i * 4)}
              width="8" height={10 + i * 4} rx="2"
              fill={`rgba(59,130,246,${0.1 + i * 0.05})`}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ delay: 3.2 + i * 0.12, duration: 0.4 }}
              style={{ originY: "100%" }}
            />
          ))}

          {/* Monitor stand */}
          <line x1="220" y1="80" x2="220" y2="92"
            stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
          <rect x="208" y="92" width="24" height="3" rx="1.5"
            fill="rgba(59,130,246,0.1)" />
        </motion.g>

        {/* Label below dashboard */}
        <text x="220" y="112" textAnchor="middle"
          fill="rgba(255,255,255,0.35)" fontSize="7.5"
          fontFamily="var(--font-body)">
          Your Dashboard
        </text>
        <text x="220" y="122" textAnchor="middle"
          fill="rgba(255,255,255,0.25)" fontSize="7"
          fontFamily="var(--font-body)">
          sees it instantly
        </text>

        {/* Caption */}
        <text x="140" y="162" textAnchor="middle"
          fill="rgba(255,255,255,0.3)" fontSize="8"
          fontFamily="var(--font-body)">
          Field to dashboard in real time
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. DATA — Completed jobs feed into reports,
      reports generate insights, insights
      improve the next job. Simple cycle.
   ───────────────────────────────────────────── */
function DataAnimation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative flex h-56 items-center justify-center">
      <svg viewBox="0 0 240 170" className="w-full max-w-[260px]">

        {/* Step 1: Completed jobs (top left) */}
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <rect x="15" y="20" width="60" height="50" rx="8"
            fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
          {/* Stack of job cards */}
          {[0, 1, 2].map((i) => (
            <motion.g key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.2 }}
            >
              <rect x={22} y={28 + i * 13} width="46" height="9" rx="3"
                fill={`rgba(139,92,246,${0.08 + i * 0.03})`} />
              {/* Checkmark */}
              <motion.path
                d={`M${26} ${33 + i * 13} L${28} ${35 + i * 13} L${32} ${31 + i * 13}`}
                stroke="rgba(34,197,94,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.9 + i * 0.2, duration: 0.3 }}
              />
              <rect x={36} y={31 + i * 13} width={20 - i * 3} height="3" rx="1"
                fill={`rgba(139,92,246,${0.15 + i * 0.05})`} />
            </motion.g>
          ))}
          <text x="45" y="82" textAnchor="middle"
            fill="rgba(255,255,255,0.35)" fontSize="7"
            fontFamily="var(--font-body)">
            Completed jobs
          </text>
        </motion.g>

        {/* Arrow 1: Jobs → Reports */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 }}
        >
          <motion.path d="M78 45 Q95 30 107 45"
            fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="3 2"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ delay: 1.4, duration: 0.5 }}
          />
          <motion.path d="M104 41 L108 45 L103 48" fill="none"
            stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.8 }}
          />
          {/* Flowing dot */}
          <motion.circle r="2" fill="#8b5cf6"
            initial={{ opacity: 0 }}
            animate={inView ? {
              cx: [80, 95, 107],
              cy: [45, 32, 45],
              opacity: [0, 0.8, 0],
            } : {}}
            transition={{ delay: 1.5, duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
          />
        </motion.g>

        {/* Step 2: Reports / Analytics (center) */}
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <rect x="110" y="15" width="60" height="58" rx="8"
            fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
          {/* Chart icon */}
          <rect x="110" y="15" width="60" height="14" rx="8"
            fill="rgba(139,92,246,0.08)" />
          <text x="140" y="25" textAnchor="middle"
            fill="rgba(139,92,246,0.5)" fontSize="6.5" fontWeight="600"
            fontFamily="var(--font-body)">
            Analytics
          </text>

          {/* Bar chart growing */}
          {[0, 1, 2, 3].map((i) => (
            <motion.rect key={i}
              x={118 + i * 12} y={60 - (8 + i * 6)}
              width="7" height={8 + i * 6} rx="2"
              fill={`rgba(139,92,246,${0.15 + i * 0.08})`}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ delay: 2.0 + i * 0.15, duration: 0.4 }}
              style={{ originY: "100%" }}
            />
          ))}

          {/* Trend line going up */}
          <motion.path d="M120 56 L130 50 L140 44 L152 34"
            fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="1.2" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ delay: 2.6, duration: 0.6 }}
          />
          <motion.circle cx="152" cy="34" r="2" fill="rgba(34,197,94,0.6)"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 3.1, type: "spring" as const, stiffness: 200 }}
          />

          <text x="140" y="82" textAnchor="middle"
            fill="rgba(255,255,255,0.35)" fontSize="7"
            fontFamily="var(--font-body)">
            Spot patterns
          </text>
        </motion.g>

        {/* Arrow 2: Reports → Improvements */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 2.8 }}
        >
          <motion.path d="M172 45 Q188 30 200 45"
            fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="3 2"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ delay: 2.8, duration: 0.5 }}
          />
          <motion.path d="M197 41 L201 45 L196 48" fill="none"
            stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 3.2 }}
          />
          <motion.circle r="2" fill="#8b5cf6"
            initial={{ opacity: 0 }}
            animate={inView ? {
              cx: [174, 188, 200],
              cy: [45, 32, 45],
              opacity: [0, 0.8, 0],
            } : {}}
            transition={{ delay: 2.9, duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
          />
        </motion.g>

        {/* Step 3: Improvements (right) */}
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 1.6 }}
        >
          <rect x="200" y="20" width="30" height="50" rx="8"
            fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
          {/* Upward arrow icon */}
          <motion.path d="M215 56 L215 34"
            stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ delay: 3.3, duration: 0.5 }}
          />
          <motion.path d="M210 39 L215 34 L220 39"
            stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ delay: 3.7, duration: 0.3 }}
          />
          <text x="215" y="82" textAnchor="middle"
            fill="rgba(255,255,255,0.35)" fontSize="7"
            fontFamily="var(--font-body)">
            Improve
          </text>
        </motion.g>

        {/* Feedback loop arrow — curves back from right to left along the bottom */}
        <motion.path
          d="M215 72 C215 110 120 120 45 72"
          fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="1"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 3.8, duration: 1.0 }}
        />
        <motion.path d="M50 68 L45 73 L51 76" fill="none"
          stroke="rgba(139,92,246,0.25)" strokeWidth="0.8" strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 4.7 }}
        />

        {/* Looping dot on the feedback path */}
        <motion.circle r="2.5" fill="#8b5cf6"
          initial={{ opacity: 0 }}
          animate={inView ? {
            opacity: [0, 0.7, 0.7, 0],
          } : {}}
          transition={{ delay: 4.0, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <animateMotion
            path="M215 72 C215 110 120 120 45 72"
            dur="2s"
            begin="4s"
            repeatCount="indefinite"
          />
        </motion.circle>

        {/* Label on the loop */}
        <text x="130" y="115" textAnchor="middle"
          fill="rgba(139,92,246,0.3)" fontSize="7" fontStyle="italic"
          fontFamily="var(--font-body)">
          feeds back into next cycle
        </text>

        {/* Caption */}
        <text x="120" y="155" textAnchor="middle"
          fill="rgba(255,255,255,0.3)" fontSize="8"
          fontFamily="var(--font-body)">
          Every job makes the next one better
        </text>
      </svg>
    </div>
  );
}

/* ─── Pillar card data ─── */
const pillars = [
  {
    title: "Experience",
    subtitle: "Strategy",
    tagline: "We learn your operations and build a custom playbook.",
    points: ["Workshops with your team", "Map your current process", "Design custom workflows", "Plan for multi-country scale"],
    borderColor: "border-fox-orange/30",
    accentColor: "text-fox-orange",
    bgAccent: "from-fox-orange/5 to-transparent",
    dotColor: "bg-fox-orange",
    Animation: StrategyAnimation,
  },
  {
    title: "Execution",
    subtitle: "The Platform",
    tagline: "Your technicians capture data on-site. You see it instantly.",
    points: ["Technicians fill forms on mobile", "Photos & data sync in real time", "Live dashboard for your team", "AI checks work quality"],
    borderColor: "border-blue-500/30",
    accentColor: "text-blue-400",
    bgAccent: "from-blue-500/5 to-transparent",
    dotColor: "bg-blue-400",
    Animation: ExecutionAnimation,
  },
  {
    title: "Data",
    subtitle: "Continuous Improvement",
    tagline: "Every completed job teaches you something. We make sure you use it.",
    points: ["See what\u2019s working and what\u2019s not", "Predict issues before they happen", "Score technician quality", "Improve with every cycle"],
    borderColor: "border-violet-500/30",
    accentColor: "text-violet-400",
    bgAccent: "from-violet-500/5 to-transparent",
    dotColor: "bg-violet-400",
    Animation: DataAnimation,
  },
];

/* ─── Main section ─── */
export function Pillars() {
  return (
    <section className="relative overflow-hidden bg-stone-950 py-28 lg:py-36">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container className="relative">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="max-w-3xl"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-fox-orange">
            Our Approach
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white">
            End-to-End Field Operations.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.7] text-stone-400">
            Transformation, not just transaction. We implement, connect, and
            scale with you.
          </p>
        </motion.div>

        {/* Three pillar cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={fadeInUp}
              className={`group relative overflow-hidden rounded-2xl border ${pillar.borderColor} bg-stone-900/60 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl`}
            >
              {/* Top gradient accent */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${pillar.bgAccent}`} />

              <div className="relative p-7">
                {/* Animated illustration */}
                <pillar.Animation />

                {/* Text content */}
                <div className="mt-4">
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-white">
                    {pillar.title}{" "}
                    <span className={`text-sm font-medium ${pillar.accentColor}`}>
                      ({pillar.subtitle})
                    </span>
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-stone-400">
                    {pillar.tagline}
                  </p>
                </div>

                {/* Bullet points */}
                <ul className="mt-5 space-y-2.5">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${pillar.dotColor} shrink-0`} />
                      <span className="text-[13px] text-stone-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-12"
        >
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 px-8 py-5 text-center backdrop-blur-sm">
            <p className="text-[15px] font-medium leading-relaxed text-stone-300">
              We don&apos;t just advise. We provide the{" "}
              <span className="text-fox-orange">Strategy</span>, the{" "}
              <span className="text-blue-400">Tools</span>, and the{" "}
              <span className="text-violet-400">Network</span> to execute it.
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
