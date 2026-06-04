"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/marketing/container";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { MapPin, ArrowRight } from "lucide-react";

const DEPARTEMENTS = [
  { code: "75", name: "Paris" },
  { code: "92", name: "Hauts-de-Seine" },
  { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d'Oise" },
  { code: "78", name: "Yvelines" },
  { code: "77", name: "Seine-et-Marne" },
  { code: "91", name: "Essonne" },
];

// OpenStreetMap embed of Île-de-France with a marker on Paris (keyless).
const MAP_SRC =
  "https://www.openstreetmap.org/export/embed.html?bbox=1.45%2C48.12%2C3.56%2C49.24&layer=mapnik&marker=48.8566%2C2.3522";

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

            {/* Right — live map of Île-de-France */}
            <div className="relative min-h-[340px] border-t border-stone-200/70 lg:border-l lg:border-t-0">
              <iframe
                title="FoxNetwork service area — Paris & Île-de-France"
                src={MAP_SRC}
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://www.openstreetmap.org/#map=9/48.85/2.35"
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium text-stone-500 shadow-sm backdrop-blur-sm hover:text-stone-700"
              >
                View larger map
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
