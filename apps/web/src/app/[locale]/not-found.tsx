import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <Container className="relative text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
          404
        </p>
        <h1 className="mt-4 text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-stone-900">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-[1.7] text-stone-500">
          {t("body")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          {t("back")}
        </Link>
      </Container>
    </main>
  );
}
