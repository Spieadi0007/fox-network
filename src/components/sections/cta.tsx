"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="py-28 lg:py-36">
      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="relative overflow-hidden rounded-[2rem] bg-stone-900 px-8 py-24 sm:px-16"
        >
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-fox-orange/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-fox-amber/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grain" />

          {/* Grid pattern overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }} />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-fox-orange animate-pulse" />
                Limited early access spots
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="mt-8 font-[family-name:var(--font-heading)] text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white"
            >
              Ready to automate your
              <br />
              field operations?
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="mt-5 max-w-md text-[16px] leading-[1.7] text-stone-400"
            >
              Join the operators scaling with less overhead, better quality,
              and complete visibility.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-fox-orange px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-fox-orange/25 transition-all hover:shadow-xl hover:shadow-fox-orange/30 hover:brightness-110"
              >
                Get Early Access
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Talk to Sales
              </a>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-xs text-stone-500"
            >
              No credit card required. Start in under 5 minutes.
            </motion.p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
