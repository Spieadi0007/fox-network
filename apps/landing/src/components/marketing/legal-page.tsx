import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/marketing/container";

// Shared shell for the privacy policy and terms. Legal text is read, not
// skimmed, so it gets a narrower measure than the marketing pages and a
// plain type scale rather than the landing page's display sizes.

export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** Human-readable date this version took effect. */
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24">
        <Container className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-[-0.03em] text-stone-900">
            {title}
          </h1>
          <p className="mt-3 text-[13px] text-stone-400">
            Last updated {updated}
          </p>
          <p className="mt-6 text-[15px] leading-[1.75] text-stone-600">
            {intro}
          </p>
          <div className="mt-12 space-y-10">{children}</div>

          <div className="mt-16 rounded-xl border border-stone-200 bg-stone-50 px-6 py-5">
            <h2 className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-stone-900">
              Contact us
            </h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-stone-600">
              Questions about this document, or about the data we hold — write
              to{" "}
              <a
                href="mailto:contact@foxnetwork.io"
                className="font-medium text-fox-orange hover:underline"
              >
                contact@foxnetwork.io
              </a>{" "}
              and we will respond within 30 days.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-heading)] text-[19px] font-bold tracking-[-0.02em] text-stone-900">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-[1.75] text-stone-600">
        {children}
      </div>
    </section>
  );
}

/** A definition-style list, for data categories and similar. */
export function Rows({
  rows,
}: {
  rows: { term: string; detail: string }[];
}) {
  return (
    <dl className="mt-4 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
      {rows.map((r) => (
        <div key={r.term} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-[14px] font-medium text-stone-900">{r.term}</dt>
          <dd className="text-[14px] leading-[1.7] text-stone-600 sm:col-span-2">
            {r.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}
