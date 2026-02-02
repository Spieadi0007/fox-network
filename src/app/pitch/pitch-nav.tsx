"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

const sections = [
  { id: "cover", label: "Cover" },
  { id: "macro-shift", label: "Macro Shift" },
  { id: "linear-trap", label: "Linear Trap" },
  { id: "pain-points", label: "Pain Points" },
  { id: "consulting", label: "Consulting" },
  { id: "orchestration", label: "Orchestration" },
  { id: "interfaces", label: "Interfaces" },
  { id: "ai-validation", label: "AI Validation" },
  { id: "global-grid", label: "Global Grid" },
  { id: "value-equation", label: "Value Equation" },
  { id: "engagement", label: "Engagement" },
  { id: "roadmap", label: "Roadmap" },
  { id: "improvement", label: "Improvement" },
  { id: "team", label: "Team" },
  { id: "pitch-cta", label: "Let's Talk" },
];

export function PitchNav() {
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + window.innerHeight / 3;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i].id);
      if (el && el.offsetTop <= scrollY) {
        setActive(i);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const goTo = (idx: number) => {
    const el = document.getElementById(sections[idx].id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => goTo(i)}
          className="group relative flex items-center justify-center"
          aria-label={s.label}
        >
          {/* Tooltip */}
          <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-stone-300 opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:right-7">
            {s.label}
          </span>

          {/* Dot */}
          <span
            className={cn(
              "block rounded-full transition-all duration-300",
              i === active
                ? "h-3 w-3 bg-fox-orange shadow-lg shadow-fox-orange/40"
                : "h-2 w-2 bg-stone-600 group-hover:bg-stone-400",
            )}
          />

          {/* Active glow ring */}
          {i === active && (
            <span className="absolute h-5 w-5 animate-ping rounded-full bg-fox-orange/20" />
          )}
        </button>
      ))}
    </nav>
  );
}
