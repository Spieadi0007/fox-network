import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";

/** Shell shared by the privacy policy, the terms and the legal notice. */
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden pb-24 pt-12">
        <div className="mesh-gradient pointer-events-none absolute inset-0" />

        <Container className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            FoxNetwork
          </Link>

          <div className="mx-auto mt-10 max-w-2xl">
            <h1 className="text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
              {title}
            </h1>

            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
