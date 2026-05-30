"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { MapPin, ArrowRight } from "lucide-react";

// Abstract (not survey-accurate) layout of Île-de-France départements.
// viewBox 0 0 400 380 — Paris (75) centred, petite couronne hugging it,
// grande couronne fanned outward.
const DEPARTEMENTS = [
  { code: "75", name: "Paris", x: 200, y: 188, paris: true, petite: false },
  { code: "92", name: "Hauts-de-Seine", x: 158, y: 190, paris: false, petite: true },
  { code: "93", name: "Seine-Saint-Denis", x: 238, y: 142, paris: false, petite: true },
  { code: "94", name: "Val-de-Marne", x: 234, y: 232, paris: false, petite: true },
  { code: "95", name: "Val-d'Oise", x: 206, y: 78, paris: false, petite: false },
  { code: "78", name: "Yvelines", x: 92, y: 172, paris: false, petite: false },
  { code: "77", name: "Seine-et-Marne", x: 324, y: 196, paris: false, petite: false },
  { code: "91", name: "Essonne", x: 184, y: 302, paris: false, petite: false },
];

const REGION_PATH =
  "M200 40 C262 44 332 70 352 140 C366 196 350 262 300 306 C250 346 168 352 118 310 C68 274 54 200 76 140 C96 84 146 44 200 40 Z";

const PARIS = DEPARTEMENTS.find((d) => d.paris)!;

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

              {/* Département chips */}
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

            {/* Right — map */}
            <div className="relative flex items-center justify-center border-t border-stone-200/70 bg-gradient-to-br from-stone-50 to-white p-8 lg:border-l lg:border-t-0">
              <svg
                viewBox="0 0 400 380"
                className="h-auto w-full max-w-[380px]"
                role="img"
                aria-label="Map of Île-de-France service coverage"
              >
                <defs>
                  <pattern
                    id="cov-grid"
                    width="22"
                    height="22"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1" cy="1" r="1" fill="rgba(0,0,0,0.05)" />
                  </pattern>
                </defs>

                {/* Region blob */}
                <path
                  d={REGION_PATH}
                  fill="rgba(59,130,246,0.06)"
                  stroke="rgba(59,130,246,0.30)"
                  strokeWidth="1.5"
                />
                <path d={REGION_PATH} fill="url(#cov-grid)" opacity="0.7" />

                {/* Connectors from Paris to petite couronne */}
                {DEPARTEMENTS.filter((d) => d.petite).map((d) => (
                  <line
                    key={`l-${d.code}`}
                    x1={PARIS.x}
                    y1={PARIS.y}
                    x2={d.x}
                    y2={d.y}
                    stroke="rgba(59,130,246,0.25)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Département dots */}
                {DEPARTEMENTS.map((d) => {
                  if (d.paris) return null;
                  const r = d.petite ? 5 : 6;
                  return (
                    <g key={d.code}>
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r={r}
                        fill="white"
                        stroke="rgba(59,130,246,0.55)"
                        strokeWidth="2"
                      />
                      <text
                        x={d.x}
                        y={d.y - 11}
                        textAnchor="middle"
                        className="font-mono"
                        fontSize="10"
                        fill="#78716c"
                      >
                        {d.code}
                      </text>
                    </g>
                  );
                })}

                {/* Paris — highlighted with pulsing ring */}
                <circle
                  cx={PARIS.x}
                  cy={PARIS.y}
                  r="16"
                  fill="rgba(59,130,246,0.18)"
                  className="animate-glow"
                />
                <circle cx={PARIS.x} cy={PARIS.y} r="8" fill="#3B82F6" />
                <text
                  x={PARIS.x}
                  y={PARIS.y - 22}
                  textAnchor="middle"
                  className="font-[family-name:var(--font-heading)]"
                  fontSize="13"
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
