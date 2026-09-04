"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/container";
import { Link } from "@/i18n/navigation";
import { fadeInUp, viewportConfig } from "@/lib/animations";

// The eight départements of Île-de-France. Names and numbers are the official
// ones and are identical in both locales, so they stay in code rather than
// being duplicated into two message catalogs that could drift apart.
type Departement = {
  code: string;
  name: string;
  x: number;
  y: number;
  hub?: boolean;
};

const DEPARTEMENTS: Departement[] = [
  { code: "75", name: "Paris", x: 236, y: 222, hub: true },
  { code: "92", name: "Hauts-de-Seine", x: 200, y: 232 },
  { code: "93", name: "Seine-Saint-Denis", x: 284, y: 186 },
  { code: "94", name: "Val-de-Marne", x: 288, y: 262 },
  { code: "95", name: "Val-d'Oise", x: 246, y: 108 },
  { code: "78", name: "Yvelines", x: 116, y: 232 },
  { code: "77", name: "Seine-et-Marne", x: 384, y: 268 },
  { code: "91", name: "Essonne", x: 182, y: 348 },
];

const HUB = DEPARTEMENTS.find((d) => d.hub)!;
const SPOKES = DEPARTEMENTS.filter((d) => !d.hub);

// Stylised region outline, wider on the right for Seine-et-Marne.
const REGION_PATH =
  "M150 60 C220 48 300 50 344 76 C402 96 456 132 458 202 C460 272 430 342 368 396 C320 432 250 420 200 396 C150 372 108 360 88 318 C58 280 48 240 54 190 C60 138 96 74 150 60 Z";

export function Coverage() {
  const t = useTranslations("coverage");

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
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-3 py-1 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                  {t("badge")}
                </span>
              </div>

              <h2 className="mt-5 text-balance font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3.2vw,2.25rem)] font-bold leading-[1.12] tracking-[-0.03em] text-stone-900">
                {t("titleLine1")}
                <br />
                <span className="text-gradient-brand">{t("titleLine2")}</span>
              </h2>

              <p className="mt-4 max-w-md text-[15px] leading-[1.65] text-stone-500">
                {t("body")}
              </p>

              <ul className="mt-7 flex list-none flex-wrap gap-2 p-0">
                {DEPARTEMENTS.map((d) => (
                  <li
                    key={d.code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-[12px] font-medium text-stone-600"
                  >
                    <span className="font-mono text-[10px] text-brand">
                      {d.code}
                    </span>
                    {d.name}
                  </li>
                ))}
              </ul>

              <Link
                href={{ pathname: "/quote", query: { intent: "waitlist" } }}
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-stone-900 transition-colors hover:text-brand"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                {t("waitlist")}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>

            <div className="relative flex items-center justify-center overflow-hidden border-t border-stone-200/70 bg-gradient-to-br from-stone-50 via-white to-blue-50/40 p-8 lg:border-l lg:border-t-0">
              <svg
                viewBox="0 0 480 440"
                className="h-auto w-full max-w-[440px]"
                role="img"
                aria-label={t("mapLabel")}
              >
                <defs>
                  <pattern id="cov-dots" width="20" height="20" patternUnits="userSpaceOnUse">
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

                <path d={REGION_PATH} fill="url(#cov-fill)" />
                <rect width="480" height="440" fill="url(#cov-dots)" clipPath="url(#cov-clip)" />

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

                {SPOKES.map((d, i) => (
                  <motion.line
                    key={`line-${d.code}`}
                    x1={HUB.x}
                    y1={HUB.y}
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

                {SPOKES.map((d, i) => (
                  <motion.g
                    key={d.code}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.6 + i * 0.1,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
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

                <circle cx={HUB.x} cy={HUB.y} r="18" fill="rgba(59,130,246,0.16)" className="animate-glow" />
                <circle cx={HUB.x} cy={HUB.y} r="9" fill="#3B82F6" />
                <circle cx={HUB.x} cy={HUB.y} r="3.5" fill="white" />
                <text
                  x={HUB.x}
                  y={HUB.y - 24}
                  textAnchor="middle"
                  className="font-[family-name:var(--font-heading)]"
                  fontSize="14"
                  fontWeight="700"
                  fill="#1c1917"
                >
                  {HUB.name}
                </text>
              </svg>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
