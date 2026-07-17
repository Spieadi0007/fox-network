"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ArrowRight, Radar, Navigation, Wrench, FileText, Smartphone } from "lucide-react";

type Visual = "signals" | "route" | "execution" | "invoice" | "phone";

type Stage = {
  stage: string;
  status: string;
  accent: string; // tailwind text color class
  hex: string; // svg stroke/fill color
  icon: typeof Radar;
  title: string;
  desc: string;
  visual: Visual;
};

const stages: Stage[] = [
  {
    stage: "Stage 01",
    status: "Alert Active",
    accent: "text-orange-400",
    hex: "#FB923C",
    icon: Radar,
    title: "Asset Signals",
    desc: "Machines self-report faults. A live map lights up the moment something breaks.",
    visual: "signals",
  },
  {
    stage: "Stage 02",
    status: "Route Gen",
    accent: "text-blue-400",
    hex: "#60A5FA",
    icon: Navigation,
    title: "Dispatch Route",
    desc: "The nearest certified technician is routed automatically — distance, traffic and ETA solved.",
    visual: "route",
  },
  {
    stage: "Stage 03",
    status: "On Site",
    accent: "text-emerald-400",
    hex: "#34D399",
    icon: Wrench,
    title: "Execution",
    desc: "A certified professional restores the machine to peak operation on site.",
    visual: "execution",
  },
];

/* ── Reusable bits ───────────────────────────────────────────── */

function MapPin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${y} c -5 -6 -5 -11 0 -11 c 5 0 5 5 0 11 z`} fill={color} />
      <circle cx={x} cy={y - 6.5} r={2} fill="#0a0a0a" />
    </g>
  );
}

function StageVisual({ visual, hex }: { visual: Visual; hex: string }) {
  const box =
    "relative h-24 w-full overflow-hidden rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-2)]";

  switch (visual) {
    /* ── Stage 1: live asset map with real sites & statuses ── */
    case "signals":
      return (
        <div className={box}>
          <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
            <g stroke={hex} strokeOpacity="0.08" strokeWidth="1">
              <line x1="0" y1="24" x2="200" y2="24" />
              <line x1="0" y1="48" x2="200" y2="48" />
              <line x1="0" y1="72" x2="200" y2="72" />
              <line x1="50" y1="0" x2="50" y2="96" />
              <line x1="100" y1="0" x2="100" y2="96" />
              <line x1="150" y1="0" x2="150" y2="96" />
            </g>
            <path
              d="M34 34 Q62 20 96 28 Q136 22 158 44 Q170 58 150 70 Q118 84 88 74 Q54 80 40 60 Q28 46 34 34 Z"
              fill={hex}
              fillOpacity="0.05"
              stroke={hex}
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            <MapPin x={78} y={52} color="#34D399" />
            <MapPin x={108} y={34} color="#FB923C" />
            <MapPin x={144} y={66} color="#F43F5E" />
            <circle cx="144" cy="59.5" r="9" fill="none" stroke="#F43F5E" strokeOpacity="0.4">
              <animate attributeName="r" values="4;13" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.5;0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> 12 sites live
          </span>
          <span className="absolute left-[38%] top-[42%] text-[7px] font-medium text-emerald-300/90">Paris ✓</span>
          <span className="absolute left-[54%] top-[22%] text-[7px] font-medium text-orange-300/90">Berlin ⚠</span>
          <span className="absolute left-[68%] top-[72%] text-[7px] font-bold text-rose-400">Madrid · FAULT</span>
        </div>
      );

    /* ── Stage 2: real dispatch route with named tech, ETA & distance ── */
    case "route":
      return (
        <div className={box}>
          <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
            <g stroke={hex} strokeOpacity="0.07" strokeWidth="1">
              <line x1="0" y1="32" x2="200" y2="32" />
              <line x1="0" y1="64" x2="200" y2="64" />
              <line x1="66" y1="0" x2="66" y2="96" />
              <line x1="133" y1="0" x2="133" y2="96" />
            </g>
            <path
              d="M32 72 C 68 72, 88 30, 152 28"
              fill="none"
              stroke={hex}
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="72" r="4.5" fill={hex} />
            <circle cx="32" cy="72" r="8" fill="none" stroke={hex} strokeOpacity="0.4" strokeWidth="1" />
            <MapPin x={152} y={28} color="#F43F5E" />
            <circle r="3.5" fill="#fff">
              <animateMotion path="M32 72 C 68 72, 88 30, 152 28" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-medium text-white/80">
            Marco · nearest tech
          </span>
          <span className="absolute right-1.5 top-1.5 rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
            ETA 14 min · 8.2 km
          </span>
        </div>
      );

    /* ── Stage 3: technician actively fixing a machine ── */
    case "execution":
      return (
        <div className={box}>
          <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
            <line x1="24" y1="82" x2="176" y2="82" stroke={hex} strokeOpacity="0.2" strokeWidth="1.5" />
            <rect x="116" y="24" width="52" height="58" rx="4" fill={hex} fillOpacity="0.06" stroke={hex} strokeWidth="1.6" />
            <line x1="124" y1="40" x2="160" y2="40" stroke={hex} strokeOpacity="0.5" strokeWidth="1.4" />
            <line x1="124" y1="50" x2="160" y2="50" stroke={hex} strokeOpacity="0.5" strokeWidth="1.4" />
            <line x1="124" y1="60" x2="160" y2="60" stroke={hex} strokeOpacity="0.5" strokeWidth="1.4" />
            <circle cx="128" cy="32" r="2" fill="#34D399" />
            <circle cx="136" cy="32" r="2" fill="#FB923C">
              <animate attributeName="fill-opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <g stroke="#FBBF24" strokeWidth="1.4" strokeLinecap="round">
              <line x1="112" y1="58" x2="108" y2="54" />
              <line x1="112" y1="62" x2="107" y2="62" />
              <line x1="112" y1="66" x2="108" y2="70" />
              <animateTransform attributeName="transform" type="scale" values="1;1.25;1" dur="0.5s" repeatCount="indefinite" additive="sum" />
            </g>
            <g transform="translate(141,66)">
              <g>
                <circle r="6" fill="none" stroke={hex} strokeWidth="1.6" />
                <circle r="2" fill={hex} />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <line key={a} x1="0" y1="-6" x2="0" y2="-9" stroke={hex} strokeWidth="1.6" transform={`rotate(${a})`} />
                ))}
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
              </g>
            </g>
            <circle cx="58" cy="34" r="9" fill={hex} fillOpacity="0.12" stroke={hex} strokeWidth="1.6" />
            <path d="M44 82 L44 58 Q44 46 58 46 Q72 46 72 58 L72 82" fill={hex} fillOpacity="0.12" stroke={hex} strokeWidth="1.6" />
            <line x1="68" y1="56" x2="106" y2="62" stroke={hex} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M106 62 l7 -3 m-7 3 l3 7" stroke={hex} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </svg>
          <span className="absolute left-1.5 top-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white/80">
            WO-2851 · HVAC
          </span>
          <span className="absolute bottom-1.5 right-1.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-bold text-emerald-300">
            Restoring…
          </span>
        </div>
      );

    /* ── Stage 4A: client invoice on desktop ── */
    case "invoice":
      return (
        <div className={`${box} flex items-center justify-center p-2`}>
          <div className="w-full max-w-[150px] overflow-hidden rounded-md border border-[var(--p-border)] bg-[var(--p-bg)] shadow-sm">
            <div className="flex items-center gap-1 border-b border-[var(--p-border)] px-1.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
              <span className="ml-1 text-[7px] font-semibold text-[var(--p-text-subtle)]">Invoice · INV-2851</span>
            </div>
            <div className="divide-y divide-[var(--p-border)]">
              {[
                { site: "Berlin · HVAC", val: "€150" },
                { site: "Munich · Cooling", val: "€300" },
              ].map((r) => (
                <div key={r.site} className="flex items-center justify-between px-1.5 py-[3px]">
                  <span className="text-[7.5px] text-[var(--p-text-muted)]">{r.site}</span>
                  <span className="text-[7.5px] font-semibold text-[var(--p-text)]">{r.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-violet-500/10 px-1.5 py-[3px]">
                <span className="text-[7.5px] font-bold text-violet-300">Total</span>
                <span className="text-[8px] font-bold text-violet-300">€450</span>
              </div>
            </div>
          </div>
        </div>
      );

    /* ── Stage 4B: technician payout receipt on phone ── */
    case "phone":
      return (
        <div className={`${box} flex items-center justify-center`}>
          <div className="flex h-[84px] w-[58px] flex-col items-center rounded-[10px] border border-[var(--p-border)] bg-[var(--p-bg)] px-1.5 pb-1.5 pt-1 shadow-sm">
            <span className="text-[6px] font-bold tracking-[0.15em] text-[var(--p-text-subtle)]">FOX PAY</span>
            <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/60 text-[9px] text-emerald-400">✓</div>
            <span className="mt-1 text-[13px] font-bold leading-none text-emerald-400">+€125</span>
            <span className="mt-0.5 text-[6px] text-[var(--p-text-muted)]">Marco D. · WO-2851</span>
            <div className="my-1 w-full border-t border-dashed border-[var(--p-border)]" />
            <span className="mt-auto text-[6px] font-bold tracking-[0.15em] text-emerald-400">PAID · 14:32</span>
          </div>
        </div>
      );
  }
}

/* ── Card shells ─────────────────────────────────────────────── */

function StageCard({ s }: { s: Stage }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex h-full w-full flex-col rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4 transition-colors duration-300 hover:bg-[var(--p-surface-2)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--p-text-subtle)]">{s.stage}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${s.accent}`}>{s.status}</span>
      </div>
      <div className="mt-3">
        <StageVisual visual={s.visual} hex={s.hex} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <s.icon className={`h-4 w-4 shrink-0 ${s.accent}`} />
        <h3 className="font-[family-name:var(--font-heading)] text-[15px] font-bold text-[var(--p-text)]">{s.title}</h3>
      </div>
      <p className="mt-2 text-[13px] leading-[1.6] text-[var(--p-text-muted)]">{s.desc}</p>
    </motion.div>
  );
}

function ArrowLink() {
  return <ArrowRight className="mx-1 hidden h-4 w-4 shrink-0 text-[var(--p-text-subtle)] lg:block" />;
}

export function Orchestration() {
  return (
    <section className="relative flex min-h-full items-center py-8 lg:py-12">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        {/* Title */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center"
        >
          <h2 className="mx-auto max-w-4xl font-[family-name:var(--font-heading)] text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold leading-[1.12] tracking-[-0.03em]">
            The Platform:{" "}
            <span className="text-blue-500">
              From IoT alert to resolved incident in a single, unified journey
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-[1.6] text-[var(--p-text-subtle)]">
            An orchestrated intervention flow from predictive machine signal to verified compliance.
          </p>
        </motion.div>

        {/* ── Stage flow ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-10 flex flex-col items-stretch gap-3 lg:flex-row"
        >
          {/* Stages 01–03 */}
          {stages.map((s) => (
            <div key={s.title} className="flex flex-1 items-center lg:min-w-0">
              <StageCard s={s} />
              <ArrowLink />
            </div>
          ))}

          {/* Stage 04 — one bubble, two outcomes */}
          <motion.div
            variants={fadeInUp}
            className="flex h-full flex-col rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface)] p-4 transition-colors duration-300 hover:bg-[var(--p-surface-2)] lg:flex-[2.3]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--p-text-subtle)]">Stage 04</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">Invoice &amp; Payout</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4">
              {/* Client Invoice */}
              <div>
                <StageVisual visual="invoice" hex="#A78BFA" />
                <div className="mt-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-violet-400" />
                  <h3 className="font-[family-name:var(--font-heading)] text-[15px] font-bold text-[var(--p-text)]">Client Invoice</h3>
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--p-text-muted)]">
                  The client is auto-invoiced for every intervention across their sites.
                </p>
              </div>

              {/* Technician Payout */}
              <div>
                <StageVisual visual="phone" hex="#34D399" />
                <div className="mt-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 shrink-0 text-emerald-400" />
                  <h3 className="font-[family-name:var(--font-heading)] text-[15px] font-bold text-[var(--p-text)]">Technician Payout</h3>
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--p-text-muted)]">
                  The technician gets a verified receipt and instant payout to their phone.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
