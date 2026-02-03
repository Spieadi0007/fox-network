"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { usePitchColors } from "@/app/pitch/pitch-theme";

export function Orchestration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const c = usePitchColors();

  return (
    <section className="relative flex min-h-full items-center py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em]"
        >
          The Orchestration Layer.
        </motion.h2>

        {/* ── Full diagram ── */}
        <motion.div
          ref={ref}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-10"
        >
          <svg viewBox="0 0 900 520" className="w-full">
            <defs>
              {/* Blueprint grid */}
              <pattern id="orch-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(59,130,246,0.04)" strokeWidth="0.5" />
              </pattern>
              <filter id="chip-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="900" height="520" fill="url(#orch-grid)" />

            {/* ════════════════════════════════════════ */}
            {/* THREE MODULE CARDS (top row)             */}
            {/* ════════════════════════════════════════ */}

            {[
              {
                x: 50, title: "Deployment",
                items: ["Truck capacity", "Site surveys", "Installation"],
                num: "1",
              },
              {
                x: 325, title: "Maintenance",
                items: ["Auto-routing", "Preventive/Corrective flows"],
                num: "2",
              },
              {
                x: 600, title: "Supply Chain",
                items: ["Parts inventory", "Warehouse management"],
                num: "3",
              },
            ].map((card, ci) => (
              <motion.g
                key={card.title}
                initial={{ opacity: 0, y: -15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + ci * 0.15, duration: 0.5 }}
              >
                {/* Card bg */}
                <rect
                  x={card.x} y={20} width={250} height={120} rx={14}
                  fill={c.panel2}
                  stroke="rgba(59,130,246,0.25)"
                  strokeWidth="1.2"
                />

                {/* Number badge */}
                <rect
                  x={card.x + 16} y={38} width={28} height={28} rx={7}
                  fill="#3B82F6"
                />
                <text
                  x={card.x + 30} y={58}
                  textAnchor="middle"
                  fill={c.text} fontSize="14" fontWeight="700"
                  fontFamily="var(--font-heading)"
                >
                  {card.num}
                </text>

                {/* Title */}
                <text
                  x={card.x + 56} y={58}
                  fill={c.text} fontSize="18" fontWeight="700"
                  fontFamily="var(--font-heading)"
                >
                  {card.title}
                </text>

                {/* Items */}
                {card.items.map((item, ii) => (
                  <text
                    key={ii}
                    x={card.x + 20} y={85 + ii * 18}
                    fill={c.textDim} fontSize="13"
                    fontFamily="var(--font-body)"
                  >
                    {item}
                  </text>
                ))}
              </motion.g>
            ))}

            {/* ════════════════════════════════════════ */}
            {/* CIRCUIT TRACES from cards → chip          */}
            {/* ════════════════════════════════════════ */}

            {/* Left card traces */}
            <motion.path
              d="M175 140 L175 200 L350 200 L350 260"
              fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            />
            {/* Left side traces */}
            <motion.path
              d="M120 140 L120 220 L300 220 L300 280"
              fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.8 }}
            />

            {/* Center card traces */}
            <motion.path
              d="M450 140 L450 260"
              fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.85, duration: 0.6 }}
            />
            <motion.path
              d="M400 140 L400 210 L380 210 L380 280"
              fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.95, duration: 0.7 }}
            />
            <motion.path
              d="M500 140 L500 210 L520 210 L520 280"
              fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.95, duration: 0.7 }}
            />

            {/* Right card traces */}
            <motion.path
              d="M725 140 L725 200 L550 200 L550 260"
              fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            />
            <motion.path
              d="M780 140 L780 220 L600 220 L600 280"
              fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.8 }}
            />

            {/* Arrow indicators on main traces */}
            {[
              { x: 350, y: 248 },
              { x: 450, y: 248 },
              { x: 550, y: 248 },
            ].map((a, i) => (
              <motion.path
                key={`arr-${i}`}
                d={`M${a.x - 4} ${a.y} L${a.x} ${a.y + 8} L${a.x + 4} ${a.y}`}
                fill="none" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 + i * 0.1 }}
              />
            ))}

            {/* Traveling data pulses */}
            {[
              { path: "M175 140 L175 200 L350 200 L350 260", delay: 1.8 },
              { path: "M450 140 L450 260", delay: 2.1 },
              { path: "M725 140 L725 200 L550 200 L550 260", delay: 2.4 },
            ].map((p, i) => (
              <motion.circle
                key={`pulse-${i}`}
                r="4"
                fill="#3B82F6"
                opacity="0.8"
                initial={{ offsetDistance: "0%" }}
                animate={inView ? { offsetDistance: ["0%", "100%"] } : {}}
                transition={{
                  delay: p.delay,
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: "easeInOut",
                }}
                style={{
                  offsetPath: `path("${p.path}")`,
                }}
              />
            ))}

            {/* ════════════════════════════════════════ */}
            {/* ORCHESTRATION CHIP (center)              */}
            {/* ════════════════════════════════════════ */}

            <motion.g
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            >
              {/* Outer glow */}
              <rect
                x={270} y={260} width={360} height={230} rx={22}
                fill="none"
                stroke="rgba(59,130,246,0.08)"
                strokeWidth="20"
                filter="url(#chip-glow)"
              />

              {/* Chip border (double) */}
              <rect
                x={280} y={270} width={340} height={210} rx={18}
                fill="none"
                stroke="rgba(59,130,246,0.3)"
                strokeWidth="2"
              />
              <rect
                x={290} y={280} width={320} height={190} rx={14}
                fill={c.panelSolid}
                stroke="rgba(59,130,246,0.15)"
                strokeWidth="1"
              />

              {/* Chip inner content */}
              <text
                x={450} y={325}
                textAnchor="middle"
                fill={c.text} fontSize="22" fontWeight="700"
                fontFamily="var(--font-heading)"
              >
                Orchestration
              </text>
              <text
                x={450} y={350}
                textAnchor="middle"
                fill={c.text} fontSize="22" fontWeight="700"
                fontFamily="var(--font-heading)"
              >
                Layer
              </text>

              {/* Divider line */}
              <line x1={340} y1={368} x2={560} y2={368} stroke="rgba(59,130,246,0.15)" strokeWidth="1" />

              {/* Capabilities */}
              {[
                "Invoicing (Billing/Payments)",
                "Routing (Skill matching/Traffic)",
                "Automatic Validation (Photo checks)",
              ].map((item, i) => (
                <g key={i}>
                  {/* Arrow indicator */}
                  <text
                    x={340} y={393 + i * 24}
                    fill="rgba(59,130,246,0.5)" fontSize="12"
                    fontFamily="var(--font-mono), monospace"
                  >
                    →
                  </text>
                  <text
                    x={360} y={393 + i * 24}
                    fill={c.textMuted} fontSize="13"
                    fontFamily="var(--font-body)"
                  >
                    {item}
                  </text>
                </g>
              ))}
            </motion.g>

            {/* ════════════════════════════════════════ */}
            {/* SIDE CIRCUIT TRACES (decorative)         */}
            {/* ════════════════════════════════════════ */}

            {/* Left side traces coming out of chip */}
            {[310, 340, 370, 400].map((y, i) => (
              <motion.path
                key={`lt-${i}`}
                d={`M280 ${y} L${240 - i * 20} ${y} L${240 - i * 20} ${y + 30 + i * 15}`}
                fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
              />
            ))}
            {/* Dots at trace ends */}
            {[310, 340, 370, 400].map((y, i) => (
              <motion.circle
                key={`ld-${i}`}
                cx={240 - i * 20} cy={y + 30 + i * 15} r="2.5"
                fill="rgba(59,130,246,0.25)"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 + i * 0.1 }}
              />
            ))}

            {/* Right side traces coming out of chip */}
            {[310, 340, 370, 400].map((y, i) => (
              <motion.path
                key={`rt-${i}`}
                d={`M620 ${y} L${660 + i * 20} ${y} L${660 + i * 20} ${y + 30 + i * 15}`}
                fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
              />
            ))}
            {[310, 340, 370, 400].map((y, i) => (
              <motion.circle
                key={`rd-${i}`}
                cx={660 + i * 20} cy={y + 30 + i * 15} r="2.5"
                fill="rgba(59,130,246,0.25)"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 + i * 0.1 }}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
