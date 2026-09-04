"use client";

import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/container";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

// Price in euros. Only the amount and the accent live in code — the tier's
// name and its response window come from the catalog, because both are read
// aloud to a French customer as often as an English one.
const TIERS = [
  { id: "relaxed", price: 150, accent: false },
  { id: "standard", price: 200, accent: false },
  { id: "urgent", price: 300, accent: true },
  { id: "critical", price: 420, accent: false },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");
  const format = useFormatter();

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-50/80 to-transparent" />
      <Container className="relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="max-w-2xl"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="mt-5 text-base leading-[1.7] text-stone-500">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TIERS.map((tier) => {
            const name = t(`tiers.${tier.id}.name`);
            return (
              <motion.div
                key={tier.id}
                variants={fadeInUp}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/30",
                  tier.accent
                    ? "border-brand/40 shadow-lg shadow-brand/10"
                    : "border-stone-200/60 hover:border-stone-300/80",
                )}
              >
                {tier.accent && (
                  <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {t("mostPicked")}
                  </span>
                )}

                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-stone-900">
                  {name}
                </h3>
                {/* Reserved height: the French response windows are longer
                    than the English ones ("Sous 4 heures, 24h/24 et 7j/7"
                    wraps where "Within 4 hours, 24/7" does not), and without
                    it that one card pushes its price out of line with the
                    other three. */}
                <p className="mt-1 min-h-[2.6em] font-mono text-[11px] leading-[1.3] text-stone-400">
                  {t(`tiers.${tier.id}.response`)}
                </p>

                <div className="mt-3 flex items-baseline gap-1">
                  {/* fr-FR renders "150 €", en-GB renders "€150" — separator
                      and symbol position both differ, so never hand-format. */}
                  <span className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight tabular-nums text-stone-900">
                    {format.number(tier.price, {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-xs text-stone-400">
                    {t("perIntervention")}
                  </span>
                </div>

                <a
                  href={site.clientSignUp}
                  className={cn(
                    "mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all",
                    tier.accent
                      ? "bg-brand text-white shadow-sm shadow-brand/20 hover:brightness-110"
                      : "border border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
                  )}
                >
                  {t("book", { tier: name })}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
            {t("includedLabel")}
          </span>
          {[t("included1"), t("included2")].map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-sm text-stone-600">
              <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
              {f}
            </span>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-stone-400">
          {t("footnote")}
        </p>
      </Container>
    </section>
  );
}
