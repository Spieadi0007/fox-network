"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";

const labels = [
  "Cover",
  "Macro Shift",
  "Linear Trap",
  "Pain Points",
  "Consulting",
  "Orchestration",
  "Interfaces",
  "AI Validation",
  "Global Grid",
  "Value Equation",
  "Engagement",
  "Roadmap",
  "Improvement",
  "Team",
  "Let's Talk",
];

export function PitchShell({ children }: { children: React.ReactNode[] }) {
  const [current, setCurrent] = useState(0);
  const transitioning = useRef(false);
  const total = children.length;

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= total || idx === current || transitioning.current) return;
      transitioning.current = true;
      setCurrent(idx);
      setTimeout(() => {
        transitioning.current = false;
      }, 700);
    },
    [current, total],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Mouse wheel
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 20) return;
      if (e.deltaY > 0) next();
      else prev();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  // Arrow keys + Page Up/Down
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, total]);

  // Touch swipe
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#111110] text-white">
      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="h-full w-full overflow-y-auto"
        >
          {children[current]}
        </motion.div>
      </AnimatePresence>

      {/* Dot nav — right side */}
      <nav className="fixed right-5 top-1/2 z-50 -translate-y-1/2 flex-col items-center gap-2.5 hidden lg:flex">
        {labels.map((label, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-center p-1"
            aria-label={label}
          >
            {/* Tooltip */}
            <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-lg bg-stone-800 px-3 py-1.5 text-[11px] font-medium text-stone-300 opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:right-7">
              {label}
            </span>

            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                i === current
                  ? "h-3 w-3 bg-fox-orange shadow-lg shadow-fox-orange/40"
                  : i < current
                    ? "h-2 w-2 bg-fox-orange/40 group-hover:bg-fox-orange/70"
                    : "h-2 w-2 bg-stone-700 group-hover:bg-stone-500",
              )}
            />
          </button>
        ))}
      </nav>

      {/* Bottom bar — slide counter + hint */}
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-4">
        <span className="font-mono text-[11px] text-stone-600">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="text-[11px] text-stone-700">
          Scroll or use arrow keys
        </span>
      </div>

      {/* Mobile prev/next buttons */}
      <div className="fixed bottom-5 right-5 z-50 flex gap-2 lg:hidden">
        <button
          onClick={prev}
          disabled={current === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 bg-stone-900/80 text-stone-400 backdrop-blur-sm transition-colors disabled:opacity-30 hover:text-white"
          aria-label="Previous slide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 15l-6-6-6 6" /></svg>
        </button>
        <button
          onClick={next}
          disabled={current === total - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 bg-stone-900/80 text-stone-400 backdrop-blur-sm transition-colors disabled:opacity-30 hover:text-white"
          aria-label="Next slide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
