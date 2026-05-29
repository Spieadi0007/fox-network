"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/marketing/container";
import { Button } from "@/components/marketing/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "Networks", href: "/#networks" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How to book", href: "/#how-to-book" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
        <a href="#" className="flex items-center gap-1.5 group">
          <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
          <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
            Fox<span className="text-fox-orange">Network</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-stone-500 transition-all hover:text-stone-900 hover:bg-stone-100/60"
            >
              {link.label}
            </a>
          ))}
          <div className="ml-4 h-5 w-px bg-stone-200" />
          <a
            href="/signin"
            className="ml-4 rounded-lg px-4 py-2 text-[13px] font-medium text-stone-500 transition-all hover:text-stone-900 hover:bg-stone-100/60"
          >
            Sign in
          </a>
          <Button href="/signup" size="md">
            Get Started
          </Button>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/60 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </Container>

      {mobileOpen && (
        <div className="border-b border-stone-200/60 bg-white/95 backdrop-blur-2xl md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/signin"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </a>
            <div className="mt-2">
              <Button href="/signup" size="md" className="w-full">
                Get Started
              </Button>
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
}
