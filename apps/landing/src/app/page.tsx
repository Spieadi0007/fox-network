import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServicesHero } from "@/components/sections/services-hero";
import { Networks } from "@/components/sections/networks";
import { Coverage } from "@/components/sections/coverage";
import { SlaPricing } from "@/components/sections/sla-pricing";
import { BookingFlow } from "@/components/sections/booking-flow";
import { WhatYouGet } from "@/components/sections/what-you-get";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <ServicesHero />
        <Networks />
        <Coverage />
        <SlaPricing />
        <BookingFlow />
        <WhatYouGet />

        <section id="cta" className="py-24 lg:py-32">
          <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 px-8 py-20 text-center sm:px-16">
              <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-fox-orange/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-fox-amber/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 grain" />

              <div className="relative z-10 flex flex-col items-center">
                <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white">
                  Your network, kept up.
                </h2>
                <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-stone-400">
                  Spin up a client workspace, add your first asset, and book an
                  intervention in under five minutes.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/client/signup"
                    className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-fox-orange px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-fox-orange/25 transition-all hover:shadow-xl hover:shadow-fox-orange/30 hover:brightness-110"
                  >
                    Book first intervention
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/client/signup?intent=quote"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10"
                  >
                    Get a quote
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
