import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { Networks } from "@/components/sections/networks";
import { Coverage } from "@/components/sections/coverage";
import { Pricing } from "@/components/sections/pricing";
import { Booking } from "@/components/sections/booking";
import { Value } from "@/components/sections/value";
import { ClosingCta } from "@/components/sections/closing-cta";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Networks />
        <Coverage />
        <Pricing />
        <Booking />
        <Value />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
