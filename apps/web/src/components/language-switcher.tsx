"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, LOCALE_LABELS, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * Switching language keeps you on the page you were reading. `usePathname`
 * from the i18n navigation helpers returns the path with the locale prefix
 * already stripped, so the same value can be re-rendered under the other
 * locale — landing on the home page every time you switch is the bug this
 * avoids.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === active) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error — pathname is a known route; params carries any
        // dynamic segments the current route was matched with.
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-stone-200/80 bg-white/70 p-0.5",
        pending && "opacity-60",
        className,
      )}
      role="group"
      aria-label={t("switchLanguage")}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-current={isActive ? "true" : undefined}
            title={LOCALE_LABELS[locale]}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase transition-colors",
              isActive
                ? "bg-stone-900 text-white"
                : "text-stone-500 hover:text-stone-900",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
