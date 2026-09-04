import { useTranslations } from "next-intl";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";

/**
 * Shell for the legal pages.
 *
 * Privacy and terms carry a visible "in preparation" state rather than
 * placeholder prose. Translating legal text automatically would produce a
 * document that reads as binding and is not — worse than publishing nothing,
 * and worse than saying plainly that counsel is drafting it.
 */
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations("legalPages");

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

            {children ?? (
              <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-widest text-amber-700">
                  {t("draftLabel")}
                </p>
                <p className="mt-3 text-[15px] leading-[1.7] text-stone-600">
                  {t.rich("draftBody", {
                    email: () => (
                      <a
                        href={`mailto:${site.contactEmail}`}
                        className="font-medium text-brand hover:brightness-90"
                      >
                        {site.contactEmail}
                      </a>
                    ),
                  })}
                </p>
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
