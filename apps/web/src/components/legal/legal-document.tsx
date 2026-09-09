import { useTranslations } from "next-intl";

type Section = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

/**
 * Renders a legal document out of the message catalogs.
 *
 * The text lives as data rather than JSX so the French and English versions
 * stay structurally identical — the catalog check fails if one gains a
 * section or a clause the other has not, which for a document that has to say
 * the same thing in two languages is the failure worth catching.
 */
export function LegalDocument({ namespace }: { namespace: "privacy" | "terms" }) {
  const t = useTranslations(namespace);
  const sections = t.raw("sections") as Section[];

  return (
    <div className="mt-8">
      <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
        {t("updated")}
      </p>

      <p className="mt-6 max-w-[68ch] text-[16px] leading-[1.75] text-stone-600">
        {t("intro")}
      </p>

      <ol className="mt-12 list-none space-y-11 p-0">
        {sections.map((section, i) => (
          <li key={section.heading}>
            <h2 className="flex gap-3 font-[family-name:var(--font-heading)] text-[19px] font-bold leading-snug tracking-[-0.02em] text-stone-900">
              <span className="shrink-0 font-mono text-[13px] font-medium text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </h2>

            <div className="mt-3 space-y-3.5 pl-[calc(0.75rem+2ch)]">
              {section.paragraphs.map((p) => (
                <p
                  key={p}
                  className="max-w-[66ch] text-[15px] leading-[1.75] text-stone-600"
                >
                  {p}
                </p>
              ))}

              {section.bullets.length > 0 && (
                <ul className="max-w-[66ch] space-y-2.5 border-l-2 border-stone-200 pl-5">
                  {section.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-[15px] leading-[1.7] text-stone-600"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
