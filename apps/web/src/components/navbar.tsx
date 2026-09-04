"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/container";
import { LanguageSwitcher } from "@/components/language-switcher";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { key: "networks", hash: "#networks" },
  { key: "pricing", hash: "#pricing" },
  { key: "booking", hash: "#how-to-book" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-stone-200/60 bg-white/70 backdrop-blur-2xl"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fox-logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 transition-transform duration-300 group-hover:-rotate-3"
          />
          <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
            Fox<span className="text-brand">Network</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <Link
              key={s.key}
              href={{ pathname: "/", hash: s.hash }}
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-stone-500 transition-all hover:bg-stone-100/60 hover:text-stone-900"
            >
              {t(s.key)}
            </Link>
          ))}

          <LanguageSwitcher className="ml-3" />

          <div className="ml-3 h-5 w-px bg-stone-200" />

          <a
            href={site.clientSignIn}
            className="ml-3 rounded-lg px-4 py-2 text-[13px] font-medium text-stone-500 transition-all hover:bg-stone-100/60 hover:text-stone-900"
          >
            {t("signIn")}
          </a>
          <a
            href={site.clientSignUp}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-stone-800"
          >
            {t("cta")}
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/60 text-stone-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="border-b border-stone-200/60 bg-white/95 backdrop-blur-2xl md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {SECTIONS.map((s) => (
              <Link
                key={s.key}
                href={{ pathname: "/", hash: s.hash }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                onClick={() => setMobileOpen(false)}
              >
                {t(s.key)}
              </Link>
            ))}
            <a
              href={site.clientSignIn}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900"
            >
              {t("signIn")}
            </a>
            <a
              href={site.clientSignUp}
              className="mt-2 rounded-full bg-stone-900 px-5 py-3 text-center text-sm font-medium text-white"
            >
              {t("cta")}
            </a>
          </Container>
        </div>
      )}
    </nav>
  );
}
