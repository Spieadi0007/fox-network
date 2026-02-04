"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ScanEye, ShieldAlert, BookOpen } from "lucide-react";
import { usePitchColors } from "@/app/pitch/pitch-theme";

const features = [
  { icon: ScanEye, title: "Visual QA", desc: "Detects damage, verifies steps, checks compliance.", color: "#3B82F6" },
  { icon: ShieldAlert, title: "Fraud Detection", desc: "Flags reused images, bad timestamps, GPS mismatches.", color: "#F59E0B" },
  { icon: BookOpen, title: "Contextual SOPs", desc: "Real-time guidance for each technician's situation.", color: "#8B5CF6" },
];

function ValidationFlow({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 800 260" className="w-full">
      {/* ── Step 1: Photo uploaded ── */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <rect x="20" y="30" width="150" height="200" rx="10" fill={c.uiBg2} stroke={c.strokeLight} strokeWidth="1" />
        {/* Image area */}
        <rect x="30" y="40" width="130" height="130" rx="6" fill={c.uiElement} />
        {/* Charger silhouette */}
        <rect x="75" y="58" width="40" height="90" rx="6" fill={c.subtle} stroke="rgba(59,130,246,0.2)" strokeWidth="0.8" />
        <rect x="82" y="68" width="26" height="18" rx="3" fill="rgba(59,130,246,0.08)" />
        <circle cx="95" cy="110" r="5" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8" />
        <rect x="87" y="128" width="16" height="4" rx="2" fill="rgba(34,197,94,0.3)" />
        <line x1="60" y1="148" x2="130" y2="148" stroke={c.strokeLight} strokeWidth="0.5" />
        {/* Metadata */}
        <text x="36" y="184" fill={c.textDim} fontSize="8" fontWeight="600" fontFamily="var(--font-body)">IMG_4021.jpg</text>
        <text x="36" y="196" fill={c.textDimmer} fontSize="7" fontFamily="var(--font-mono), monospace">40.4168°N, 3.7038°W</text>
        <text x="36" y="208" fill={c.textDimmer} fontSize="7" fontFamily="var(--font-mono), monospace">2024-03-15 09:42:18</text>
        <rect x="36" y="214" width="50" height="10" rx="5" fill="rgba(59,130,246,0.12)" />
        <text x="61" y="222" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="6" fontWeight="600" fontFamily="var(--font-body)">Uploaded</text>
      </motion.g>

      {/* ── Arrow 1 ── */}
      <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 0.4 }}>
        <line x1="180" y1="130" x2="220" y2="130" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M216 126 L224 130 L216 134" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5" />
      </motion.g>

      {/* ── Step 2: AI Analysis ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <rect x="230" y="20" width="340" height="220" rx="12" fill={c.uiBg2} stroke="rgba(59,130,246,0.2)" strokeWidth="1.5" />
        <text x="260" y="46" fill={c.text} fontSize="11" fontWeight="700" fontFamily="var(--font-body)">AI Analysis Engine</text>
        <rect x="460" y="34" width="60" height="14" rx="7" fill="rgba(34,197,94,0.12)" />
        <motion.circle cx="472" cy="41" r="3" fill="rgba(34,197,94,0.6)"
          animate={inView ? { opacity: [0.4, 1, 0.4] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <text x="480" y="44" fill="rgba(34,197,94,0.7)" fontSize="7" fontWeight="600" fontFamily="var(--font-body)">Live</text>

        {/* Mini photo with scan */}
        <rect x="248" y="56" width="90" height="90" rx="6" fill={c.uiElement} />
        <rect x="275" y="68" width="30" height="60" rx="4" fill={c.subtle} stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" />
        <rect x="280" y="74" width="20" height="12" rx="2" fill="rgba(59,130,246,0.06)" />
        {/* Scan line */}
        <motion.line
          x1="252" x2="334" y1="80" y2="80"
          stroke="rgba(59,130,246,0.4)" strokeWidth="1"
          animate={inView ? { y1: [60, 140, 60], y2: [60, 140, 60] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Detection box */}
        <motion.rect x="270" y="64" width="40" height="68" rx="3" fill="none"
          stroke="rgba(34,197,94,0.5)" strokeWidth="1" strokeDasharray="3 2"
          initial={{ opacity: 0 }} animate={inView ? { opacity: [0, 1, 0.7] } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
        />
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.8 }}>
          <rect x="272" y="60" width="36" height="8" rx="2" fill="rgba(34,197,94,0.2)" />
          <text x="290" y="66" textAnchor="middle" fill="rgba(34,197,94,0.8)" fontSize="5" fontWeight="600" fontFamily="var(--font-mono), monospace">CHARGER OK</text>
        </motion.g>

        {/* Checks panel */}
        <rect x="350" y="56" width="200" height="90" rx="6" fill={c.uiElement} />
        <text x="362" y="72" fill={c.textDim} fontSize="8" fontWeight="700" fontFamily="var(--font-body)">Validation Checks</text>
        {[
          "Equipment detected",
          "Installation correct",
          "GPS matches site",
          "Timestamp valid",
          "Image is original",
        ].map((label, i) => (
          <motion.g key={i} initial={{ opacity: 0, x: -5 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1.2 + i * 0.15, duration: 0.3 }}>
            <text x="362" y={86 + i * 11} fill={c.textMuted} fontSize="7" fontFamily="var(--font-body)">{label}</text>
            <rect x="508" y={79 + i * 11} width="28" height="9" rx="4.5" fill="rgba(34,197,94,0.12)" />
            <text x="522" y={86 + i * 11} textAnchor="middle" fill="rgba(34,197,94,0.7)" fontSize="5.5" fontWeight="700" fontFamily="var(--font-mono), monospace">Pass</text>
          </motion.g>
        ))}

        {/* Confidence bar */}
        <rect x="248" y="156" width="302" height="36" rx="6" fill={c.uiElement} />
        <text x="260" y="172" fill={c.textDim} fontSize="7.5" fontWeight="600" fontFamily="var(--font-body)">Confidence Score</text>
        <rect x="260" y="178" width="220" height="6" rx="3" fill={c.subtle} />
        <motion.rect x="260" y="178" width="0" height="6" rx="3" fill="#3B82F6"
          animate={inView ? { width: 204 } : {}} transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
        />
        <motion.text x="496" y="184" textAnchor="end" fill="#3B82F6" fontSize="10" fontWeight="700" fontFamily="var(--font-mono), monospace"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2.2 }}
        >97.2%</motion.text>

        {/* SOP line */}
        <rect x="248" y="200" width="302" height="28" rx="6" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.8" />
        <text x="260" y="216" fill="rgba(139,92,246,0.6)" fontSize="6.5" fontWeight="600" fontFamily="var(--font-mono), monospace">SOP:</text>
        <text x="284" y="216" fill={c.textMuted} fontSize="7" fontFamily="var(--font-body)">Cable routing follows EV-INST-003 standard. No deviation.</text>
      </motion.g>

      {/* ── Arrow 2 ── */}
      <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2.0, duration: 0.4 }}>
        <line x1="580" y1="130" x2="620" y2="130" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M616 126 L624 130 L616 134" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1.5" />
      </motion.g>

      {/* ── Step 3: Result ── */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        <rect x="630" y="50" width="150" height="160" rx="10" fill={c.uiBg2} stroke="rgba(34,197,94,0.25)" strokeWidth="1.5" />
        <circle cx="705" cy="100" r="24" fill="rgba(34,197,94,0.1)" />
        <circle cx="705" cy="100" r="16" fill="rgba(34,197,94,0.15)" />
        <motion.path d="M695 100 L702 107 L716 93" fill="none" stroke="rgba(34,197,94,0.8)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ delay: 2.5, duration: 0.4 }}
        />
        <text x="705" y="140" textAnchor="middle" fill={c.text} fontSize="10" fontWeight="700" fontFamily="var(--font-body)">Validated</text>
        <text x="705" y="154" textAnchor="middle" fill={c.textDimmer} fontSize="7" fontFamily="var(--font-body)">Auto-approved</text>
        <rect x="650" y="164" width="46" height="12" rx="6" fill="rgba(34,197,94,0.12)" />
        <text x="673" y="173" textAnchor="middle" fill="rgba(34,197,94,0.7)" fontSize="6" fontWeight="600" fontFamily="var(--font-body)">No rework</text>
        <rect x="702" y="164" width="58" height="12" rx="6" fill="rgba(59,130,246,0.12)" />
        <text x="731" y="173" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="6" fontWeight="600" fontFamily="var(--font-body)">Invoice ready</text>
      </motion.g>
    </svg>
  );
}

export function AIValidation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative flex min-h-full items-center py-4 lg:py-6">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            AI-Powered Validation.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-[var(--p-text-subtle)]">
            Every photo is analyzed in real time. No manual review needed.
          </p>
        </motion.div>

        {/* ── Visual flow: Photo → AI Analysis → Result ── */}
        <div ref={ref} className="mt-6">
          <ValidationFlow inView={inView} />
        </div>

        {/* ── Three capability cards ── */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="mt-4 grid grid-cols-3 gap-3">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}
              className="flex items-start gap-3 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface)] p-3.5">
              <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${f.color}15` }}>
                <f.icon className="h-4 w-4" style={{ color: f.color }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold">{f.title}</h3>
                <p className="mt-0.5 text-xs leading-[1.5] text-[var(--p-text-muted)]">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
