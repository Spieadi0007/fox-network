"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { MapPin, ArrowRight } from "lucide-react";

const DEPARTEMENTS = [
  { code: "75", name: "Paris", x: 236, y: 222, paris: true },
  { code: "92", name: "Hauts-de-Seine", x: 200, y: 232 },
  { code: "93", name: "Seine-Saint-Denis", x: 284, y: 186 },
  { code: "94", name: "Val-de-Marne", x: 288, y: 262 },
  { code: "95", name: "Val-d'Oise", x: 246, y: 108 },
  { code: "78", name: "Yvelines", x: 116, y: 232 },
  { code: "77", name: "Seine-et-Marne", x: 384, y: 268 },
  { code: "91", name: "Essonne", x: 182, y: 348 },
];

const PARIS = DEPARTEMENTS.find((d) => d.paris)!;

// Stylised Île-de-France outline (wider on the right for Seine-et-Marne).
const REGION_PATH =
  "M150 60 C220 48 300 50 344 76 C402 96 456 132 458 202 C460 272 430 342 368 396 C320 432 250 420 200 396 C150 372 108 360 88 318 C58 280 48 240 54 190 C60 138 96 74 150 60 Z";

export function Coverage() {
  return (
    <section id="coverage" className="relative py-24 lg:py-32">
      <Container>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white shadow-sm"
        >
          <div className="grid lg:grid-cols-2">
            {/* Left — copy */}
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-3 py-1 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                  Now live
                </span>
              </div>

              <h2 className="mt-5 font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3.2vw,2.25rem)] font-bold leading-[1.12] tracking-[-0.03em] text-stone-900">
                We&apos;re starting in
                <br />
                Paris &amp; <span className="text-gradient-fox">Île-de-France</span>
              </h2>

              <p className="mt-4 max-w-md text-[15px] leading-[1.65] text-stone-500">
                Pick any asset in the region — we&apos;re on it. Full coverage
                across all eight départements, with the same SLAs everywhere.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {DEPARTEMENTS.map((d) => (
                  <span
                    key={d.code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-[12px] font-medium text-stone-600"
                  >
                    <span className="font-mono text-[10px] text-fox-orange">
                      {d.code}
                    </span>
                    {d.name}
                  </span>
                ))}
              </div>

              <a
                href="/client/signup?intent=waitlist"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-stone-900 transition-colors hover:text-fox-orange"
              >
                <MapPin className="h-4 w-4" />
                Outside Île-de-France? Join the waitlist
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Right — animated Île-de-France network map */}
            <div className="relative flex items-center justify-center overflow-hidden border-t border-stone-200/70 bg-gradient-to-br from-stone-50 via-white to-blue-50/40 p-8 lg:border-l lg:border-t-0">
              <svg
                viewBox="0 0 480 440"
                className="h-auto w-full max-w-[440px]"
                role="img"
                aria-label="FoxNetwork coverage across Paris and Île-de-France"
              >
                <defs>
                  <pattern
                    id="cov-dots"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(59,130,246,0.12)" />
                  </pattern>
                  <clipPath id="cov-clip">
                    <path d={REGION_PATH} />
                  </clipPath>
                  <radialGradient id="cov-fill" cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.10)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.03)" />
                  </radialGradient>
                </defs>

                {/* Region fill + dotted texture */}
                <path d={REGION_PATH} fill="url(#cov-fill)" />
                <rect
                  width="480"
                  height="440"
                  fill="url(#cov-dots)"
                  clipPath="url(#cov-clip)"
                />

                {/* Region outline draws itself in */}
                <motion.path
                  d={REGION_PATH}
                  fill="none"
                  stroke="rgba(59,130,246,0.55)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />

                {/* Animated network lines flowing from Paris to each département */}
                {DEPARTEMENTS.filter((d) => !d.paris).map((d, i) => (
                  <motion.line
                    key={`line-${d.code}`}
                    x1={PARIS.x}
                    y1={PARIS.y}
                    x2={d.x}
                    y2={d.y}
                    stroke="rgba(59,130,246,0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="2 6"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -16 }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.12,
                    }}
                  />
                ))}

                {/* Département nodes */}
                {DEPARTEMENTS.filter((d) => !d.paris).map((d, i) => (
                  <motion.g
                    key={d.code}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 260, damping: 18 }}
                    style={{ transformOrigin: `${d.x}px ${d.y}px` }}
                  >
                    <circle cx={d.x} cy={d.y} r="6" fill="white" stroke="#3B82F6" strokeWidth="2" />
                    <circle cx={d.x} cy={d.y} r="2.2" fill="#3B82F6" />
                    <text
                      x={d.x}
                      y={d.y - 11}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize="11"
                      fontWeight="600"
                      fill="#57534e"
                    >
                      {d.code}
                    </text>
                  </motion.g>
                ))}

                {/* Paris — pulsing hub */}
                <circle cx={PARIS.x} cy={PARIS.y} r="18" fill="rgba(59,130,246,0.16)" className="animate-glow" />
                <circle cx={PARIS.x} cy={PARIS.y} r="9" fill="#3B82F6" />
                <circle cx={PARIS.x} cy={PARIS.y} r="3.5" fill="white" />
                <text
                  x={PARIS.x}
                  y={PARIS.y - 24}
                  textAnchor="middle"
                  className="font-[family-name:var(--font-heading)]"
                  fontSize="14"
                  fontWeight="700"
                  fill="#1c1917"
                >
                  Paris
                </text>
              </svg>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
